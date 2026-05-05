## Installation Instructions

### 1. Add Files to Theme

Add the following files to your Shopify theme:

**Sections:**
- `sections/yooutubeeeee.liquid`

**Assets:**
- `assets/yooutubeeeee.js`
- `assets/yooutubeeeee.css`

**Snippets:**
- `snippets/sd-snip-video-card.liquid`
- `snippets/sd-snip-filter-pills.liquid`

### 2. Add Section to Page Template

1. In the Shopify theme editor, navigate to **Pages** and open the page where you want to add the section
2. Click **Add section**
3. Find and select **Yooutubeeeee** from the section list
4. Configure section settings:
   - Toggle **Show Filter Pills** to enable/disable category filters
   - Adjust **Padding Top** and **Padding Bottom** for spacing
5. Add filter pill blocks by clicking **Add block** and selecting **Filter Pill**
6. For each filter pill block, enter the category name
7. Click **Save**

### 3. Verify Installation

- Confirm the section displays correctly on your page
- Test filter functionality by clicking category pills
- Verify responsive behavior on mobile devices
- Check that video cards render properly with the filter system

### Notes

- The section requires Swiper.js for carousel functionality (included in assets)
- All styling is scoped to `.sd-yooutubeeeee` class to avoid conflicts
- JavaScript uses custom element `<sd-yooutubeeeee>` for encapsulation

## Google Fonts Installation (REQUIRED)

The generated CSS references these Google Fonts: **Roboto**

Add these two tags to `layout/theme.liquid`, inside the `<head>` tag, before the closing `</head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
```

Without these tags, the fonts will not load and the design will fall back to system fonts.
