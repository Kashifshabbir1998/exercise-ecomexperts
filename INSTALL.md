## Installation Instructions

### 1. Add Files to Theme

Copy the following files to your theme directory:

- `sections/sd-section.liquid` → `sections/sd-section.liquid`
- `assets/sd-section.js` → `assets/sd-section.js`
- `assets/sd-section.css` → `assets/sd-section.css`
- `snippets/promo-split-banner.liquid` → `snippets/promo-split-banner.liquid`
- `snippets/star-rating.liquid` → `snippets/star-rating.liquid`

### 2. Update Locale Files

Add the following keys to `locales/en.default.json`:

```
"sections": {
  "sd_section": {
    "rating_aria": "Product rating"
  }
},
"snippets": {
  "star_rating": {
    "aria_label": "Star rating"
  }
}
```

### 3. Add Section to Template

To make the section available in the Shopify Theme Editor:

1. Open the template file where you want to use this section (e.g., `templates/index.json` for the homepage)
2. Add a new section block with type `sd-section`
3. Or add it to `sections/` folder and it will automatically appear in the Theme Editor sidebar

### 4. Verify Installation

- Navigate to the Shopify Theme Editor
- Confirm `sd-section` appears in the section list
- Test the section renders correctly with the star rating and promotional banner snippets
- Verify CSS and JavaScript assets load without console errors

All files are now ready for use.