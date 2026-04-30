## Install qw111 Section

### File Structure
Add these files to your theme:

1. **sections/qw111.liquid** — Main product detail section
2. **assets/qw111.js** — JavaScript functionality for gallery and interactions
3. **assets/qw111.css** — Section styling
4. **snippets/product-media-gallery.liquid** — Product image gallery component
5. **snippets/product-variant-swatches.liquid** — Variant selection swatches
6. **snippets/product-add-to-cart.liquid** — Add to cart button with inventory handling
7. **snippets/trust-badges.liquid** — Shipping and returns trust badges
8. **snippets/ugc-gallery.liquid** — User-generated content gallery carousel
9. **snippets/review-summary.liquid** — Review rating and count display

### Setup Steps

1. In your Shopify theme editor, go to **Content > Pages** and select your product detail page template
2. Add the **qw111** section to the page layout by clicking **Add section** and selecting it
3. Configure section settings:
   - Set padding top/bottom values as needed
   - Enable/disable Shop Pay messaging
   - Customize trust badge text (free shipping, returns copy)
   - Set UGC section heading
4. Save and publish

### Notes
- Ensure product data (variants, images, reviews) is populated in your product
- Review the CSS for color variables and adjust to match your brand
- Test gallery interactions on mobile and desktop devices