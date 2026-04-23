## SD Section Installation

Follow these steps to install the SD Section into your Shopify theme:

### 1. Add Files

Add the following files to your theme:

- `sections/sd-section.liquid` — Main section file
- `assets/sd-section.js` — JavaScript functionality
- `assets/sd-section.css` — Section styles
- `snippets/split-feature-block.liquid` — Reusable feature block component

### 2. Add Section to Theme

1. In Shopify Admin, go to **Online Store > Themes**
2. Select your theme and click **Edit code**
3. Upload all four files to their respective directories
4. Verify files appear in the correct locations in the code editor

### 3. Add to Page Template (One-Time)

To enable the section on pages:

1. In the code editor, locate your page template file (e.g., `templates/page.json`)
2. Add the section to your template's section list:
```
{
  "type": "sd-section"
}
```
3. Save the template

### 4. Configure in Theme Editor

1. Go to **Online Store > Themes > Customize**
2. Navigate to a page where you added the section
3. Click the section in the preview to access settings and customize content

### 5. Verify

- Check that the section appears correctly on your page
- Test responsive behavior on mobile and desktop
- Confirm all assets load without console errors

### File Structure Reference

```
theme/
├── sections/
│   └── sd-section.liquid
├── assets/
│   ├── sd-section.js
│   └── sd-section.css
└── snippets/
    └── split-feature-block.liquid
```

No additional configuration or dependencies required.