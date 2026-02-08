document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('product-popup-modal');
  const overlay = modal.querySelector('.custom-popup-overlay');
  const closeBtn = modal.querySelector('.custom-popup-close');
  const form = document.getElementById('popup-product-form');
  const variantsContainer = document.getElementById('popup-variants-container');
  
  const softWinterJacketSettings = document.getElementById('custom-grid-settings');
  // Fallback to the ID provided by user if liquid didn't output one (e.g. product not selected in customizer yet)
  // But wait, if they didn't select it in customizer, we need a way to get the ID. 
  // We will assume the user selects it or we use the fallback logic in search.
  const bonusProductVariantId = softWinterJacketSettings.dataset.softWinterJacketVariantId; 

  // --- POPUP LOGIC ---

  document.querySelectorAll('.custom-product-item__hotspot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const productWrapper = btn.closest('.custom-product-item');
      if (!productWrapper) return;
      
      const scriptTag = productWrapper.querySelector('.product-data-json');
      if (!scriptTag) return;

      const product = JSON.parse(scriptTag.textContent);
      openModal(product);
    });
  });

  function openModal(product) {
    document.getElementById('popup-product-title').textContent = product.title;
    document.getElementById('popup-product-description').innerHTML = product.description; // Description is HTML
    document.getElementById('popup-product-image').src = product.featured_image;
    document.getElementById('popup-product-image').alt = product.title;
    
    // Format Price
    // Simple formatter, for production use Shopify.formatMoney or similar if available, 
    // but here we just divide by 100 for basic display
    const price = (product.price / 100).toFixed(2);
    document.getElementById('popup-product-price').textContent = `€${price}`; // Hardcoding currency symbol for this test based on Figma

    // Render Variants
    renderVariants(product);

    // Set initial variant ID
    const firstVariant = product.variants[0];
    document.getElementById('popup-variant-id').value = firstVariant.id;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-visible');
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-visible');
  }

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  // --- VARIANT LOGIC ---

  function renderVariants(product) {
    variantsContainer.innerHTML = '';

    if (product.variants.length > 1) {
      // Create a select dropdown or radio buttons. Figma shows simple info.
      // Let's create dropdowns for options.
      
      product.options.forEach((option, index) => {
        const selectWrapper = document.createElement('div');
        selectWrapper.classList.add('custom-variant-select-wrapper');
        
        const label = document.createElement('label');
        label.textContent = option;
        selectWrapper.appendChild(label);

        const select = document.createElement('select');
        select.classList.add('custom-variant-select');
        select.dataset.optionIndex = index; // 0, 1, 2
        
        // derived from product.variants to find unique values for this option
        // BUT product.options is just names ["Size", "Color"].
        // product.variants has "option1", "option2", etc.
        
        const values = [...new Set(product.variants.map(v => v.options[index]))];
        
        values.forEach(val => {
          const opt = document.createElement('option');
          opt.value = val;
          opt.textContent = val;
          select.appendChild(opt);
        });

        // Listen for change
        select.addEventListener('change', () => updateSelectedVariant(product));

        selectWrapper.appendChild(select);
        variantsContainer.appendChild(selectWrapper);
      });
    } else {
        // Single variant, no selectors needed usually, but logic handles hidden input
    }
  }

  function updateSelectedVariant(product) {
    // Gather current selections
    const selects = variantsContainer.querySelectorAll('select');
    const currentOptions = Array.from(selects).map(s => s.value);
    
    // Find matching variant
    const variant = product.variants.find(v => {
      // v.options is an array of strings like ["Small", "Red"]
      return v.options.every((opt, i) => opt === currentOptions[i]);
    });

    if (variant) {
       document.getElementById('popup-variant-id').value = variant.id;
       document.getElementById('popup-product-price').textContent = `€${(variant.price / 100).toFixed(2)}`;
       if(variant.featured_image) {
         document.getElementById('popup-product-image').src = variant.featured_image.src;
       }
    }
  }


  // --- CART LOGIC ---

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    const variantId = document.getElementById('popup-variant-id').value;
    
    // Check for "Black" and "Medium" logic
    // We can check the selected options in the DOM
    const selects = variantsContainer.querySelectorAll('select');
    let isBlack = false;
    let isMedium = false;

    selects.forEach(select => {
       const val = select.value.toLowerCase();
       if (val === 'black') isBlack = true;
       if (val === 'medium') isMedium = true;
    });

    try {
      // 1. Add Main Item
      await addToCart(variantId);

      // 2. Bonus Logic
      if (isBlack && isMedium) {
         // Need to add Soft Winter Jacket
         // Check if we have a variant ID for it
         if (bonusProductVariantId) {
            await addToCart(bonusProductVariantId);
            console.log('Bonus product added!');
         } else {
            console.warn('Soft Winter Jacket variant ID not found. Make sure to select the product in Customizer.');
         }
      }

      // 3. Update Cart / Open Drawer (Dawn specific)
      // Dawn listens to generic events or we can force fetch
      // Try dispatching an event that Dawn listens to, or just redirect/refresh.
      // Easiest for this test: Fetch cart, update UI, or just alert.
      // But user instructions: "adds the product to the cart".
      // Dawn usually updates automatically if we use the right routes? 
      // Actually standard Dawn custom additions might not trigger drawer unless we use their pubsub.
      // We'll try to trigger a refresh of the cart bubble at least.
      
      // Refresh page or cart
      window.location.href = '/cart'; 
      
    } catch (err) {
      console.error(err);
      alert('Error adding to cart');
    } finally {
      submitBtn.textContent = 'ADD TO CART';
      submitBtn.disabled = false;
      closeModal();
    }
  });

  async function addToCart(id, qty = 1) {
    const formData = {
      'items': [{
        'id': id,
        'quantity': qty
      }]
    };

    const response = await fetch(window.Shopify.routes.root + 'cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Failed to add to cart');
    return await response.json();
  }

});
