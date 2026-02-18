# Aganceonline

A premium automotive dealership website featuring a modern, responsive design with dark/light mode, multi-language support (English/Arabic), and currency conversion (USD/EGP).

## Features

*   **Branding:** Aganceonline
*   **Theme:** Dark and Light mode toggle.
*   **Language:** English and Arabic (RTL support).
*   **Currency:** Toggle between USD ($) and EGP (L.E).
*   **Data Driven:** Products and translations are managed via JSON files.
*   **Responsive:** Fully responsive design using Tailwind CSS.

## Setup & Running

This project is a static website. You can run it using any static file server.

### Prerequisites

*   A modern web browser.
*   A local web server (e.g., Python's `http.server`, `live-server`, or VS Code's Live Server extension).

### Running Locally

1.  Clone the repository.
2.  Open a terminal in the project directory.
3.  Run a local server:
    ```bash
    # Using Python 3
    python3 -m http.server 8000
    ```
4.  Open `http://localhost:8000` in your browser.

## Managing Content

### Updating Text & Translations

All text content on the site is managed through the `data/translations.json` file.

1.  Open `data/translations.json`.
2.  You will see two main sections: `"en"` (English) and `"ar"` (Arabic).
3.  Find the key corresponding to the text you want to change (e.g., `"hero_title"`).
4.  Update the value for both languages.

**Example:**
```json
"hero_title": "Driven by Performance.",
```
Change to:
```json
"hero_title": "Driven by Passion.",
```

### Updating Products & Images

The inventory is managed through `data/product.json`.

1.  **Add Images:**
    *   Place your new vehicle images in the `assets/images/` folder.
    *   Ensure image names are descriptive (e.g., `bmw-m4-2024.jpg`).

2.  **Update Product Data:**
    *   Open `data/product.json`.
    *   Each product is an object in the array.
    *   To add a new car, copy an existing object and update the fields:
        *   `id`: A unique number.
        *   `name`: The name of the vehicle.
        *   `price_usd`: The price in USD (the site automatically calculates EGP).
        *   `image_url`: The path to the image (e.g., `assets/images/your-image.jpg`).
        *   `featured`: Set to `true` to show on the homepage.
        *   `details`: Update mileage, transmission, fuel, etc.
        *   `gallery`: Add paths to additional images for the details page.

**Example Product Entry:**
```json
{
    "id": 101,
    "name": "2024 New Car Model",
    "price_usd": 50000,
    "image_url": "assets/images/new-car.jpg",
    "featured": true,
    "category": "Sedan",
    "description": "Description of the car...",
    "details": {
        "mileage": "0 mi",
        "transmission": "Automatic",
        "fuel": "Electric"
    },
    "gallery": [
        "assets/images/new-car.jpg",
        "assets/images/new-car-interior.jpg"
    ]
}
```

## Customization

*   **Currency Rate:** The exchange rate is defined in `js/script.js` as `const USD_TO_EGP = 50;`. Update this value to change the conversion rate.
