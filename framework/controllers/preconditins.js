import { extractProductDetailsLocator } from '../pageObjects/CatalogPage.js';
import { basketElements } from '../pageElements/BasketWindow.js'

export async function addOneDiscountItem(page, catalogPage) {
  
    const promoProductLocator = page.locator(catalogPage.selectors.discountPriceItem).first();
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!(await promoProductLocator.isVisible({ timeout: 5000 }))) {
      throw new Error('Акционный товар не найден');
    }
  
    const promoProduct = await extractProductDetailsLocator(promoProductLocator);
    await promoProduct.buyButton.click({ timeout: 5000 });
  
    // Проверяем значение корзины после добавления первого товара
    await page.waitForTimeout(2000);
    const initialBasketCount = parseInt(
      await page.locator(basketElements.selectors.basketCountItems).innerText({ timeout: 5000 })
    );
      
    if (initialBasketCount !== 1) {
      throw new Error('Значение basketCountItems после добавления товара не равно 1');
    }
  
    return promoProduct; // Возвращаем объект promoProduct для дальнейшего использования
}
