// node .\framework\tests\basket.spec.js

// @ts-check

const { test, expect } = require('@playwright/test');

//import { test, expect } from '@playwright/test';
import { BASE_URL } from '../config.js';
import { getPreparesFor_e2e } from '../controllers/api_getPreparesFor_e2e.js';
import { catalogPage, findProductButtonBuy, clickBuyButtonsByIndex,  extractProductDetailsLocator } from '../pageObjects/CatalogPage.js';
import { clickOnButton, addNumberItemsFromPage, PriceParser } from '../controllers/helper.js';
import { addOneDiscountItem } from '../controllers/preconditins.js';
import { basketElements, getBasketItems } from '../pageElements/BasketWindow.js'



// Глобальные переменные для токенов
let htmlUser_csrfToken;
let cookiesUser_csrfToken;
let cookiesUserPHPSESSID;

test.beforeEach(async ({ context }) => {
  // 1. Получаем токены через getPreparesFor_e2e
  const data = await getPreparesFor_e2e();
  cookiesUser_csrfToken = data.cookiesUser_csrfToken;
  cookiesUserPHPSESSID = data.cookiesUserPHPSESSID;
  htmlUser_csrfToken = data.htmlUser_csrfToken;

  // 2. Устанавливаем куки для контекста Playwright
  await context.addCookies([
    {
      name: 'PHPSESSID',
      value: cookiesUserPHPSESSID,
      domain: 'enotes.pointschool.ru', 
      path: '/',
      httpOnly: true,
      secure: false 
    },
    {
      name: '_csrf',
      value: cookiesUser_csrfToken,
      domain: 'enotes.pointschool.ru',
      path: '/',
      httpOnly: false,
      secure: false
    }
  ]);

  // 3. Устанавливаем глобальные заголовки для всех запросов в контексте
  await context.setExtraHTTPHeaders({
    'accept': "application/json, text/javascript, */*; q=0.01",
    "x-requested-with": "XMLHttpRequest",
    "accept-language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    "priority": "u=1, i",
    "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"Windows\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "Referer": "https://enotes.pointschool.ru/",
    "Referrer-Policy": "strict-origin-when-cross-origin",

    'x-csrf-token': htmlUser_csrfToken, 
    });
});

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////



test('TS1: Going to empty basket', async ({ page }) => {
  await page.goto(BASE_URL);
  expect(page.locator(basketElements.selectors.basketCountItems)).toContainText('0');

  await page.locator(basketElements.selectors.dropDownBasketButton).click();
  expect(page.locator(basketElements.selectors.directionToBasketButton)).toBeVisible({ timeout: 5000 });
  await page.locator(basketElements.selectors.directionToBasketButton, {hasText: 'Перейти в корзину'}).click({ timeout: 5000 });
  expect(page).toHaveURL(`${BASE_URL}/basket`);
  expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);
});
 



test('TS2.2: Going to basket with one NOdiscount item', async ({ page }) => {
await page.goto(BASE_URL);
expect(page.locator(basketElements.selectors.basketCountItems)).toContainText('0');

const productCards = await page.locator(catalogPage.selectors.fullPriceItem);
const firstProduct = productCards.nth(0); 

const productDetails = await extractProductDetailsLocator(firstProduct);
await new Promise(resolve => setTimeout(resolve, 500));
const { productName, productPrice, buyButton } = productDetails;


await buyButton.click();
await expect(page.locator(basketElements.selectors.basketCountItems)).toHaveText('1');

await page.locator(basketElements.selectors.dropDownBasketButton).click();

await expect(page.locator(basketElements.selectors.basketMenu)).toBeVisible();
await expect(page.locator(basketElements.selectors.basketItemTitle)).toHaveText(productName, { timeout: 5000 });

const basketItemPriceText = await (page.locator(basketElements.selectors.basketItemPrice)).innerText(); 
expect(PriceParser(basketItemPriceText)).toBe(PriceParser(productPrice));

const basketTotalPriceText = await (page.locator(basketElements.selectors.basketItemPrice)).innerText();
expect(PriceParser(basketTotalPriceText)).toBe(PriceParser(productPrice));

 
await page.locator(basketElements.selectors.directionToBasketButton, {hasText: 'Перейти в корзину'}).click({ timeout: 5000 });
  expect(page).toHaveURL(`${BASE_URL}/basket`);
  expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);

});


test('TS3: Going to basket with one discount item', async ({ page }) => {
  await page.goto(BASE_URL);
  expect(page.locator(basketElements.selectors.basketCountItems)).toContainText('0');
  
  const productCards = await page.locator(catalogPage.selectors.discountPriceItem);
  const firstProduct = productCards.nth(0); 

  const productDetails = await extractProductDetailsLocator(firstProduct);
  await new Promise(resolve => setTimeout(resolve, 500));
  const { productName, productPrice, buyButton } = productDetails;

  await buyButton.click();
  await expect(page.locator(basketElements.selectors.basketCountItems)).toHaveText('1');

  await page.locator(basketElements.selectors.dropDownBasketButton).click();
  
  const basketMenu = page.locator(basketElements.selectors.basketMenu);
  await expect(basketMenu).toBeVisible();
  await expect(page.locator(basketElements.selectors.basketItemTitle)).toHaveText(productName, { timeout: 5000 });

  const basketItemPriceText = await (page.locator(basketElements.selectors.basketItemPrice)).innerText(); 
  expect(PriceParser(basketItemPriceText)).toBe(PriceParser(productPrice));

  const basketTotalPriceText = await (page.locator(basketElements.selectors.basketItemPrice)).innerText();
  expect(PriceParser(basketTotalPriceText)).toBe(PriceParser(productPrice));

  await page.locator(basketElements.selectors.directionToBasketButton, {hasText: 'Перейти в корзину'}).click({ timeout: 5000 });
  expect(page).toHaveURL(`${BASE_URL}/basket`);
  expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);
  });

 
  


