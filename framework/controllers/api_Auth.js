import { BASE_URL } from '../config.js';

// Получение CSRF-токена из HTML и Cookies из ответа на запрос
export const getGuestSecureData = async () => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'GET',
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const html = await response.text();
        const htmlGuest_csrfToken = html.match(/<input[^>]*name="_csrf"[^>]*value="([^"]+)"/)?.[1];

        if (!htmlGuest_csrfToken) {
            throw new Error('html_CSRF-токен в getGuestSecureData не найден');
        }

        const cookies = response.headers.get('set-cookie');
        const cookiesGuest_csrfToken = /_csrf=([^;]+)/.exec(cookies)?.[1];
        const cookiesGuestPHPSESSID = /PHPSESSID=([^;]+)/.exec(cookies)?.[1];

        if (!cookiesGuest_csrfToken || !cookiesGuestPHPSESSID) {
            throw new Error('Не удалось извлечь cookiesGuest_csrfToken или cookiesGuestPHPSESSID в функции getGuestSecureData');
        }

        return { cookiesGuest_csrfToken, cookiesGuestPHPSESSID, htmlGuest_csrfToken };

    } catch (error) {
        console.error('Ошибка в getGuestSecureData:', error.message);
        throw error;
    }
};

// Авторизация
export const getUserSecureData = async (username, password, cookiesGuest_csrfToken, cookiesGuestPHPSESSID, htmlGuest_csrfToken) => {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
                cookie: `PHPSESSID=${cookiesGuestPHPSESSID}; _csrf=${cookiesGuest_csrfToken}`,
            },
            body: `_csrf=${htmlGuest_csrfToken}&LoginForm[username]=${username}&LoginForm[password]=${password}`,
            redirect: 'manual',
        });

        const cookies = response.headers.get('set-cookie');
        const cookiesUser_csrfToken = /_csrf=([^;]+)/.exec(cookies)?.[1];
        const cookiesUserPHPSESSID = /PHPSESSID=([^;]+)/.exec(cookies)?.[1];

        if (!cookiesUser_csrfToken || !cookiesUserPHPSESSID) {
            throw new Error('Не удалось извлечь токены авторизации в getUserSecureData');
        }

        if (response.status !== 302) {
            throw new Error(`Ошибка авторизации: ${response.status}`);
        }
        
        // Производим переход по ссылке из ответа запроса авторизации чтобы получить user токен из html
        const redirectUrl = response.headers.get('location');
        const redirectedResponse = await fetch(redirectUrl, {
            method: 'GET',
            headers: {
                cookie: `PHPSESSID=${cookiesUserPHPSESSID}; _csrf=${cookiesUser_csrfToken}`,
            },
            credentials: 'include',
        });

        const redirectedHtml = await redirectedResponse.text();
        const htmlUser_csrfToken = redirectedHtml.match(/<input[^>]*name="_csrf"[^>]*value="([^"]+)"/)?.[1];

        if (!htmlUser_csrfToken) {
            throw new Error('htmlUser_csrfToken не найден');
        }

        return { cookiesUser_csrfToken, cookiesUserPHPSESSID, htmlUser_csrfToken };
    } catch (error) {
        console.error('Ошибка в getUserSecureData:', error.message);
        throw error;
    }
};