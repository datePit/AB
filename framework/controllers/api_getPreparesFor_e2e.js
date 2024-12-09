//node .\framework\controllers\api_getPreparesFor_e2e.js

import { credentials } from '../config.js';
import { getGuestSecureData, getUserSecureData } from './api_Auth.js';
import { clearBasket } from './api_ClearBasket.js';


// Подготовка данных для UI тестов (данные для пользователя и очистка корзины)
export const getPreparesFor_e2e = async () => {
    try {
        // Получение гостевых данных (токенов)
        const guestData = await getGuestSecureData();
        
        // Авторизация и получение пользовательских данных
        const authData = await getUserSecureData(
            credentials.username,
            credentials.password,
            guestData.cookiesGuest_csrfToken,
            guestData.cookiesGuestPHPSESSID,
            guestData.htmlGuest_csrfToken
        );

        // Очистка корзины
        await clearBasket(
            authData.cookiesUser_csrfToken,
            authData.cookiesUserPHPSESSID,
            authData.htmlUser_csrfToken
        );

        // Возвращаем токены для Playwright
        return {
            cookiesUser_csrfToken: authData.cookiesUser_csrfToken,
            cookiesUserPHPSESSID: authData.cookiesUserPHPSESSID,
            htmlUser_csrfToken: authData.htmlUser_csrfToken
        };
    } catch (error) {
        console.error('Ошибка в цепочке выполнения:', error.message);
        throw error; // Прокидываем ошибку, чтобы Playwright знал об этом
    }
};
