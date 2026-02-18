# Agance online

A premium automotive dealership website featuring a modern, responsive design with dark/light mode, multi-language support (English/Arabic), and currency conversion (USD/EGP).

## Features

*   **Branding:** Agance online
*   **Theme:** Dark and Light mode toggle.
*   **Language:** English and Arabic (RTL support).
*   **Currency:** Toggle between USD ($) and EGP (L.E).
*   **Data Driven:** Products and translations are managed via JSON files.
*   **Responsive:** Fully responsive design using Tailwind CSS.
*   **Favorites:** Persist favorite vehicles across sessions.
*   **Inventory Filter:** Filter by category and search by name.

## Data Structure

The application is data-driven. Below is the structure for the JSON configuration files found in the `data/` directory.

### `data/product.json`

This file contains the inventory data. Each item represents a vehicle.

*   `id` (Number): Unique identifier for the vehicle.
*   `name` (String): The display name of the car (e.g., "2023 Porsche 911 GT3").
*   `price_usd` (Number): The price in US Dollars.
*   `image_url` (String): Path to the main display image.
*   `featured` (Boolean): If `true`, the car appears on the Home page trending section.
*   `category` (String): The category for filtering (e.g., "Sports", "SUV", "Supercar").
*   `description` (String): Full description text for the details page.
*   `details` (Object):
    *   `mileage`: String (e.g., "3.2k mi").
    *   `transmission`: String (e.g., "Auto").
    *   `fuel`: String (e.g., "Petrol").
*   `gallery` (Array of Strings): Paths to additional images for the details page thumbnail gallery.

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

### Updating Products & Images

1.  **Add Images:**
    *   Place your new vehicle images in the `assets/images/` folder.
    *   Ensure image names are descriptive (e.g., `bmw-m4-2024.jpg`).

2.  **Update Product Data:**
    *   Open `data/product.json`.
    *   Copy an existing product object and modify the fields.
    *   Ensure the `id` is unique.

## Customization

*   **Currency Rate:** The exchange rate is defined in `js/script.js` as `const USD_TO_EGP = 50;`. Update this value to change the conversion rate.
