
/**
 * @jest-environment node
 */

global.supabase = {
    auth: {
        getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: '123' } } })
    },
    functions: {
        invoke: jest.fn()
    },
    storage: {
        from: jest.fn().mockReturnValue({
            upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
            getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'url' } })
        })
    },
    from: jest.fn().mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
        update: jest.fn().mockResolvedValue({ error: null }),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
    })
};

global.document = {
    getElementById: jest.fn(),
    createElement: jest.fn(),
    addEventListener: jest.fn()
};
global.window = {};
global.alert = jest.fn();
global.confirm = jest.fn().mockReturnValue(true);
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
};
// Mock Date.now
const originalDateNow = Date.now;
global.Date.now = jest.fn(() => 1234567890);

// Mock Math.random
const originalMathRandom = Math.random;
global.Math.random = jest.fn(() => 0.5);

afterAll(() => {
    global.Date.now = originalDateNow;
    global.Math.random = originalMathRandom;
});

const admin = require('../js/admin.js');

describe('handleSaveProduct', () => {
    let mockInputs;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock form inputs
        mockInputs = {
            'p-name': { value: 'Car' },
            'p-price': { value: '1000' },
            'p-category': { value: 'SUV' },
            'p-featured': { checked: false },
            'p-desc': { value: 'Description' },
            'p-mileage': { value: '10km' },
            'p-trans': { value: 'Auto' },
            'p-fuel': { value: 'Petrol' },
            'p-image': { files: [] },
            'p-gallery-upload': { files: [] },
            'save-btn': { textContent: 'Save', disabled: false },
            'products-table-body': { innerHTML: '' },
            'product-modal': { classList: { add: jest.fn(), remove: jest.fn() } }
        };
        document.getElementById.mockImplementation(id => mockInputs[id] || { value: '', addEventListener: jest.fn() });
    });

    test('handles translation error gracefully', async () => {
        // Mock translation failure
        global.supabase.functions.invoke.mockResolvedValue({
            data: null,
            error: { message: 'Translation failed' }
        });

        const event = { preventDefault: jest.fn() };
        await admin.handleSaveProduct(event);

        expect(console.error).toHaveBeenCalledWith('Translation API Error:', expect.anything());
        expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Translation failed'));

        // Should still insert product
        expect(global.supabase.from).toHaveBeenCalledWith('products');
        expect(global.supabase.from().insert).toHaveBeenCalled();
    });

    test('sanitizes undefined inputs to empty string', async () => {
         // Force undefined description
        mockInputs['p-desc'].value = undefined;

        global.supabase.functions.invoke.mockResolvedValue({
            data: { translatedText: ['CarAr', '', 'SUVAr', '', '', ''] },
            error: null
        });

        const event = { preventDefault: jest.fn() };
        await admin.handleSaveProduct(event);

        // Verify inputs sent to translate
        const invokeCall = global.supabase.functions.invoke.mock.calls[0];
        const payload = invokeCall[1].body.text;
        expect(payload[1]).toBe(''); // Description sanitized
    });
});
