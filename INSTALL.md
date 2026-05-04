## Installation Instructions

### 1. Add Files to Your Theme

Add the following files to your Shopify theme:

**Sections:**
- `sections/sd-frame-8234.liquid`

**Assets:**
- `assets/sd-frame-8234.js`
- `assets/sd-frame-8234.css`

**Snippets:**
- `snippets/bundle-product-card.liquid`
- `snippets/quantity-stepper.liquid`
- `snippets/color-swatch-selector.liquid`
- `snippets/accordion-step.liquid`

### 2. Add Section to Theme

1. In Shopify Admin, go to **Online Store > Themes**
2. Click **Edit code** on your active theme
3. Open the template where you want the section to appear (e.g., `templates/index.json` for homepage)
4. Add a new section block with type `sd-frame-8234`:
   ```json
   {
     "type": "sd-frame-8234",
     "settings": {
       "padding_top": 40,
       "padding_bottom": 40
     }
   }
   ```

### 3. Configure Settings

After adding the section to your template, customize these optional color and spacing settings in the theme editor:
- Padding Top/Bottom
- Accent Color
- Background Color
- Card Background Color
- Text Color
- Original Price Color

### 4. Verify Installation

Publish your theme and navigate to the page containing the section to confirm it displays correctly.