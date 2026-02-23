
describe('Admin Settings Logic', () => {
    let admin;
    let inputMock, btnMock;

    beforeEach(() => {
        jest.resetModules();

        inputMock = { value: '', disabled: false };
        btnMock = { disabled: false, textContent: '' };

        global.document = {
            getElementById: jest.fn((id) => {
                if (id === 'setting-usd-egp') return inputMock;
                if (id === 'save-settings-btn') return btnMock;
                // Basic mocks for initAdmin calls
                return {
                    addEventListener: jest.fn(),
                    classList: { add: jest.fn(), remove: jest.fn() }
                };
            }),
            addEventListener: jest.fn() // DOMContentLoaded
        };
        global.window = {};
        global.alert = jest.fn();

        global.supabase = {
            auth: { onAuthStateChange: jest.fn() }, // needed for initAdmin
            from: jest.fn()
        };

        // Suppress console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});

        admin = require('../js/admin.js');
    });

    test('loadSettings fetches and sets value', async () => {
        const mockSingle = jest.fn().mockResolvedValue({
            data: { value: '55.5' },
            error: null
        });

        global.supabase.from.mockReturnValue({
            select: jest.fn().mockReturnValue({
                eq: jest.fn().mockReturnValue({
                    single: mockSingle
                })
            })
        });

        await admin.loadSettings();

        expect(inputMock.value).toBe('55.5');
        expect(inputMock.disabled).toBe(false);
    });

    test('handleSaveSettings updates value', async () => {
        inputMock.value = '60';

        const mockUpsert = jest.fn().mockResolvedValue({ error: null });
        global.supabase.from.mockReturnValue({
            upsert: mockUpsert
        });

        const event = { preventDefault: jest.fn() };
        await admin.handleSaveSettings(event);

        expect(mockUpsert).toHaveBeenCalledWith({ key: 'USD_TO_EGP', value: '60' });
        expect(global.alert).toHaveBeenCalledWith('Exchange rate updated successfully!');
    });
});
