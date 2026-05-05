## Installation: ttt-bb-herooo Section

### Files to Add

1. **sections/ttt-bb-herooo.liquid**
   - Add the main section file to your theme's `sections` folder

2. **assets/ttt-bb-herooo.css**
   - Add stylesheet to your theme's `assets` folder

3. **assets/ttt-bb-herooo.js**
   - Add JavaScript file to your theme's `assets` folder

4. **snippets/sd-snip-hero-collage.liquid**
   - Add snippet to your theme's `snippets` folder

### Setup Steps

1. **Add Section to Theme**
   - Go to **Shopify Admin > Sales Channels > Online Store > Themes**
   - Click **Edit code** on your theme
   - Verify all four files are in their correct locations (sections, assets, snippets)

2. **Add Section to Page**
   - In theme editor, navigate to any page template where you want to use this section
   - Click **Add section**
   - Search for and select **ttt-bb-herooo**
   - Configure section settings (padding, content, etc.)

3. **Verify Google Fonts**
   - The section loads Playfair Display and Montserrat fonts from Google Fonts
   - No additional font setup required

### Notes
- Ensure all file names match exactly (case-sensitive)
- The section uses custom CSS variables for spacing control
- JavaScript defers for optimal page load performance

## Google Fonts Installation (REQUIRED)

The generated CSS references these Google Fonts: **Playfair Display, Montserrat, Montserrat**

Add these two tags to `layout/theme.liquid`, inside the `<head>` tag, before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display&family=Montserrat&family=Montserrat&display=swap" rel="stylesheet">
```

Without these tags, the fonts will not load and the design will fall back to system fonts.
