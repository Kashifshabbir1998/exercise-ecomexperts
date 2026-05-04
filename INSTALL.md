1. Add the following files to your theme:
   - `sections/sd-frame-1736.liquid` — Main section file
   - `assets/sd-frame-1736.js` — Section JavaScript functionality
   - `assets/sd-frame-1736.css` — Section styles
   - `snippets/bundle-line-item.liquid` — Bundle item renderer
   - `snippets/quantity-stepper.liquid` — Quantity increment/decrement component
   - `snippets/bundle-plan-row.liquid` — Pricing plan row component
   - `snippets/bundle-order-summary.liquid` — Order summary component

2. In the Shopify theme editor:
   - Navigate to **Sales channels > Online Store > Theme > Edit code**
   - Upload all files to their respective directories

3. Add the section to your desired page template:
   - Edit the page template in the theme editor (e.g., `product.json` or `page.json`)
   - Click **Add section** and select **sd-frame-1736**
   - Configure section settings as needed (padding, heading, label, etc.)

4. Customize settings in the theme editor:
   - Set padding top/bottom values
   - Configure heading and label text
   - Adjust bundle product data and pricing options

The section is now ready to display bundle products with quantity controls, pricing plans, and order summaries.