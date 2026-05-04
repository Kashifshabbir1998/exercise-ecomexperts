(function () {
  'use strict';

  class SdFrame8234Element extends HTMLElement {
    constructor() {
      super();
      this._quantities = {};
      this._selectedVariants = {};
      this._currentStep = 1;
      this._boundHandleKeydown = this._handleKeydown.bind(this);
      this._boundHandleClick = this._handleClick.bind(this);
    }

    connectedCallback() {
      this._sectionId = this.dataset.sectionId;
      this._init();
    }

    disconnectedCallback() {
      this.removeEventListener('click', this._boundHandleClick);
      this.removeEventListener('keydown', this._boundHandleKeydown);
    }

    _init() {
      this.addEventListener('click', this._boundHandleClick);
      this.addEventListener('keydown', this._boundHandleKeydown);
      this._syncAllCountLabels();
    }

    _handleClick(event) {
      const target = event.target;

      // Step header toggle
      const stepToggle = target.closest('[data-step-toggle]');
      if (stepToggle) {
        const stepNum = parseInt(stepToggle.dataset.stepToggle, 10);
        this._toggleStep(stepNum);
        return;
      }

      // Next step button
      const nextBtn = target.closest('[data-next-step]');
      if (nextBtn) {
        const nextStep = parseInt(nextBtn.dataset.nextStep, 10);
        this._goToStep(nextStep);
        return;
      }

      // Finalize / Add to cart button
      const finalizeBtn = target.closest('[data-finalize]');
      if (finalizeBtn) {
        this._handleAddToCart(finalizeBtn);
        return;
      }

      // Quantity stepper buttons
      const qtyBtn = target.closest('[data-action="increment"], [data-action="decrement"]');
      if (qtyBtn) {
        const action = qtyBtn.dataset.action;
        const productId = qtyBtn.dataset.productId;
        if (productId) {
          this._adjustQuantity(productId, action === 'increment' ? 1 : -1);
        }
        return;
      }

      // Color swatch buttons
      const swatchBtn = target.closest('.sd-frame-8234__swatch-btn');
      if (swatchBtn) {
        const productId = swatchBtn.dataset.productId;
        const color = swatchBtn.dataset.color;
        if (productId && color) {
          this._selectSwatch(swatchBtn, productId, color);
        }
        return;
      }
    }

    _handleKeydown(event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;

      const stepToggle = event.target.closest('[data-step-toggle]');
      if (stepToggle) {
        event.preventDefault();
        const stepNum = parseInt(stepToggle.dataset.stepToggle, 10);
        this._toggleStep(stepNum);
      }
    }

    _toggleStep(stepNum) {
      const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
      if (!stepEl) return;

      const isActive = stepEl.classList.contains('sd-frame-8234__step--active');

      if (isActive) {
        this._collapseStep(stepNum);
      } else {
        this._expandStep(stepNum);
      }
    }

    _expandStep(stepNum) {
      const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
      if (!stepEl) return;

      const header = stepEl.querySelector('[data-step-toggle]');
      const content = stepEl.querySelector('[data-step-content]');

      stepEl.classList.remove('sd-frame-8234__step--collapsed');
      stepEl.classList.add('sd-frame-8234__step--active');

      if (header) {
        header.setAttribute('aria-expanded', 'true');
      }

      if (content) {
        content.classList.remove('sd-frame-8234__step-content--hidden');
        content.setAttribute('aria-hidden', 'false');
      }

      // Update chevron
      this._updateChevron(stepEl, true);

      // Update count visibility
      const countEl = stepEl.querySelector('[data-selected-count]');
      if (countEl) {
        countEl.classList.remove('sd-frame-8234__step-selected-count--hidden');
      }

      this._currentStep = stepNum;
    }

    _collapseStep(stepNum) {
      const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
      if (!stepEl) return;

      const header = stepEl.querySelector('[data-step-toggle]');
      const content = stepEl.querySelector('[data-step-content]');

      stepEl.classList.remove('sd-frame-8234__step--active');
      stepEl.classList.add('sd-frame-8234__step--collapsed');

      if (header) {
        header.setAttribute('aria-expanded', 'false');
      }

      if (content) {
        content.classList.add('sd-frame-8234__step-content--hidden');
        content.setAttribute('aria-hidden', 'true');
      }

      // Update chevron
      this._updateChevron(stepEl, false);
    }

    _updateChevron(stepEl, isExpanded) {
      const chevronUp = stepEl.querySelector('.sd-frame-8234__chevron--up');
      const chevronDown = stepEl.querySelector('.sd-frame-8234__chevron--down');

      if (isExpanded) {
        if (chevronUp) chevronUp.style.display = '';
        if (chevronDown) chevronDown.style.display = 'none';
      } else {
        if (chevronUp) chevronUp.style.display = 'none';
        if (chevronDown) chevronDown.style.display = '';
      }
    }

    _goToStep(stepNum) {
      // Collapse all steps first
      const allSteps = this.querySelectorAll('[data-step]');
      allSteps.forEach((stepEl) => {
        const num = parseInt(stepEl.dataset.step, 10);
        this._collapseStep(num);
      });

      // Expand the target step
      this._expandStep(stepNum);

      // Scroll step into view
      const targetStep = this.querySelector(`[data-step="${stepNum}"]`);
      if (targetStep) {
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    _adjustQuantity(productId, delta) {
      if (!this._quantities[productId]) {
        this._quantities[productId] = 0;
      }

      const newQty = Math.max(0, this._quantities[productId] + delta);
      this._quantities[productId] = newQty;

      // Update all qty display elements for this product (may appear in multiple steps)
      const qtyDisplays = this.querySelectorAll(`[data-qty-display="${productId}"]`);
      qtyDisplays.forEach((el) => {
        el.textContent = newQty;
      });

      // Update card selected state
      const cards = this.querySelectorAll(`[data-product-id="${productId}"].sd-frame-8234__product-card`);
      cards.forEach((card) => {
        if (newQty > 0) {
          card.classList.add('sd-frame-8234__product-card--selected');
        } else {
          card.classList.remove('sd-frame-8234__product-card--selected');
        }
      });

      // Update minus button disabled state
      const minusBtns = this.querySelectorAll(`[data-action="decrement"][data-product-id="${productId}"]`);
      minusBtns.forEach((btn) => {
        btn.disabled = newQty === 0;
        btn.setAttribute('aria-disabled', newQty === 0 ? 'true' : 'false');
      });

      // Update step count labels
      this._syncStepCountLabel(productId);
    }

    _syncStepCountLabel(productId) {
      // Find which step(s) this product belongs to
      const cards = this.querySelectorAll(`[data-product-id="${productId}"].sd-frame-8234__product-card`);
      const affectedSteps = new Set();

      cards.forEach((card) => {
        const step = card.dataset.step;
        if (step) affectedSteps.add(parseInt(step, 10));
      });

      affectedSteps.forEach((stepNum) => {
        this._updateStepCount(stepNum);
      });
    }

    _updateStepCount(stepNum) {
      const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
      if (!stepEl) return;

      // Count total items selected in this step
      const cards = stepEl.querySelectorAll('.sd-frame-8234__product-card[data-product-id]');
      let totalCount = 0;

      cards.forEach((card) => {
        const productId = card.dataset.productId;
        if (productId && this._quantities[productId]) {
          totalCount += this._quantities[productId];
        }
      });

      const countLabel = stepEl.querySelector(`[data-count-label="${stepNum}"]`);
      if (countLabel) {
        const selectedText = countLabel.textContent.split(' ').slice(1).join(' ') || 'selected';
        countLabel.textContent = `${totalCount} ${selectedText}`;
      }
    }

    _syncAllCountLabels() {
      for (let stepNum = 1; stepNum <= 4; stepNum++) {
        this._updateStepCount(stepNum);
      }
    }

    _selectSwatch(clickedBtn, productId, color) {
      // Find the product card containing this swatch
      const card = clickedBtn.closest('.sd-frame-8234__product-card');
      if (!card) return;

      // Deactivate all swatches in this card
      const swatches = card.querySelectorAll('.sd-frame-8234__swatch-btn');
      swatches.forEach((btn) => {
        btn.classList.remove('sd-frame-8234__swatch-btn--active');
        btn.setAttribute('aria-pressed', 'false');
      });

      // Activate clicked swatch
      clickedBtn.classList.add('sd-frame-8234__swatch-btn--active');
      clickedBtn.setAttribute('aria-pressed', 'true');

      // Store selected color/variant
      this._selectedVariants[productId] = color;

      // Fetch variant data to update image and price
      this._updateCardVariant(card, productId, color);
    }

    _updateCardVariant(card, productId, color) {
      const handle = card.dataset.productHandle;
      if (!handle) return;

      fetch(`/products/${handle}.js`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch product data');
          return res.json();
        })
        .then((product) => {
          // Find variant matching the selected color
          const colorOptionIndex = product.options
            .map((o) => o.toLowerCase())
            .findIndex((o) => o === 'color' || o === 'colour');

          if (colorOptionIndex === -1) return;

          const matchingVariant = product.variants.find((v) => {
            const optionValue = v[`option${colorOptionIndex + 1}`];
            return optionValue && optionValue.toLowerCase() === color.toLowerCase();
          });

          if (!matchingVariant) return;

          // Update price display
          const priceEl = card.querySelector('.sd-frame-8234__price-sale');
          if (priceEl) {
            priceEl.textContent = this._formatMoney(matchingVariant.price);
          }

          const originalPriceEl = card.querySelector('.sd-frame-8234__price-original s');
          if (originalPriceEl && matchingVariant.compare_at_price) {
            originalPriceEl.textContent = this._formatMoney(matchingVariant.compare_at_price);
          }

          // Update image if available
          if (matchingVariant.featured_image) {
            const imgEl = card.querySelector('.sd-frame-8234__product-image');
            if (imgEl) {
              imgEl.src = matchingVariant.featured_image.src;
              imgEl.alt = matchingVariant.featured_image.alt || product.title;
            }
          }

          // Store variant id for cart
          if (!this._quantities[productId]) {
            this._quantities[productId] = 0;
          }
          this._selectedVariants[productId + '_variantId'] = matchingVariant.id;
        })
        .catch(() => {
          // Silently handle fetch errors in production
        });
    }

    _formatMoney(cents) {
      const amount = (cents / 100).toFixed(2);
      return `$${amount}`;
    }

    async _handleAddToCart(btn) {
      // Collect all items with quantity > 0
      const items = [];

      const allCards = this.querySelectorAll('.sd-frame-8234__product-card[data-product-id]');
      const processedProducts = new Set();

      // We need to fetch variant IDs for products we haven't fetched yet
      const fetchPromises = [];

      allCards.forEach((card) => {
        const productId = card.dataset.productId;
        const handle = card.dataset.productHandle;

        if (!productId || processedProducts.has(productId)) return;
        processedProducts.add(productId);

        const qty = this._quantities[productId] || 0;
        if (qty === 0) return;

        const selectedColor = this._selectedVariants[productId];
        const cachedVariantId = this._selectedVariants[productId + '_variantId'];

        if (cachedVariantId) {
          items.push({ id: cachedVariantId, quantity: qty });
        } else if (handle) {
          // Need to fetch first available variant
          fetchPromises.push(
            fetch(`/products/${handle}.js`)
              .then((r) => r.json())
              .then((product) => {
                let variantId = null;

                if (selectedColor) {
                  const colorOptionIndex = product.options
                    .map((o) => o.toLowerCase())
                    .findIndex((o) => o === 'color' || o === 'colour');

                  if (colorOptionIndex !== -1) {
                    const match = product.variants.find((v) => {
                      return (
                        v[`option${colorOptionIndex + 1}`] &&
                        v[`option${colorOptionIndex + 1}`].toLowerCase() === selectedColor.toLowerCase()
                      );
                    });
                    if (match) variantId = match.id;
                  }
                }

                if (!variantId && product.variants.length > 0) {
                  variantId = product.variants[0].id;
                }

                if (variantId) {
                  items.push({ id: variantId, quantity: qty });
                }
              })
              .catch(() => {
                // Skip this product if fetch fails
              })
          );
        }
      });

      if (fetchPromises.length > 0) {
        await Promise.all(fetchPromises);
      }

      if (items.length === 0) {
        this._showMessage('Please select at least one product before adding to cart.', 'error');
        return;
      }

      this._setFinalizeLoading(btn, true);

      try {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({ items }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.description || 'Failed to add items to cart');
        }

        await response.json();

        this._setFinalizeLoading(btn, false);
        this._showMessage('Items added to cart!', 'success');

        // Dispatch cart update event for other cart components
        document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));

        // Optionally redirect to cart
        // window.location.href = '/cart';
      } catch (err) {
        this._setFinalizeLoading(btn, false);
        this._showMessage(err.message || 'Something went wrong. Please try again.', 'error');
      }
    }

    _setFinalizeLoading(btn, isLoading) {
      if (!btn) return;

      if (isLoading) {
        btn.disabled = true;
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Adding...';
        btn.classList.add('sd-frame-8234__next-btn--loading');
      } else {
        btn.disabled = false;
        btn.textContent = btn.dataset.originalText || 'Add to cart';
        btn.classList.remove('sd-frame-8234__next-btn--loading');
      }
    }

    _showMessage(message, type) {
      // Remove any existing message
      const existing = this.querySelector('.sd-frame-8234__message');
      if (existing) existing.remove();

      const msgEl = document.createElement('div');
      msgEl.className = `sd-frame-8234__message sd-frame-8234__message--${type}`;
      msgEl.setAttribute('role', 'alert');
      msgEl.setAttribute('aria-live', 'assertive');
      msgEl.textContent = message;

      const wizard = this.querySelector('.sd-frame-8234__wizard');
      if (wizard) {
        wizard.appendChild(msgEl);
      } else {
        this.appendChild(msgEl);
      }

      setTimeout(() => {
        if (msgEl.parentNode) msgEl.remove();
      }, 5000);
    }

    reset() {
      // Reset quantities
      this._quantities = {};
      this._selectedVariants = {};

      // Reset all qty displays
      const qtyDisplays = this.querySelectorAll('[data-qty-display]');
      qtyDisplays.forEach((el) => {
        el.textContent = '0';
      });

      // Remove selected card states
      const selectedCards = this.querySelectorAll('.sd-frame-8234__product-card--selected');
      selectedCards.forEach((card) => card.classList.remove('sd-frame-8234__product-card--selected'));

      // Reset minus buttons
      const minusBtns = this.querySelectorAll('.sd-frame-8234__qty-btn--minus');
      minusBtns.forEach((btn) => {
        btn.disabled = false;
        btn.removeAttribute('aria-disabled');
      });

      // Reset swatches to first active
      const swatchGroups = this.querySelectorAll('.sd-frame-8234__swatches');
      swatchGroups.forEach((group) => {
        const btns = group.querySelectorAll('.sd-frame-8234__swatch-btn');
        btns.forEach((btn, idx) => {
          if (idx === 0) {
            btn.classList.add('sd-frame-8234__swatch-btn--active');
            btn.setAttribute('aria-pressed', 'true');
          } else {
            btn.classList.remove('sd-frame-8234__swatch-btn--active');
            btn.setAttribute('aria-pressed', 'false');
          }
        });
      });

      // Reset count labels
      this._syncAllCountLabels();

      // Reset to step 1
      this._goToStep(1);
    }
  }

  // Register the custom element
  if (!customElements.get('sd-frame-8234')) {
    customElements.define('sd-frame-8234', SdFrame8234Element);
  }

  // Handle Shopify section editor events
  function getSectionElement(sectionId) {
    return document.querySelector(`sd-frame-8234[data-section-id="${sectionId}"]`);
  }

  document.addEventListener('shopify:section:load', (event) => {
    const sectionId = event.detail.sectionId;
    const el = getSectionElement(sectionId);
    if (el && typeof el._init === 'function') {
      el._init();
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    const sectionId = event.detail.sectionId;
    const el = getSectionElement(sectionId);
    if (el && typeof el.disconnectedCallback === 'function') {
      el.disconnectedCallback();
    }
  });

  document.addEventListener('shopify:block:select', (event) => {
    const sectionId = event.detail.sectionId;
    const el = getSectionElement(sectionId);
    if (!el) return;

    const block = event.target;
    if (!block) return;

    // If the selected block is inside a step, expand that step
    const stepEl = block.closest('[data-step]');
    if (stepEl) {
      const stepNum = parseInt(stepEl.dataset.step, 10);
      el._goToStep(stepNum);
    }
  });
})();