## Installation Instructions

### 1. Add Files to Theme

Add the following files to your Shopify theme:

**Sections:**
- `sections/sd-section.liquid`

**Assets:**
- `assets/sd-section.js`
- `assets/sd-section.css`

**Snippets:**
- `snippets/sd-snip-two-panel-hero.liquid`
- `snippets/sd-snip-star-rating.liquid`

### 2. Add Section to Theme

1. In the Shopify theme editor, navigate to a page template where you want to use this section
2. Click **Add section**
3. Find and select **sd-section** from the section list
4. Configure the section settings:
   - Upload or select a product image
   - Set left and right panel background colors
   - Adjust padding (top/bottom spacing)
   - Add heading, description, and CTA button text
   - Select destination page/product for CTA link

### 3. Verify Installation

- Section should display as a two-panel layout with image on left, content on right
- CSS and JavaScript should load without console errors
- All section settings should be editable in the theme editor

### Notes

- Ensure all files maintain their exact filenames for proper asset references
- The section uses CSS custom properties for styling; verify your theme supports CSS variables
- JavaScript functionality requires the `sd-section.js` file to be present and loaded