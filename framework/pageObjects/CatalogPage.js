// Объект с селекторами страницы каталога
export const catalogPage = {
    selectors: {
        discountPriceItem: 'div[class="note-item card h-100 hasDiscount"][data-product]:not([data-product="0"]):not(.d-none .note-item)',
        fullPriceItem: 'div[class="note-item card h-100"][class]:not([hasDiscount]):not(.d-none .note-item)',
        buyNoDiscountProductButton: 'div[class="note-item card h-100"][data-product]:not([data-product="0"]):not(.d-none .note-item) button[class="actionBuyProduct btn btn-primary mt-3"][type="button"]',
        anyItemOnPage: 'div[class="col-3 mb-5"] [data-product]:not(.d-none .note-item)',
        itemRibbon: 'div[class="wrap-ribbon"]',
        productCountInStorage: 'span[class="product_count ml-1"]',
        paginationButton: 'a[class="page-link"][data-page-number="2"]',
    }
};

// Ищет кнопку покупки одного продукта согласно условиям
export const findProductButtonBuy = async (page, discountFilter, minStock) => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Ждём прогрузки страницы
    const productCards = await page.locator(catalogPage.selectors.anyItemOnPage);
    const productCount = await productCards.count();

    for (let i = 0; i < productCount; i++) {
        const card = productCards.nth(i);

        // Проверка наличия скидки
        if (discountFilter !== "any") {
            const hasDiscount = await card.locator(catalogPage.selectors.itemRibbon).count() > 0;

            if (discountFilter === "withDiscount" && !hasDiscount) continue;
            if (discountFilter === "withoutDiscount" && hasDiscount) continue;
        }

        // Проверка минимального количества на складе
        const stockText = await card.locator(catalogPage.selectors.productCountInStorage).textContent();
        const stock = parseInt(stockText, 10);
        if (stock < minStock) continue;

        // Возвращаем кнопку "Купить" для подходящего товара
        return card.locator(".actionBuyProduct");
    }

    throw new Error("Не найден товар, соответствующий условиям");
};

// Кликает на кнопки "Купить" по индексу
export const clickBuyButtonsByIndex = async (page, count) => {
    for (let i = 1; i <= count; i++) {
        const locator = `//div[contains(@class, 'note-item') and @data-product="${i}"]//button[contains(@class, 'actionBuyProduct') and text()='Купить']`;
        await page.locator(locator).click({ timeout: 5000 });
    }
};

// Извлекает данные о продукте по локатору
export const extractProductDetailsLocator = async (locator) => {
    if (!locator) throw new Error("Locator is not defined");

    const productName = await locator.locator("div.product_name").evaluate((el) => el.textContent.trim());
    const productPrice = await locator.locator("span.product_price").evaluate((el) => el.childNodes[0]?.textContent.trim() || el.textContent.trim());
    const productCount = await locator.locator("span.product_count").evaluate((el) => el.textContent.trim());
    const buyButton = locator.locator("button.actionBuyProduct");

    return { productName, productPrice, productCount, buyButton };
};






/////////////////////
/////////////////////
////////////////////

///// То что ниже, это фрагменты нерабочего кода который жалко удалять и хочу оставить для себя в проекте

////////////////////
////////////////////
///////////////////





/* 
// Случайный валидный товар на текущей странице каталога
export const isDiscountItem = {
    someItemWithDiscount: async (page) => {
        const elements = await page.$$('div[class="note-item card h-100"][data-product]:not([data-product="0"]):not(.d-none .note-item) button[class="actionBuyProduct btn btn-primary mt-3"][type="button"]');
        const rndIndex = getRandomIndex(elements.length);
        return elements[rndIndex];
    },
    someItemWithOutDiscount: async (page) => {
        // Находим все товары без скидки
        await new Promise(resolve => setTimeout(resolve, 5000));
        const elements = await page.$$('div[class="note-item card h-100 hasDiscount"][data-product]:not([data-product="0"]):not(.d-none .note-item) button[class="actionBuyProduct btn btn-primary mt-3"][type="button"]');
        console.log('Found elements:', elements.length);
    
        if (!elements.length) {
            throw new Error('No items without discount found');
        }
    
        // Получаем случайный индекс
        const rndIndex = getRandomIndex(elements.length);
    
        // Проверяем, что элемент по индексу существует
        const selectedLocator = elements[rndIndex];
        if (!selectedLocator) {
            throw new Error(`No locator found at index ${rndIndex}`);
        }
    
        // Извлекаем данные о товаре
        const promoProduct = await extractProductDetailsLocator(selectedLocator);
        console.log('Promo product:', promoProduct);
    
        return promoProduct;
    },
    
};




// Извлекает данные о продукте по элементу
export const extractProductDetails = async (element) => {
    if (!element) throw new Error("Element is not defined");

    const productName = await element.$eval('div[class="product_name h6 mb-auto"]', (el) => el.textContent.trim());
    const productPrice = await element.$eval('span[class="product_price ml-1"]', (el) => el.textContent.trim());
    const productCount = await element.$eval('span[class="product_count ml-1"]', (el) => el.textContent.trim());
    const buyButton = await element.$('button[class="actionBuyProduct btn btn-primary mt-3"][type="button"]');

    return { productName, productPrice, productCount, buyButton };
};
 */

















