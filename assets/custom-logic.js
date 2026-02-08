document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('product-popup-modal');
  const overlay = modal.querySelector('.custom-popup-overlay');
  const closeBtn = modal.querySelector('.custom-popup-close');
  const form = document.getElementById('popup-product-form');
  const variantsContainer = document.getElementById('popup-variants-container');

  const softWinterJacketSettings = document.getElementById('custom-grid-settings');
  const bonusProductVariantId = softWinterJacketSettings.dataset.softWinterJacketVariantId;

  document.querySelectorAll('.custom-product-item__hotspot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      document.querySelectorAll('.custom-mini-popup').forEach(p => {
        p.style.display = 'none';
        p.setAttribute('aria-hidden', 'true');
        const siblingHotspot = p.closest('.custom-product-item')?.querySelector('.custom-product-item__hotspot');
        if (siblingHotspot) siblingHotspot.style.display = 'flex';
      });

      const productWrapper = btn.closest('.custom-product-item');
      const miniPopup = productWrapper.querySelector('.custom-mini-popup');

      if (miniPopup) {
        btn.style.display = 'none';
        miniPopup.style.display = 'flex';
        miniPopup.setAttribute('aria-hidden', 'false');

        miniPopup.onclick = (evt) => {
          if (evt.target.closest('.custom-mini-popup__close')) return;

          const scriptTag = productWrapper.querySelector('.product-data-json');

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
          miniPopup.style.display = 'none';
          btn.style.display = 'flex';
        };

        const miniClose = miniPopup.querySelector('.custom-mini-popup__close');
        if (miniClose) {
          miniClose.onclick = (eva) => {
            eva.stopPropagation();
            miniPopup.style.display = 'none';
            btn.style.display = 'flex';
          };
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-mini-popup') && !e.target.closest('.custom-product-item__hotspot')) {
      document.querySelectorAll('.custom-mini-popup').forEach(p => {
        p.style.display = 'none';
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

    const price = (product.price / 100).toFixed(2);
    document.getElementById('popup-product-price').textContent = `€${price}`;

    renderVariants(product);

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

  function renderVariants(product) {
    variantsContainer.innerHTML = '';

    console.log('Rendering variants for', product.title);

    if (product.variants.length > 0) {
      product.options.forEach((option, index) => {
        if (option === 'Title' && product.variants[0].option1 === 'Default Title') return;

        const selectWrapper = document.createElement('div');
        selectWrapper.classList.add('custom-variant-select-wrapper');

        const label = document.createElement('label');
        label.textContent = option;
        selectWrapper.appendChild(label);

        const isColor = option.toLowerCase() === 'color';

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
            if (values.indexOf(val) === 0) btn.classList.add('selected');
            btn.textContent = val;
            btn.dataset.value = val;
            btn.dataset.optionIndex = index;

            btn.onclick = () => {
              grid.querySelectorAll('.custom-variant-option-btn').forEach(b => b.classList.remove('selected'));
              btn.classList.add('selected');
              updateSelectedVariant(product);
            };

            grid.appendChild(btn);
          });
          selectWrapper.appendChild(grid);
        } else {
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
    const currentOptions = [];

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


  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    const variantId = document.getElementById('popup-variant-id').value;

    let isBlack = false;
    let isMedium = false;

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
      await addToCart(variantId);

      if (isBlack && isMedium) {
        console.log('Bonus condition met: Black & Medium selected.');

        let variantIdToAdd = bonusProductVariantId;

        if (!variantIdToAdd) {
          try {
            console.log('Searching for Soft Winter Jacket...');
            const searchRes = await fetch(window.Shopify.routes.root + 'search/suggest.json?q=Soft%20Winter%20Jacket&resources[type]=product');
            const searchData = await searchRes.json();

            const product = searchData.resources.results.products[0];
            if (product) {
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

    const root = window.Shopify && window.Shopify.routes && window.Shopify.routes.root ? window.Shopify.routes.root : '/';
    const url = root + 'cart/add.js';

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

  const ctaToggle = document.getElementById('custom-cta-toggle');
  const ctaContainer = document.getElementById('custom-cta-strip-container');

  if (ctaToggle && ctaContainer) {
    ctaToggle.addEventListener('click', () => {
      ctaContainer.classList.toggle('is-expanded');

      const iconHamburger = ctaToggle.querySelector('.icon-hamburger');
      const iconClose = ctaToggle.querySelector('.icon-close');

      if (ctaContainer.classList.contains('is-expanded')) {
        if (iconHamburger) iconHamburger.style.display = 'none';
        if (iconClose) iconClose.style.display = 'block';
      } else {
        if (iconHamburger) iconHamburger.style.display = 'block';
        if (iconClose) iconClose.style.display = 'none';
      }
    });
  }

});
