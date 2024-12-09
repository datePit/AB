// Объект с селекторами страницы каталога
export const basketElements = {
  selectors: {
      basketItemTitle: 'span[class="basket-item-title"]',
      basketItemPrice: 'span[class="basket-item-price"]',
      basketCountItems: 'span[class="basket-count-items badge badge-primary"]',
      basketMenu: 'div[class="dropdown-menu dropdown-menu-right show"]',
      dropDownBasketButton: 'a[class="nav-link"][id="dropdownBasket"]',
      directionToBasketButton: 'a[class="btn btn-primary btn-sm ml-auto"]',
  }
};


export async function getBasketItems(page) {
  try {
    await page.locator(basketElements.selectors.dropDownBasketButton).click({ timeout: 5000 });

    await page.waitForTimeout(1000);
    await page.waitForSelector(basketElements.selectors.basketMenu, { visible: true, timeout: 10000 });

    const basketItems = await page.$$('li[class="basket-item list-group-item d-flex justify-content-start align-items-center"]');
    if (basketItems.length === 0) {
        console.log("Корзина пуста.");
        return [];
    }

    return Promise.all(
        basketItems.map(async (item) => {
            const title = await item.$eval(".basket-item-title", (el) => el.innerText.trim());
            const price = await item.$eval(".basket-item-price", (el) => el.innerText.trim());
            const count = await item.$eval(".basket-item-count", (el) => el.innerText.trim());
            return { title, price, count };
        })
    );
} catch (error) {
    console.error("Ошибка при получении товаров из корзины:", error);
    throw new Error("Не удалось получить товары из корзины.");
}  
}
