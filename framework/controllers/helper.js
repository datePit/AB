export const getRandomIndex = (length) => {
    return Math.floor(Math.random() * length);
};

export const isVisible = async (elementHandle) => {
    if (!elementHandle) return false;
    const box = await elementHandle.boundingBox();
    return box !== null;
};

export const clickOnButton = async (amount, button) => {
    let i = 1;
    while (i <= amount) {
        
      const element = await button;
      
      if (element) {
            
          await element.click({ timeout: 5000 });
      } else {
          console.error('No element found with sufficient stock');
          throw new Error('No element found with sufficient stock');
      }
      i++;
  }
}; 


export async function addNumberItemsFromPage(page, itemsToAdd, selectedItems, extractProductDetailsLocator) {
    for (let i = 0; i < itemsToAdd - 1; i++) {
        try {
           const itemSelector = `div[data-product="${i+1}"]`; // Селектор товара
           const itemLocator = page.locator(itemSelector);
   
           // Проверяем, виден ли элемент
           await new Promise(resolve => setTimeout(resolve, 1000));
           if (!(await itemLocator.isVisible())) {
              console.warn(`Item with selector ${itemSelector} is not visible`);
              continue;
           }
   
           // Извлекаем данные о товаре
           const itemDetails = await extractProductDetailsLocator(itemLocator);
   
           // Добавляем товар в корзину
           await itemDetails.buyButton.click({
              timeout: 5000
           });
   
           // Ждём для имитации реального поведения
           await page.waitForTimeout(1000);
   
           // Добавляем информацию о товаре в список
           selectedItems.push(itemDetails);
        } catch (error) {
           console.error(`Error selecting item ${i + 1}: ${error.message}`);
        }
     }
}

export function PriceParser(priceBefore) { 
    return parseInt(priceBefore.replace(/[^\d]/g, ''), 10); 
}

