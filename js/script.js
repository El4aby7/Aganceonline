/**
 * Agance online - Main Application Logic
 *
 * This script handles:
 * 1. Global State Management (Theme, Language, Currency, Favorites).
 * 2. Data Loading (Products, Translations).
 * 3. Page-Specific Logic (Home, Inventory, Details, Favorites).
 * 4. UI Updates & Rendering.
 */

// --- Constants & Global Variables ---
const USD_TO_EGP = 47.02; // Fixed exchange rate
let currentLang = localStorage.getItem('lang') || 'en';
let currentTheme = localStorage.getItem('theme') || 'dark';
let currentCurrency = localStorage.getItem('currency') || 'EGP';
let translations = {};
let products = [];
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    init();
});

/**
 * Initializes the application state and loads necessary data.
 */
async function init() {
    // Apply initial preferences
    setTheme(currentTheme);
    await setLanguage(currentLang); // Also fetches translation data

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

    // Setup Mobile Menu
    setupMobileMenu();

    // Load Product Data
    await loadProducts();

    // Route execution to specific page logic based on URL
    const path = window.location.pathname;
    if (path.endsWith('index.html') || path.endsWith('/')) {
        loadHome();
    } else if (path.endsWith('inventory.html')) {
        loadInventory();
    } else if (path.endsWith('details.html')) {
        loadDetails();
    } else if (path.endsWith('contact.html')) {
        loadContact();
    } else if (path.endsWith('favorites.html')) {
        loadFavoritesPage();
    }
}

// --- Mobile Menu Logic ---

function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }
}

// --- State Management ---

/**
 * Sets the active theme (light/dark) and persists to localStorage.
 * @param {string} theme - 'light' or 'dark'
 */
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

/**
 * Toggles between light and dark themes.
 */
function toggleTheme() {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

/**
 * Updates the theme toggle icon in the header.
 */
function updateThemeIcon() {
    const icon = document.querySelector('#theme-toggle span');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
    }
}

/**
 * Sets the active language, updates HTML dir/lang attributes, and refreshes translations.
 * @param {string} lang - 'en' or 'ar'
 */
async function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Fetch translations if not already loaded
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

/**
 * Updates all elements with [data-i18n] attributes with the current language text.
 */
function updateDOMTranslations() {
    if (!translations[currentLang]) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });

    // Update placeholders for inputs
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

/**
 * Updates displayed prices based on the selected currency and exchange rate.
 */
function updatePrices() {
    document.querySelectorAll('[data-price-usd]').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-price-usd'));
        el.textContent = formatPrice(usd);
    });
}

/**
 * Formats a raw USD price into the target currency string.
 * @param {number} usd - Price in USD
 * @returns {string} Formatted price string (e.g. "$50,000" or "2,500,000 L.E")
 */
function formatPrice(usd) {
    if (currentCurrency === 'USD') {
        const symbol = (translations[currentLang] && translations[currentLang].price_usd) || 'USD';
        return currentLang === 'en' && symbol === 'USD' ? `$${usd.toLocaleString()}` : `${usd.toLocaleString()} ${symbol}`;
    } else {
        const symbol = (translations[currentLang] && translations[currentLang].price_egp) || 'L.E';
        return `${(usd * USD_TO_EGP).toLocaleString()} ${symbol}`;
    }
}

// --- Favorites Management ---

/**
 * Toggles a product ID in the favorites list and updates the UI.
 * @param {number} id - Product ID
 * @param {HTMLElement} btn - The button element triggered
 */
window.toggleFavorite = function(id, btn) {
    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
        // Style: Filled Heart
        btn.innerHTML = '<span class="material-symbols-outlined filled-heart" style="font-size: 18px; font-variation-settings: \'FILL\' 1;">favorite</span>';
        btn.classList.add('text-primary');
        btn.classList.remove('text-white');
    } else {
        favorites.splice(index, 1);
        // Style: Outline Heart
        btn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 18px;">favorite</span>';
        btn.classList.remove('text-primary');
        btn.classList.add('text-white');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));

    // If on favorites page, remove card dynamically
    if (window.location.pathname.endsWith('favorites.html')) {
        loadFavoritesPage();
    }
}

function isFavorite(id) {
    return favorites.includes(id);
}

// --- Data Loading ---

