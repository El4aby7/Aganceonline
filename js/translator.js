
async function handleAutoTranslate() {
    const btn = document.getElementById('translate-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[14px]">refresh</span> Translating...';
    btn.disabled = true;

    try {
        const name = document.getElementById('p-name').value;
        const description = document.getElementById('p-desc').value;
        const details = {
            mileage: document.getElementById('p-mileage').value,
            transmission: document.getElementById('p-trans').value,
            fuel: document.getElementById('p-fuel').value
        };

        if (!name && !description) {
            throw new Error('Please fill in the English Name and Description first.');
        }

        // Call Supabase Edge Function
        // Note: 'translate-product' must be deployed to your Supabase project.
        const { data, error } = await supabase.functions.invoke('translate-product', {
            body: { name, description, details }
        });

        if (error) {
            // Check if it's a "Function not found" error (common in dev/sandbox)
            if (error.code === 'functions_client_error' || error.message.includes('not found')) {
                 throw new Error('Translation function not deployed. Please check README.');
            }
            throw error;
        }

        if (data) {
            if (data.name_ar) document.getElementById('p-name-ar').value = data.name_ar;
            if (data.description_ar) document.getElementById('p-desc-ar').value = data.description_ar;
            if (data.details_ar) {
                document.getElementById('p-mileage-ar').value = data.details_ar.mileage || '';
                document.getElementById('p-trans-ar').value = data.details_ar.transmission || '';
                document.getElementById('p-fuel-ar').value = data.details_ar.fuel || '';
            }
        }

    } catch (err) {
        console.error(err);
        alert('Translation failed: ' + err.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
