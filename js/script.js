const USD_TO_EGP = 50;
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentCurrency = localStorage.getItem('currency') || 'EGP';
let translations = {};
let products = [];

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    // Apply initial state
    setTheme(currentTheme);
    await setLanguage(currentLang); // This also fetches translations
    // Currency will be applied after products are loaded or on toggle

    // Bind Global Event Listeners
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    const langToggle = document.getElementById('lang-toggle');
    if (langToggle) langToggle.addEventListener('click', toggleLanguage);

    const currencyToggle = document.getElementById('currency-toggle');
    if (currencyToggle) {
        currencyToggle.addEventListener('click', toggleCurrency);
        updateCurrencyButtonText();
    }

    // Load Data
    await loadProducts();

    // Route to Page Logic
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) {
        loadHome();
    } else if (path.endsWith('inventory.html')) {
        loadInventory();
    } else if (path.endsWith('details.html')) {
        loadDetails();
    } else if (path.endsWith('contact.html')) {
        loadContact();
    }
}

// --- State Management ---

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    const html = document.documentElement;
    if (theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }
    updateThemeIcon();
}

function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

function updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle span');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Fetch translations if not loaded
    if (!translations[lang]) {
        try {
            const response = await fetch('data/translations.json');
            const data = await response.json();
            translations = data;
        } catch (error) {
            console.error('Failed to load translations', error);
        }
    }

    updateDOMTranslations();
    updateCurrencyButtonText();
}

function toggleLanguage() {
    setLanguage(currentLang === 'en' ? 'ar' : 'en');
}

function updateDOMTranslations() {
    if (!translations[currentLang]) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
            el.placeholder = translations[currentLang][key];
        }
    });
}

function setCurrency(currency) {
    currentCurrency = currency;
    localStorage.setItem('currency', currency);
    updatePrices();
    updateCurrencyButtonText();
}

function toggleCurrency() {
    setCurrency(currentCurrency === 'USD' ? 'EGP' : 'USD');
}

function updateCurrencyButtonText() {
    const btn = document.getElementById('currency-text');
    if (btn && translations[currentLang]) {
        const label = currentCurrency === 'USD' ? translations[currentLang].price_usd : translations[currentLang].price_egp;
        btn.textContent = label;
    }
}

function updatePrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-price-usd'));
        el.textContent = formatPrice(usd);
    });
}

function formatPrice(usd) {
    if (currentCurrency === 'USD') {
        const symbol = (translations[currentLang] && translations[currentLang].price_usd) || 'USD';
        return currentLang === 'en' && symbol === 'USD' ? `$${usd.toLocaleString()}` : `${usd.toLocaleString()} ${symbol}`;
    } else {
        const symbol = (translations[currentLang] && translations[currentLang].price_egp) || 'L.E';
        return `${(usd * USD_TO_EGP).toLocaleString()} ${symbol}`;
    }
}

// --- Data Loading ---

async function loadProducts() {
    try {
        const response = await fetch('data/product.json');
        products = await response.json();
    } catch (error) {
        console.error('Failed to load products', error);
    }
}

// --- Page Logic ---

function loadHome() {
    const container = document.getElementById('trending-container');
    if (!container) return;

    const featured = products.filter(p => p.featured).slice(0, 3);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    updatePrices();
    updateDOMTranslations(); // Re-run for dynamic content
}

function loadInventory() {
    const container = document.getElementById('inventory-container');
    if (!container) return;

    // Initial render
    renderInventoryGrid(products);

    // Filter Logic (Simple)
    const filterBrand = document.getElementById('filter-brand'); // Just a placeholder for now
    const searchInput = document.getElementById('search-input');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(term));
            renderInventoryGrid(filtered);
        });
    }
}

function renderInventoryGrid(items) {
    const container = document.getElementById('inventory-container');
    if (!container) return;
    container.innerHTML = items.map(product => createProductCard(product)).join('');
    updatePrices();
    updateDOMTranslations();
}

function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const product = products.find(p => p.id === id);

    if (!product) {
        document.getElementById('details-container').innerHTML = '<p class="text-center text-white">Product not found</p>';
        return;
    }

    // Render Main Details
    const mainImg = document.getElementById('main-image');
    if (mainImg) mainImg.src = product.image_url;

    document.getElementById('vehicle-title').textContent = product.name;
    document.getElementById('vehicle-price').setAttribute('data-price-usd', product.price_usd);
    document.getElementById('vehicle-desc').textContent = product.description;

    // Specs
    document.getElementById('spec-mileage').textContent = product.details.mileage;
    document.getElementById('spec-trans').textContent = product.details.transmission;
    document.getElementById('spec-fuel').textContent = product.details.fuel;

    // Gallery
    const galleryContainer = document.getElementById('gallery-thumbnails');
    if (galleryContainer && product.gallery) {
        galleryContainer.innerHTML = product.gallery.map((url, index) => `
            <button class="relative flex-none w-24 aspect-[4/3] rounded-lg overflow-hidden hover:opacity-100 transition-opacity ${index === 0 ? 'ring-2 ring-primary' : 'opacity-60'}" onclick="changeMainImage('${url}', this)">
                <img src="${url}" class="w-full h-full object-cover" alt="Thumbnail">
            </button>
        `).join('');
    }

    updatePrices();
    updateDOMTranslations();
}

window.changeMainImage = function(url, btn) {
    const mainImg = document.getElementById('main-image');
    if (mainImg) mainImg.src = url;

    // Update active state of thumbnails
    const buttons = btn.parentElement.querySelectorAll('button');
    buttons.forEach(b => {
        b.classList.remove('ring-2', 'ring-primary', 'opacity-100');
        b.classList.add('opacity-60');
    });
    btn.classList.remove('opacity-60');
    btn.classList.add('ring-2', 'ring-primary', 'opacity-100');
}

function loadContact() {
    // Just ensure translations are applied
    updateDOMTranslations();
}

// --- Components ---

function createProductCard(product) {
    return `
    <div class="group bg-surface-dark border border-border-dark rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1 flex flex-col bg-white dark:bg-[#1e1621] border-gray-200 dark:border-[#2d2430]">
        <div class="relative aspect-[16/10] overflow-hidden">
            <a href="details.html?id=${product.id}">
                <img alt="${product.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" src="${product.image_url}"/>
            </a>
            <div class="absolute top-3 right-3 z-20">
                <button class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary transition-colors">
                    <span class="material-symbols-outlined" style="font-size: 18px;">favorite</span>
                </button>
            </div>
             <div class="absolute bottom-3 left-3 z-20 flex gap-2">
                ${product.category ? `<span class="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" data-i18n="${product.category.toLowerCase().replace(' ', '_')}">${product.category}</span>` : ''}
            </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <a href="details.html?id=${product.id}" class="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">${product.name}</a>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-[#97b7c4] mb-4 font-medium">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">speed</span> ${product.details.mileage}</span>
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-border-dark"></span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">settings</span> ${product.details.transmission}</span>
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-border-dark"></span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">local_gas_station</span> ${product.details.fuel}</span>
            </div>
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-border-dark">
                <p class="text-xl font-black text-primary tracking-tight" data-price-usd="${product.price_usd}">$${product.price_usd.toLocaleString()}</p>
                <a href="details.html?id=${product.id}" class="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-all uppercase tracking-wide" data-i18n="view_details">
                    View Details
                </a>
            </div>
        </div>
    </div>
    `;
}
