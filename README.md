# Agance online

A premium automotive dealership website featuring a modern, responsive design with dark/light mode, multi-language support (English/Arabic), and currency conversion (USD/EGP).

## Features

*   **Branding:** Agance online
*   **Theme:** Dark and Light mode toggle.
*   **Language:** English and Arabic (RTL support).
*   **Currency:** Toggle between USD ($) and EGP (L.E).
*   **Data Driven:** Vehicles and Inquiries are managed via **Supabase**.
*   **Responsive:** Fully responsive design using Tailwind CSS.
*   **Favorites:** Persist favorite vehicles across sessions.
*   **Inventory Filter:** Filter by category and search by name.

## Admin Dashboard

The application now includes a secure Admin Dashboard for managing vehicle inventory and viewing customer inquiries.

**Access:**
Navigate to `admin.html` (e.g., `http://localhost:5500/admin.html` or `https://your-site.github.io/admin.html`).

### 1. First-Time Setup (Create Admin User)
Before you can log in, you must create an admin user in Supabase:
1.  Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Click on the **Authentication** icon (left sidebar).
3.  Click **Add User**.
4.  Enter your email and a password.
5.  Check "Auto Confirm User".
6.  Click **Create User**.
7.  Repeat this for any other admins (e.g., your client).

### 2. Managing Inventory
Once logged in, you will see the **Products** tab.
*   **Add Vehicle:** Click the "+ Add Vehicle" button. Fill in the details and upload an image. The image will be automatically uploaded to Supabase Storage.
*   **Edit Vehicle:** Click "Edit" on any row to modify details.
*   **Delete Vehicle:** Click "Delete" to remove a vehicle permanently.

### 3. Viewing Inquiries
Click the **Inquiries** tab to see messages submitted via the "Contact Us" page or the "Inquire Now" modal on vehicle details pages.

## Data Structure

### Database (Supabase)
The application uses two main tables in Supabase:
*   `products`: Stores vehicle information (name, price, image, specs, etc.).
*   `inquiries`: Stores customer contact forms.

### Local JSON Files
*   `data/translations.json`: Manages all text content for internationalization (English/Arabic).
*   `data/product.json`: **(Deprecated)** This file is now only used as a backup or for initial migration. The live site fetches data from Supabase.

### `data/translations.json`

This file manages all text content for internationalization.

*   `en` (Object): Key-value pairs for English text.
*   `ar` (Object): Key-value pairs for Arabic text.

**Key Naming Convention:**
*   `header_*`: Header and navigation items.
*   `hero_*`: Hero section text.
*   `nav_*`: Navigation links.
*   `filter_*`: Inventory filter labels.
*   `price_*`: Currency symbols.

## Managing Content

### Updating Text & Translations

1.  Open `data/translations.json`.
2.  Find the key corresponding to the text you want to change (e.g., `"hero_title"`).
3.  Update the value for both languages.

## Customization

*   **Currency Rate:** The exchange rate is defined in `js/script.js` as `const USD_TO_EGP = 50;`. Update this value to change the conversion rate.
