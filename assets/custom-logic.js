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

  // Hotspot Click -> Show Mini Popup
  document.querySelectorAll('.custom-product-item__hotspot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling
      e.preventDefault();

      // Close any other open mini popups AND reset their hotspots
      document.querySelectorAll('.custom-mini-popup').forEach(p => {
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
        // Find sibling hotspot and show it
        const siblingHotspot = p.closest('.custom-product-item')?.querySelector('.custom-product-item__hotspot');
        if (siblingHotspot) siblingHotspot.style.display = 'flex';
      });

      const productWrapper = btn.closest('.custom-product-item');
      const miniPopup = productWrapper.querySelector('.custom-mini-popup');

      if (miniPopup) {
        // Toggle: Hide Button, Show Popup
        btn.style.display = 'none';
        miniPopup.style.display = 'flex';
        miniPopup.setAttribute('aria-hidden', 'false');

        // Setup click to open full modal
        // We might need to attach the data to the mini popup for easy access
        // Or just grab it again from the wrapper
        miniPopup.onclick = (evt) => {
          if (evt.target.closest('.custom-mini-popup__close')) return; // ignore close button

          const scriptTag = productWrapper.querySelector('.product-data-json');
          // ... same fetch/parse logic ... 

          let productData;
          try { productData = JSON.parse(scriptTag.textContent); } catch (ex) { }

          if (typeof productData === 'string' || !productData.variants) {
            const handle = typeof productData === 'string' ? productData : btn.dataset.productHandle;
            if (handle) {
              fetch(window.Shopify.routes.root + 'products/' + handle + '.js')
                .then(r => r.json()).then(d => openModal(d));
            }
          } else {
            openModal(productData);
          }
          // Close mini popup after opening full
          miniPopup.style.display = 'none';
          btn.style.display = 'flex'; // Show button again
        };

        // Close button logic for mini popup
        const miniClose = miniPopup.querySelector('.custom-mini-popup__close');
        if (miniClose) {
          miniClose.onclick = (eva) => {
            eva.stopPropagation();
            miniPopup.style.display = 'none';
            btn.style.display = 'flex'; // Show button again
          };
        }
      }
    });
  });

  // Close mini popups if clicked elsewhere
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-mini-popup') && !e.target.closest('.custom-product-item__hotspot')) {
      document.querySelectorAll('.custom-mini-popup').forEach(p => {
        p.style.display = 'none';
        // Reset hotspot
        const siblingHotspot = p.closest('.custom-product-item')?.querySelector('.custom-product-item__hotspot');
        if (siblingHotspot) siblingHotspot.style.display = 'flex';
      });
    }
  });


  function openModal(product) {
    if (!product || !product.variants) {
      console.error('openModal called with invalid product:', product);
      return;
    }
    document.getElementById('popup-product-title').textContent = product.title;
    document.getElementById('popup-product-description').innerHTML = product.description;
    document.getElementById('popup-product-image').src = product.featured_image;
    document.getElementById('popup-product-image').alt = product.title;

    // Price
    const price = (product.price / 100).toFixed(2);
    document.getElementById('popup-product-price').textContent = `€${price}`;

    renderVariants(product);

    // Initial ID
    const firstVariant = product.variants[0];
    document.getElementById('popup-variant-id').value = firstVariant.id;

    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  overlay.addEventListener('click', closeModal);
  closeBtn.addEventListener('click', closeModal);

  // --- VARIANT LOGIC ---

  function renderVariants(product) {
    variantsContainer.innerHTML = '';

    // Debug
    console.log('Rendering variants for', product.title);

    if (product.variants.length > 0) {
      product.options.forEach((option, index) => {
        if (option === 'Title' && product.variants[0].option1 === 'Default Title') return;

        const selectWrapper = document.createElement('div');
        selectWrapper.classList.add('custom-variant-select-wrapper');

        const label = document.createElement('label');
        label.textContent = option;
        selectWrapper.appendChild(label);

        // Check if option is "Color" -> Use Buttons
        const isColor = option.toLowerCase() === 'color';

        // Get unique values
        const values = [];
        product.variants.forEach(v => {
          const val = v.options[index];
          if (!values.includes(val)) values.push(val);
        });

        if (isColor) {
          const grid = document.createElement('div');
          grid.classList.add('custom-variant-options-grid');

          values.forEach(val => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.classList.add('custom-variant-option-btn');
            if (values.indexOf(val) === 0) btn.classList.add('selected'); // Select first default
            btn.textContent = val;
            btn.dataset.value = val;
            btn.dataset.optionIndex = index;

            btn.onclick = () => {
              // Deselect siblings
              grid.querySelectorAll('.custom-variant-option-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              updateSelectedVariant(product);
            };

            grid.appendChild(btn);
          });
          selectWrapper.appendChild(grid);
        } else {
          // Standard Select for Size etc.
          const select = document.createElement('select');
          select.classList.add('custom-variant-select');
          select.dataset.optionIndex = index;

          values.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            select.appendChild(opt);
          });

          select.addEventListener('change', () => updateSelectedVariant(product));
          selectWrapper.appendChild(select);
        }

        variantsContainer.appendChild(selectWrapper);
      });
    }
  }

  function updateSelectedVariant(product) {
    // Gather current selections from BOTH selects and buttons
    const currentOptions = [];

    // Since options are ordered by index, we need to grab them in order
    const optionWrappers = variantsContainer.querySelectorAll('.custom-variant-select-wrapper');

    optionWrappers.forEach(wrapper => {
      const select = wrapper.querySelector('select');
      const buttons = wrapper.querySelector('.custom-variant-options-grid');

      if (select) {
        currentOptions.push(select.value);
      } else if (buttons) {
        const selectedBtn = buttons.querySelector('.custom-variant-option-btn.selected');
        if (selectedBtn) currentOptions.push(selectedBtn.dataset.value);
      }
    });

    // Find matching variant
    const variant = product.variants.find(v => {
      return v.options.every((opt, i) => opt === currentOptions[i]);
    });

    if (variant) {
      document.getElementById('popup-variant-id').value = variant.id;
      document.getElementById('popup-product-price').textContent = `€${(variant.price / 100).toFixed(2)}`;
      if (variant.featured_image) {
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
    let isBlack = false;
    let isMedium = false;

    // Scan all selected values options (both selects and buttons)
    const optionWrappers = variantsContainer.querySelectorAll('.custom-variant-select-wrapper');
    optionWrappers.forEach(wrapper => {
      let val = '';
      const select = wrapper.querySelector('select');
      const buttons = wrapper.querySelector('.custom-variant-options-grid');
      if (select) val = select.value;
      else if (buttons) val = buttons.querySelector('.selected')?.dataset.value || '';

      if (val.toLowerCase() === 'black') isBlack = true;
      if (val.toLowerCase() === 'medium') isMedium = true;
    });

    try {
      // 1. Add Main Item
      await addToCart(variantId);

      // 2. Bonus Logic
      if (isBlack && isMedium) {
        console.log('Bonus condition met: Black & Medium selected.');

        let variantIdToAdd = bonusProductVariantId;

        // If we don't have the ID from settings, try to find it via API
        if (!variantIdToAdd) {
          try {
            console.log('Searching for Soft Winter Jacket...');
            const searchRes = await fetch(window.Shopify.routes.root + 'search/suggest.json?q=Soft%20Winter%20Jacket&resources[type]=product');
            const searchData = await searchRes.json();

            const product = searchData.resources.results.products[0];
            if (product) {
              // Fetch full product data to get variant ID, usually .js endpoint works
              const productRes = await fetch(product.url + '.js');
              const productData = await productRes.json();
              variantIdToAdd = productData.variants[0].id;
              console.log('Found Soft Winter Jacket Variant ID:', variantIdToAdd);
            }
          } catch (err) {
            console.error('Failed to find Soft Winter Jacket dynamically:', err);
          }
        }

        if (variantIdToAdd) {
          await addToCart(variantIdToAdd);
          console.log('Bonus product added!');
        } else {
          console.warn('Soft Winter Jacket variant ID not found. Helper search also failed.');
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

    // Fallback if window.Shopify.routes is not defined (sometimes happens in development themes or basic setups)
    const root = window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/';
    const url = root + 'cart/add.js';

    // Remove double slashes if any (e.g. //cart/add.js)
    const cleanUrl = url.replace('//', '/');

    console.log('Adding to cart:', cleanUrl, formData);

    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Add to cart failed:', text);
      throw new Error('Failed to add to cart: ' + response.statusText);
    }
    return await response.json();
  }

});
