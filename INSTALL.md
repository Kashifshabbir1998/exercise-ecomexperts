## Installation Instructions for ggggg-gg Section

### Step 1: Add Files to Theme
Copy the following files to your Shopify theme:

- **sections/ggggg-gg.liquid** → `sections/` directory
- **assets/ggggg-gg.js** → `assets/` directory
- **assets/ggggg-gg.css** → `assets/` directory
- **snippets/bundle-product-card.liquid** → `snippets/` directory
- **snippets/quantity-stepper.liquid** → `snippets/` directory
- **snippets/bundle-step-accordion.liquid** → `snippets/` directory
- **snippets/variant-pills.liquid** → `snippets/` directory

### Step 2: Add Section to Page
1. In your Shopify Admin, go to **Online Store > Pages**
2. Select or create the page where you want the bundle builder
3. Click **Add block**
4. Find and select **ggggg-gg** from the section list
5. Configure settings:
   - Adjust padding (top/bottom) as needed
   - Customize step labels (Step 1 tracker label, etc.)
   - Configure any product or pricing settings
6. Save your changes

### Step 3: Verify Assets Load
- Check that `ggggg-gg.css` and `ggggg-gg.js` load without errors in browser DevTools
- Confirm the bundle builder displays correctly on your page

### Notes
- This section uses Web Components (`<sd-bundle-builder>`)
- All dependent snippets must be installed for full functionality
- CSS and JS files are automatically loaded via the section's `stylesheet_tag` and `script` tags

## Google Fonts Installation (REQUIRED)

The generated CSS references these Google Fonts: **Inter, Inter**

Add these two tags to `layout/theme.liquid`, inside the `<head>` tag, before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter&family=Inter&display=swap" rel="stylesheet">
```

Without these tags, the fonts will not load and the design will fall back to system fonts.
