## Installation Instructions

### Step 1: Add Files to Your Theme

Add the following files to your theme:

1. **sections/sd-section.liquid** — Main section file
2. **assets/sd-section.js** — JavaScript functionality
3. **assets/sd-section.css** — Section styles
4. **snippets/press-logo-bar.liquid** — Reusable logo bar snippet

### Step 2: Add Section to Your Theme

1. In the Shopify admin, go to **Online Store > Themes**
2. Click **Edit** on your theme
3. Navigate to a page template (e.g., Homepage, Product, or Collection)
4. Click **Add section**
5. Find and select **sd-section** from the section list
6. Configure the section settings as needed
7. Save your changes

### Step 3: Verify Installation

- Ensure the section displays correctly on the storefront
- Check that styles are applied (no unstyled content)
- Test any interactive features in `sd-section.js`

### Notes

- All files must be placed in their respective directories for proper functioning
- The `press-logo-bar.liquid` snippet is included within the section
- Clear your browser cache if styles don't appear immediately