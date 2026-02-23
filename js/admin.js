document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
});

let currentUser = null;
let currentProducts = [];

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const userInfo = document.getElementById('user-info');
const userEmailSpan = document.getElementById('user-email');

const tabProducts = document.getElementById('tab-products');
const tabInquiries = document.getElementById('tab-inquiries');
const viewProducts = document.getElementById('view-products');
const viewInquiries = document.getElementById('view-inquiries');

const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');

async function initAdmin() {
    // 1. Auth State Listener
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth State:', event);
        if (session) {
            currentUser = session.user;
            showDashboard();
        } else {
            currentUser = null;
            showLogin();
        }
    });

    // 2. Bind Events
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    tabProducts.addEventListener('click', () => switchTab('products'));
    tabInquiries.addEventListener('click', () => switchTab('inquiries'));

    document.getElementById('add-product-btn').addEventListener('click', () => openModal());
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('product-form').addEventListener('submit', handleSaveProduct);
}

// --- Auth Logic ---

function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    userInfo.classList.add('hidden');
}

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    userEmailSpan.textContent = currentUser.email;

    loadProducts();
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
}

// --- Tab Logic ---

function switchTab(tab) {
    if (tab === 'products') {
        viewProducts.classList.remove('hidden');
        viewInquiries.classList.add('hidden');
        tabProducts.classList.add('border-primary', 'text-primary');
        tabProducts.classList.remove('border-transparent', 'text-gray-500');
        tabInquiries.classList.remove('border-primary', 'text-primary');
        tabInquiries.classList.add('border-transparent', 'text-gray-500');
        loadProducts();
    } else {
        viewProducts.classList.add('hidden');
        viewInquiries.classList.remove('hidden');
        tabInquiries.classList.add('border-primary', 'text-primary');
        tabInquiries.classList.remove('border-transparent', 'text-gray-500');
        tabProducts.classList.remove('border-primary', 'text-primary');
        tabProducts.classList.add('border-transparent', 'text-gray-500');
        loadInquiries();
    }
}

// --- Product Logic ---

async function loadProducts() {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">Loading...</td></tr>';

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-red-500">Failed to load products</td></tr>';
        return;
    }

    currentProducts = data;
    renderProducts(data);
}

function renderProducts(products) {
    const tbody = document.getElementById('products-table-body');
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center">No vehicles found.</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => `
        <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4">
                <div class="h-10 w-16 rounded overflow-hidden bg-gray-200">
                    <img src="${p.image_url}" class="h-full w-full object-cover" alt="car">
                </div>
            </td>
            <td class="px-6 py-4 font-medium">${p.name}</td>
            <td class="px-6 py-4">$${p.price_usd.toLocaleString()}</td>
            <td class="px-6 py-4"><span class="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs">${p.category || '-'}</span></td>
            <td class="px-6 py-4">
                ${p.featured ? '<span class="text-green-500 font-bold text-xs">Featured</span>' : '<span class="text-gray-400 text-xs">Standard</span>'}
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="editProduct(${p.id})" class="text-blue-500 hover:text-blue-400 font-medium text-xs mr-3">Edit</button>
                <button onclick="deleteProduct(${p.id})" class="text-red-500 hover:text-red-400 font-medium text-xs">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Expose to window for onclick handlers
window.editProduct = function(id) {
    const product = currentProducts.find(p => p.id === id);
    if (product) openModal(product);
};

window.deleteProduct = async function(id) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
        alert('Error deleting: ' + error.message);
    } else {
        loadProducts();
    }
};

// --- Modal & Form Logic ---

let editingId = null;

function openModal(product = null) {
    productModal.classList.remove('hidden');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('product-form');

    if (product) {
        editingId = product.id;
        title.textContent = 'Edit Vehicle';

        document.getElementById('p-name').value = product.name;
        document.getElementById('p-price').value = product.price_usd;
        document.getElementById('p-category').value = product.category;
        document.getElementById('p-featured').checked = product.featured;
        document.getElementById('p-desc').value = product.description;

        // Handle nested details
        if (product.details) {
            document.getElementById('p-mileage').value = product.details.mileage || '';
            document.getElementById('p-trans').value = product.details.transmission || '';
            document.getElementById('p-fuel').value = product.details.fuel || '';
        }
    } else {
        editingId = null;
        title.textContent = 'Add New Vehicle';
        form.reset();
    }
}

function closeModal() {
    productModal.classList.add('hidden');
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const btn = document.getElementById('save-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Saving...';
    btn.disabled = true;

    try {
        // 1. Collect Data
        const name = document.getElementById('p-name').value;
        const price = parseFloat(document.getElementById('p-price').value);
        const category = document.getElementById('p-category').value;
        const featured = document.getElementById('p-featured').checked;
        const description = document.getElementById('p-desc').value;

        const details = {
            mileage: document.getElementById('p-mileage').value,
            transmission: document.getElementById('p-trans').value,
            fuel: document.getElementById('p-fuel').value
        };

        // 2. Handle Image Upload
        const fileInput = document.getElementById('p-image');
        let imageUrl = null;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `public/${fileName}`;

            const { data, error: uploadError } = await supabase.storage
                .from('vehicle-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicData } = supabase.storage
                .from('vehicle-images')
                .getPublicUrl(filePath);

            imageUrl = publicData.publicUrl;
        }

        // 3. Prepare DB Object
        const payload = {
            name,
            price_usd: price,
            category,
            featured,
            description,
            details
        };

        if (imageUrl) {
            payload.image_url = imageUrl;
            // Also initialize gallery with main image if empty
            if (!editingId) payload.gallery = [imageUrl];
        } else if (!editingId) {
            // New product but no image? Use placeholder
            payload.image_url = 'https://placehold.co/600x400?text=No+Image';
            payload.gallery = [];
        }

        // 4. Insert or Update
        let error;
        if (editingId) {
            const { error: err } = await supabase
                .from('products')
                .update(payload)
                .eq('id', editingId);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('products')
                .insert(payload);
            error = err;
        }

        if (error) throw error;

        closeModal();
        loadProducts();

    } catch (err) {
        console.error(err);
        alert('Failed to save: ' + err.message);
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

// --- Inquiry Logic ---

async function loadInquiries() {
    const tbody = document.getElementById('inquiries-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">Loading...</td></tr>';

    const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-red-500">Failed to load inquiries</td></tr>';
        return;
    }

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center">No inquiries yet.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(inq => `
        <tr class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
            <td class="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                ${new Date(inq.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 font-medium">${inq.name}</td>
            <td class="px-6 py-4 text-sm">
                <div class="flex flex-col">
                    <a href="mailto:${inq.email}" class="text-blue-500 hover:underline">${inq.email}</a>
                    <span class="text-gray-500">${inq.phone || '-'}</span>
                </div>
            </td>
            <td class="px-6 py-4 text-sm">
                ${inq.vehicle_name ? `<span class="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold">${inq.vehicle_name}</span>` : '<span class="text-gray-400">-</span>'}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title="${inq.message}">
                ${inq.message || '-'}
            </td>
        </tr>
    `).join('');
}
