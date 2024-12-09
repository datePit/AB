import { BASE_URL } from '../config.js';

// Очистка корзины
export const clearBasket = async (cookiesUser_csrfToken, cookiesUserPHPSESSID, htmlUser_csrfToken) => {
    try {
        const response = await fetch(`${BASE_URL}/basket/clear`, {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/javascript, */*; q=0.01',
                'x-requested-with': 'XMLHttpRequest',
                cookie: `PHPSESSID=${cookiesUserPHPSESSID}; _csrf=${cookiesUser_csrfToken}`,
                'x-csrf-token': htmlUser_csrfToken,
            },
        });

        if (response.status !== 200) {
            throw new Error(`Ошибка очистки корзины: ${response.status}`);
        }

    } catch (error) {
        console.error('Ошибка при очистке корзины:', error.message);
    }
};