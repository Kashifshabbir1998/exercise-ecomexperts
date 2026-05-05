## Installation Instructions for sd-frame-8234 Section

### Step 1: Add Files to Theme
Copy the following files to your Shopify theme:

- `sections/sd-frame-8234.liquid` → `sections/`
- `assets/sd-frame-8234.js` → `assets/`
- `assets/sd-frame-8234.css` → `assets/`
- `snippets/bundle-product-card.liquid` → `snippets/`
- `snippets/bundle-step-accordion.liquid` → `snippets/`
- `snippets/quantity-stepper.liquid` → `snippets/`
- `snippets/variant-pills.liquid` → `snippets/`

### Step 2: Add Section to Page Template
1. In the Shopify Admin, go to **Online Store > Themes**
2. Click **Edit** on your active theme
3. Open the page template where you want to add the section (e.g., `index.json`)
4. Click **Add section**
5. Find and select **sd-frame-8234** from the section list
6. Configure the section settings as needed:
   - Padding top/bottom
   - Progress label text
   - Bundle step content and products

### Step 3: Configure Section Settings
Customize the following in the theme editor:
- Progress bar label text
- Step titles and descriptions
- Product selections for each bundle step
- Spacing and styling options

### Notes
- This is a multi-step bundle builder section with product selection
- Ensure all snippet files are present for proper functionality
- The section uses CSS custom properties for dynamic spacing
- JavaScript is required for interactivity (loads with `defer` attribute)

## Google Fonts Installation (REQUIRED)

The generated CSS references these Google Fonts: **Inter, Inter**

Add these two tags to `layout/theme.liquid`, inside the `<head>` tag, before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter&family=Inter&display=swap" rel="stylesheet">
```

Without these tags, the fonts will not load and the design will fall back to system fonts.