test('TS4.4: Going to basket with 9 items', async ({page}) => {
  await page.goto(BASE_URL);

  // Предусловие
  const promoProduct = await addOneDiscountItem(page, catalogPage);

  // Добавляем оставшиеся товары из шагов воспроизведения
  const itemsToAdd = 9; // Общее количество товаров (включая акционный)
  const selectedItems = [promoProduct]; // Список товаров с акционным
  await addNumberItemsFromPage(page, itemsToAdd, selectedItems, extractProductDetailsLocator)
  
  // Проверяем соответствие количества товаров на иконке корзины (требование: Рядом с иконкой корзины отображается цифра 9)
  const basketCount = await page.locator(basketElements.selectors.basketCountItems).innerText();
  expect(parseInt(basketCount)).toBe(selectedItems.length);

  // Получаем массив из объектов с параметрами title, price, count
  const basketItems = await getBasketItems(page);

  // Суммируем все количества товаров в меню корзины
  let totalItemCount = 0;
  basketItems.forEach((item) => {
     totalItemCount += parseInt(item.count, 10); 
  });

  // Сравниваем общее отображаемое количество товаров в меню корзины с длиной списка добавленных товаров
  expect(totalItemCount).toBe(selectedItems.length);

  // Проверяем соответствие добавленного товара к тому который отображается в меню
  selectedItems.forEach((item) => {
     const basketItem = basketItems.find((basketItem) => basketItem.title === item.productName);
     // Проверяем количество (должно соответствовать количеству добавлений)
     const expectedCount = selectedItems.filter((selectedItem) => selectedItem.productName === item
        .productName).length;
     expect(parseInt(basketItem.count, 10)).toBe(expectedCount);
  });

  // Проверяем цену
  // Вычисляем общую сумму товаров в корзине (тестовый расчет)
  let testCalculatedTotal = basketItems.reduce((sum, item) => {
     const itemPrice = PriceParser(item.price)
     const itemCount = parseInt(item.count, 10);
     return sum + itemPrice * itemCount;
  }, 0);

  // Проверяем общую сумму
  const basketTotalPrice = await page.locator(basketElements.selectors.basketItemPrice).innerText();
  expect(PriceParser(basketTotalPrice)).toBe(testCalculatedTotal);


  // Переход на страницу корзины 
  expect(page.locator(basketElements.selectors.directionToBasketButton)).toBeVisible({ timeout: 5000 });
  await page.locator(basketElements.selectors.directionToBasketButton, {hasText: 'Перейти в корзину'}).click({ timeout: 5000 });
  await expect(page).toHaveURL(`${BASE_URL}/basket`);
  await expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);

});




test('TS5: Going to basket with 9 the same discount items', async ({ page }) => {
  await page.goto(BASE_URL);

  const amount = 9; 
  // smart locator, searches for the product purchase button based on the parameters
  // any, withDiscount, withoutDiscount - filtering by discount
  // quantity in stock "not less than"
  const button = await findProductButtonBuy(page, "withDiscount", amount);
  await clickOnButton(amount, button)
  await expect(page.locator(basketElements.selectors.basketCountItems)).toContainText('9', { timeout: 5000 });

  await page.locator(basketElements.selectors.dropDownBasketButton).click({ timeout: 5000 });
  expect(page.locator(basketElements.selectors.basketMenu)).toBeVisible({ timeout: 5000 });
  expect(page.locator(basketElements.selectors.directionToBasketButton)).toBeVisible({ timeout: 5000 });
  //await new Promise(resolve => setTimeout(resolve, 5000));
  await page.locator(basketElements.selectors.directionToBasketButton, {hasText: 'Перейти в корзину'}).click({ timeout: 5000 });
  await expect(page).toHaveURL(`${BASE_URL}/basket`, { timeout: 5000 });
  await expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);
  // К сожалению, у уже нет времени реализовать умную проверка добавленных товаров, количества, стоимости и суммы.
  // Т.е. я изначально не предусмотрел этот момент и теперь параметрическую функцию выбора надо переделывать, либо
  // парралельно городить огород.
});





/* 
Почему я проверяю переход на страницу корзины только так:
await expect(page).toHaveURL(`${BASE_URL}/basket`, { timeout: 5000 });
await expect((await page.request.get(`${BASE_URL}/basket`)).status()).toBe(200);

потому что:
- нет требований на это
- есть понимание, что 500ой там в реальных условиях и с статусом 200 у самого запроса - быть не может. 
- отображение данных на странице корзины, будет уже другой тест.)
await page.locator(basketMenu.selectors.dropDownBasketButton).click();

 */


