async function loadProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        products = data;
    } catch (error) {
        console.error('Failed to load products', error);
        // Fallback or empty state
        products = [];
    }
}

// --- Page Logic ---

/**
 * Logic for Home Page: Loads featured products.
 */
function loadHome() {
    const container = document.getElementById('trending-container');
    if (!container) return;

    const featured = products.filter(p => p.featured).slice(0, 3);
    container.innerHTML = featured.map(product => createProductCard(product)).join('');
    updatePrices();
    updateDOMTranslations(); // Re-run for dynamic content
}

/**
 * Logic for Inventory Page: Loads all products with filtering.
 */
function loadInventory() {
    const container = document.getElementById('inventory-container');
    if (!container) return;

    // Initial render
    filterInventory();

    // Bind Filter Events
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');

    if (searchInput) {
        searchInput.addEventListener('input', filterInventory);
    }
    if (categorySelect) {
        categorySelect.addEventListener('change', filterInventory);
    }
}

/**
 * Filters inventory based on search term and category selection.
 */
function filterInventory() {
    const container = document.getElementById('inventory-container');
    if (!container) return;

    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('filter-category');

    const term = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categorySelect ? categorySelect.value : '';

    const filtered = products.filter(p => {
        // Search in both English and Arabic names
        const nameEn = p.name ? p.name.toLowerCase() : '';
        const nameAr = p.name_ar ? p.name_ar.toLowerCase() : '';
        const matchesTerm = nameEn.includes(term) || nameAr.includes(term);

        const matchesCategory = category === '' || (p.category && p.category === category);
        return matchesTerm && matchesCategory;
    });

    container.innerHTML = filtered.map(product => createProductCard(product)).join('');
    updatePrices();
    updateDOMTranslations();
}

/**
 * Logic for Favorites Page: Loads favorited products.
 */
function loadFavoritesPage() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    const favProducts = products.filter(p => favorites.includes(p.id));

    if (favProducts.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-20">
            <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600 mb-4">favorite_border</span>
            <p class="text-xl text-gray-500 dark:text-gray-400" data-i18n="no_favorites">You haven't added any favorites yet.</p>
        </div>`;
    } else {
        container.innerHTML = favProducts.map(product => createProductCard(product)).join('');
    }
    updatePrices();
    updateDOMTranslations();
}

/**
 * Logic for Details Page: Loads specific vehicle info by ID.
 */
function loadDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const product = products.find(p => p.id === id);

    if (!product) {
        const container = document.getElementById('details-container');
        if(container) container.innerHTML = '<p class="text-center text-slate-900 dark:text-white">Product not found</p>';
        return;
    }

    // Render Main Details
    const content = getProductContent(product);

    const mainImg = document.getElementById('main-image');
    if (mainImg) mainImg.src = product.image_url;

    document.getElementById('vehicle-title').textContent = content.name;
    document.getElementById('vehicle-title-crumb').textContent = content.name;
    document.getElementById('vehicle-price').setAttribute('data-price-usd', product.price_usd);
    document.getElementById('vehicle-desc').textContent = content.description;

    // Specs
    document.getElementById('spec-mileage').textContent = content.details.mileage;
    document.getElementById('spec-trans').textContent = content.details.transmission;
    document.getElementById('spec-fuel').textContent = content.details.fuel;

    // Gallery Thumbnails
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

/**
 * Updates the main image on the Details page when a thumbnail is clicked.
 */
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

    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    try {
        const name = document.getElementById('c-name').value;
        const email = document.getElementById('c-email').value;
        const phone = document.getElementById('c-phone').value;
        const interest = document.getElementById('c-interest').value;
        const message = document.getElementById('c-message').value;

        const { error } = await supabase.from('inquiries').insert({
            name,
            email,
            phone,
            interest,
            message,
            vehicle_name: 'Contact Page Inquiry'
        });

        if (error) throw error;

        alert('Thank you! Your message has been sent. We will contact you shortly.');
        e.target.reset();

    } catch (err) {
        console.error(err);
        alert('Failed to send message: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// --- Inquiry Modal Logic (Details Page) ---

window.openInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) {
        modal.classList.remove('hidden');
        // Pre-fill vehicle name if possible
        const vehicleTitle = document.getElementById('vehicle-title');
        if (vehicleTitle) {
            document.getElementById('inq-vehicle').value = vehicleTitle.textContent;
        }
    }
};

window.closeInquiryModal = function() {
    const modal = document.getElementById('inquiry-modal');
    if (modal) modal.classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
    // Bind inquiry modal form if it exists
    const inqForm = document.getElementById('inquiry-form');
    if (inqForm) {
        inqForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Sending...';
            btn.disabled = true;

            try {
                const name = document.getElementById('inq-name').value;
                const email = document.getElementById('inq-email').value;
                const phone = document.getElementById('inq-phone').value;
                const message = document.getElementById('inq-message').value;
                const vehicle = document.getElementById('inq-vehicle').value;

                const { error } = await supabase.from('inquiries').insert({
                    name,
                    email,
                    phone,
                    interest: 'Vehicle Inquiry',
                    message,
                    vehicle_name: vehicle
                });

                if (error) throw error;

                alert('Inquiry sent successfully!');
                e.target.reset();
                closeInquiryModal();

            } catch (err) {
                alert('Error sending inquiry: ' + err.message);
            } finally {
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }
});

// --- Component Rendering ---

/**
 * Helper to get translated content for a product based on currentLang
 */
function getProductContent(product) {
    if (currentLang === 'ar') {
        return {
            name: product.name_ar || product.name,
            description: product.description_ar || product.description,
            details: {
                mileage: (product.details_ar && product.details_ar.mileage) || product.details.mileage,
                transmission: (product.details_ar && product.details_ar.transmission) || product.details.transmission,
                fuel: (product.details_ar && product.details_ar.fuel) || product.details.fuel
            }
        };
    }
    return {
        name: product.name,
        description: product.description,
        details: product.details
    };
}

/**
 * Generates the HTML for a single product card.
 * @param {Object} product - The product data object
 * @returns {string} HTML string
 */
function createProductCard(product) {
    const fav = isFavorite(product.id);
    const heartIcon = fav ? 'favorite' : 'favorite';
    const heartClass = fav ? 'text-primary' : 'text-white';
    const heartStyle = fav ? 'font-variation-settings: \'FILL\' 1;' : '';

    const content = getProductContent(product);

    return `
    <div class="group relative flex flex-col rounded-xl overflow-hidden bg-white dark:bg-surface-card border border-gray-200 dark:border-white/5 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1">
        <div class="relative aspect-[16/10] overflow-hidden">
            <a href="details.html?id=${product.id}">
                <img alt="${content.name}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" src="${product.image_url}"/>
            </a>
            <div class="absolute top-3 right-3 z-20">
                <button class="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center ${heartClass} hover:text-primary transition-colors" onclick="toggleFavorite(${product.id}, this)">
                    <span class="material-symbols-outlined" style="font-size: 18px; ${heartStyle}">${heartIcon}</span>
                </button>
            </div>
             <div class="absolute bottom-3 left-3 z-20 flex gap-2">
                ${product.category ? `<span class="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" data-i18n="${product.category.toLowerCase().replace(' ', '_')}">${product.category}</span>` : ''}
            </div>
        </div>
        <div class="p-5 flex flex-col flex-grow">
            <div class="flex justify-between items-start mb-2">
                <a href="details.html?id=${product.id}" class="text-lg font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary transition-colors">${content.name}</a>
            </div>
            <div class="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">speed</span> ${content.details.mileage}</span>
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">settings</span> ${content.details.transmission}</span>
                <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">local_gas_station</span> ${content.details.fuel}</span>
            </div>
            <div class="mt-auto flex items-center justify-between pt-4 border-t border-gray-200 dark:border-white/10">
                <p class="text-xl font-black text-primary tracking-tight" data-price-usd="${product.price_usd}">$${product.price_usd.toLocaleString()}</p>
                <a href="details.html?id=${product.id}" class="text-xs font-bold text-primary border border-primary px-3 py-1.5 rounded hover:bg-primary hover:text-white transition-all uppercase tracking-wide" data-i18n="view_details">
                    View Details
                </a>
            </div>
        </div>
    </div>
    `;
}

/**
 * Displays a demo message to the user.
 */
function showDemoMessage() {
    alert("Thank you for your interest! This website is currently a demo, and this feature is not yet active.");
}
