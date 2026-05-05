class SdFrame8234 extends HTMLElement {
  constructor() {
    super();
    this._sectionId = null;
    this._bundleState = {
      cameras: {},
      plan: {},
      sensors: {},
      protection: {}
    };
    this._boundHandlers = {};
  }

  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._init();
  }

  disconnectedCallback() {
    this._destroy();
  }

  _init() {
    this._initStepAccordions();
    this._initNextStepButtons();
    this._initProductCards();
    this._initQuantitySteppers();
    this._initVariantPills();
    this._initAtcButton();
    this._updateProgressLabel(1);
    this._updateBundleTotal();
  }

  _destroy() {
    // Clean up any bound event listeners if needed
    this.querySelectorAll('[data-select-btn]').forEach(btn => {
      btn.removeEventListener('click', btn._sdSelectHandler);
    });
    this.querySelectorAll('[data-qty-minus], [data-qty-plus]').forEach(btn => {
      btn.removeEventListener('click', btn._sdQtyHandler);
    });
    this.querySelectorAll('[data-qty-input]').forEach(input => {
      input.removeEventListener('change', input._sdQtyChangeHandler);
    });
    this.querySelectorAll('.variant-pills__input').forEach(input => {
      input.removeEventListener('change', input._sdVariantHandler);
    });
    this.querySelectorAll('.sd-frame-8234__step-header').forEach(header => {
      header.removeEventListener('click', header._sdAccordionHandler);
      header.removeEventListener('keydown', header._sdAccordionKeyHandler);
    });
    this.querySelectorAll('[data-next-step]').forEach(btn => {
      btn.removeEventListener('click', btn._sdNextStepHandler);
    });
    const atcBtn = this.querySelector('[data-atc-bundle]');
    if (atcBtn) {
      atcBtn.removeEventListener('click', atcBtn._sdAtcHandler);
    }
  }

  // ─── Step Accordion ──────────────────────────────────────────────────────────

  _initStepAccordions() {
    const headers = this.querySelectorAll('.sd-frame-8234__step-header');
    headers.forEach(header => {
      const handler = (e) => this._handleAccordionToggle(header);
      const keyHandler = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._handleAccordionToggle(header);
        }
      };
      header._sdAccordionHandler = handler;
      header._sdAccordionKeyHandler = keyHandler;
      header.addEventListener('click', handler);
      header.addEventListener('keydown', keyHandler);
    });
  }

  _handleAccordionToggle(header) {
    const step = header.closest('[data-step]');
    if (!step) return;
    const isExpanded = header.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      this._collapseStep(step);
    } else {
      this._expandStep(step);
    }
  }

  _expandStep(step) {
    const stepKey = step.dataset.stepKey;
    const bodyId = `sd-step-${stepKey}-body-${this._sectionId}`;
    const body = this.querySelector(`#${bodyId}`);
    const header = step.querySelector('.sd-frame-8234__step-header');
    const chevron = step.querySelector('.sd-frame-8234__step-chevron');

    if (!body || !header) return;

    header.setAttribute('aria-expanded', 'true');
    body.removeAttribute('hidden');
    step.classList.remove('sd-frame-8234__step--collapsed');
    step.classList.add('sd-frame-8234__step--active');

    if (chevron) {
      chevron.classList.remove('sd-frame-8234__step-chevron--down');
    }
  }

  _collapseStep(step) {
    const stepKey = step.dataset.stepKey;
    const bodyId = `sd-step-${stepKey}-body-${this._sectionId}`;
    const body = this.querySelector(`#${bodyId}`);
    const header = step.querySelector('.sd-frame-8234__step-header');
    const chevron = step.querySelector('.sd-frame-8234__step-chevron');

    if (!body || !header) return;

    header.setAttribute('aria-expanded', 'false');
    body.setAttribute('hidden', '');
    step.classList.add('sd-frame-8234__step--collapsed');
    step.classList.remove('sd-frame-8234__step--active');

    if (chevron) {
      chevron.classList.add('sd-frame-8234__step-chevron--down');
    }
  }

  _openStep(stepNumber) {
    const targetStep = this.querySelector(`[data-step="${stepNumber}"]`);
    if (!targetStep) return;

    // Collapse all other steps
    this.querySelectorAll('[data-step]').forEach(step => {
      if (step !== targetStep) {
        this._collapseStep(step);
      }
    });

    this._expandStep(targetStep);
    this._updateProgressLabel(stepNumber);

    // Scroll to step
    setTimeout(() => {
      targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // ─── Next Step Buttons ───────────────────────────────────────────────────────

  _initNextStepButtons() {
    const buttons = this.querySelectorAll('[data-next-step]');
    buttons.forEach(btn => {
      const handler = () => {
        const nextStep = parseInt(btn.dataset.nextStep, 10);
        if (!isNaN(nextStep)) {
          this._openStep(nextStep);
        }
      };
      btn._sdNextStepHandler = handler;
      btn.addEventListener('click', handler);
    });
  }

  // ─── Progress Label ──────────────────────────────────────────────────────────

  _updateProgressLabel(currentStep) {
    const label = this.querySelector('[data-progress-label]');
    if (!label) return;
    const totalSteps = this.querySelectorAll('[data-step]').length;
    const baseText = label.textContent || '';
    // Replace step number in text if pattern matches
    const updated = baseText.replace(/Step \d+ of \d+/i, `Step ${currentStep} of ${totalSteps}`);
    if (updated !== baseText) {
      label.textContent = updated;
    }
  }

  // ─── Product Cards (Select/Deselect) ────────────────────────────────────────

  _initProductCards() {
    const selectBtns = this.querySelectorAll('[data-select-btn]');
    selectBtns.forEach(btn => {
      const handler = () => this._handleSelectToggle(btn);
      btn._sdSelectHandler = handler;
      btn.addEventListener('click', handler);
    });
  }

  _handleSelectToggle(btn) {
    const card = btn.closest('[data-bundle-card]');
    if (!card) return;

    const productId = btn.dataset.productId;
    const stepKey = btn.dataset.stepKey;
    const isPressed = btn.getAttribute('aria-pressed') === 'true';

    if (isPressed) {
      this._deselectCard(card, btn, stepKey, productId);
    } else {
      this._selectCard(card, btn, stepKey, productId);
    }

    this._updateSelectedBadge(stepKey);
    this._updateBundleTotal();
  }

  _selectCard(card, btn, stepKey, productId) {
    const variantId = parseInt(card.dataset.variantId, 10);
    const price = parseInt(card.dataset.price, 10) || 0;
    const qtyInput = card.querySelector('[data-qty-input]');
    const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    // For plan step, deselect others first (single select)
    if (stepKey === 'plan') {
      this._deselectAllInStep(stepKey);
    }

    // Update quantity to at least 1 if it's 0
    if (qtyInput && parseInt(qtyInput.value, 10) === 0) {
      qtyInput.value = 1;
      this._syncQuantityState(qtyInput);
    }

    const finalQty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

    this._bundleState[stepKey][productId] = {
      variantId,
      price,
      qty: finalQty
    };

    card.classList.add('bundle-product-card--selected');
    btn.setAttribute('aria-pressed', 'true');
    btn.classList.add('bundle-product-card__select-btn--selected');

    const label = btn.querySelector('[data-select-label]');
    if (label) {
      label.textContent = 'Remove';
    }
  }

  _deselectCard(card, btn, stepKey, productId) {
    delete this._bundleState[stepKey][productId];

    card.classList.remove('bundle-product-card--selected');
    btn.setAttribute('aria-pressed', 'false');
    btn.classList.remove('bundle-product-card__select-btn--selected');

    const label = btn.querySelector('[data-select-label]');
    if (label) {
      // Try to use t() equivalent — fallback to static string
      label.textContent = window.Shopify && window.Shopify.theme ? 'Add to Cart' : 'Add to Cart';
    }
  }

  _deselectAllInStep(stepKey) {
    const cards = this.querySelectorAll(`[data-bundle-card][data-step-key="${stepKey}"]`);
    cards.forEach(card => {
      const productId = card.dataset.productId;
      const btn = card.querySelector('[data-select-btn]');
      if (btn) {
        this._deselectCard(card, btn, stepKey, productId);
      }
    });
    this._bundleState[stepKey] = {};
  }

  // ─── Quantity Steppers ───────────────────────────────────────────────────────

  _initQuantitySteppers() {
    const steppers = this.querySelectorAll('[data-quantity-stepper]');
    steppers.forEach(stepper => {
      const minusBtn = stepper.querySelector('[data-qty-minus]');
      const plusBtn = stepper.querySelector('[data-qty-plus]');
      const input = stepper.querySelector('[data-qty-input]');

      if (!input) return;

      if (minusBtn) {
        const handler = () => this._adjustQuantity(stepper, input, -1);
        minusBtn._sdQtyHandler = handler;
        minusBtn.addEventListener('click', handler);
      }

      if (plusBtn) {
        const handler = () => this._adjustQuantity(stepper, input, 1);
        plusBtn._sdQtyHandler = handler;
        plusBtn.addEventListener('click', handler);
      }

      const changeHandler = () => {
        const min = parseInt(input.min, 10) || 0;
        const max = parseInt(input.max, 10) || 10;
        let val = parseInt(input.value, 10);
        if (isNaN(val)) val = min;
        val = Math.min(Math.max(val, min), max);
        input.value = val;
        this._syncQuantityState(input);
        this._updateCardStateFromQty(stepper, val);
      };
      input._sdQtyChangeHandler = changeHandler;
      input.addEventListener('change', changeHandler);
      input.addEventListener('input', changeHandler);
    });
  }

  _adjustQuantity(stepper, input, delta) {
    const min = parseInt(input.min, 10) || 0;
    const max = parseInt(input.max, 10) || 10;
    let current = parseInt(input.value, 10) || 0;
    const newVal = Math.min(Math.max(current + delta, min), max);
    input.value = newVal;
    this._syncQuantityState(input);
    this._updateCardStateFromQty(stepper, newVal);
  }

  _syncQuantityState(input) {
    const stepper = input.closest('[data-quantity-stepper]');
    if (!stepper) return;
    const min = parseInt(input.min, 10) || 0;
    const max = parseInt(input.max, 10) || 10;
    const val = parseInt(input.value, 10) || 0;
    const minusBtn = stepper.querySelector('[data-qty-minus]');
    const plusBtn = stepper.querySelector('[data-qty-plus]');

    if (minusBtn) {
      if (val <= min) {
        minusBtn.disabled = true;
        minusBtn.setAttribute('aria-disabled', 'true');
      } else {
        minusBtn.disabled = false;
        minusBtn.removeAttribute('aria-disabled');
      }
    }
    if (plusBtn) {
      if (val >= max) {
        plusBtn.disabled = true;
        plusBtn.setAttribute('aria-disabled', 'true');
      } else {
        plusBtn.disabled = false;
        plusBtn.removeAttribute('aria-disabled');
      }
    }

    // Update price display on card
    const card = stepper.closest('[data-bundle-card]');
    if (card) {
      const productId = card.dataset.productId;
      const stepKey = card.dataset.stepKey;
      if (
        stepKey &&
        productId &&
        this._bundleState[stepKey] &&
        this._bundleState[stepKey][productId]
      ) {
        this._bundleState[stepKey][productId].qty = val;
        this._updateBundleTotal();
      }
    }
  }

  _updateCardStateFromQty(stepper, qty) {
    const card = stepper.closest('[data-bundle-card]');
    if (!card) return;

    const productId = card.dataset.productId;
    const stepKey = card.dataset.stepKey;
    const btn = card.querySelector('[data-select-btn]');

    if (qty > 0) {
      // Auto-select card if qty > 0 and not already selected
      if (btn && btn.getAttribute('aria-pressed') !== 'true') {
        this._selectCard(card, btn, stepKey, productId);
      } else if (
        stepKey &&
        productId &&
        this._bundleState[stepKey] &&
        this._bundleState[stepKey][productId]
      ) {
        this._bundleState[stepKey][productId].qty = qty;
      }
    } else {
      // Auto-deselect if qty reaches 0
      if (btn && btn.getAttribute('aria-pressed') === 'true') {
        this._deselectCard(card, btn, stepKey, productId);
      }
    }

    this._updateSelectedBadge(stepKey);
    this._updateBundleTotal();
  }

  // ─── Variant Pills ───────────────────────────────────────────────────────────

  _initVariantPills() {
    const variantInputs = this.querySelectorAll('.variant-pills__input');
    variantInputs.forEach(input => {
      const handler = () => this._handleVariantChange(input);
      input._sdVariantHandler = handler;
      input.addEventListener('change', handler);
    });
  }

  _handleVariantChange(input) {
    const productId = input.dataset.productId;
    const stepKey = input.dataset.stepKey;
    const optionIndex = parseInt(input.dataset.optionIndex, 10);
    const optionValue = input.dataset.optionValue;

    const pillsContainer = input.closest('[data-variant-pills]');
    if (!pillsContainer) return;

    // Update selected value display
    const selectedLabel = pillsContainer.querySelector(`[data-selected-option="${optionIndex}"]`);
    if (selectedLabel) {
      selectedLabel.textContent = optionValue;
    }

    // Find matching variant
    const card = input.closest('[data-bundle-card]');
    if (!card) return;

    // Collect all current option selections
    const currentOptions = [];
    const allFieldsets = pillsContainer.querySelectorAll('[data-option-index]');
    const fieldsetMap = {};
    allFieldsets.forEach(fieldset => {
      const idx = parseInt(fieldset.dataset.optionIndex, 10);
      if (!fieldsetMap[idx]) {
        fieldsetMap[idx] = fieldset;
      }
    });

    const totalOptions = Object.keys(fieldsetMap).length;
    for (let i = 0; i < totalOptions; i++) {
      const fieldset = fieldsetMap[i];
      if (!fieldset) continue;
      const checked = fieldset.querySelector('.variant-pills__input:checked');
      if (checked) {
        currentOptions[i] = checked.dataset.optionValue;
      }
    }

    // Request variant data via Shopify product JSON
    const handle = card.dataset.productHandle;
    if (!handle) return;

    fetch(`/products/${handle}.js`)
      .then(r => r.json())
      .then(productData => {
        const matchedVariant = this._findMatchingVariant(productData.variants, currentOptions);
        if (matchedVariant) {
          this._updateCardVariant(card, matchedVariant, stepKey, productId, pillsContainer, currentOptions);
        }
      })
      .catch(() => {
        // Graceful degradation — variant update failed silently
      });
  }

  _findMatchingVariant(variants, selectedOptions) {
    return variants.find(variant => {
      return selectedOptions.every((optVal, idx) => {
        const variantOption = variant[`option${idx + 1}`];
        return variantOption === optVal;
      });
    }) || null;
  }

  _updateCardVariant(card, variant, stepKey, productId, pillsContainer, currentOptions) {
    // Update card data attributes
    card.dataset.variantId = variant.id;
    card.dataset.price = variant.price;

    // Update stepper
    const stepper = card.querySelector('[data-quantity-stepper]');
    if (stepper) {
      stepper.dataset.variantId = variant.id;
      const qtyInput = stepper.querySelector('[data-qty-input]');
      if (qtyInput) {
        qtyInput.dataset.variantId = variant.id;
      }
    }

    // Update price display
    const priceEl = card.querySelector('[data-variant-price]');
    if (priceEl) {
      priceEl.textContent = this._formatMoney(variant.price);
    }

    // Update selected option labels in pills
    if (pillsContainer) {
      currentOptions.forEach((optVal, idx) => {
        const label = pillsContainer.querySelector(`[data-selected-option="${idx}"]`);
        if (label) {
          label.textContent = optVal;
        }
      });
    }

    // Update bundle state if card is selected
    if (
      stepKey &&
      productId &&
      this._bundleState[stepKey] &&
      this._bundleState[stepKey][productId]
    ) {
      this._bundleState[stepKey][productId].variantId = variant.id;
      this._bundleState[stepKey][productId].price = variant.price;
      this._updateBundleTotal();
    }
  }

  // ─── Selected Badge ──────────────────────────────────────────────────────────

  _updateSelectedBadge(stepKey) {
    const badge = this.querySelector(`[data-selected-badge="${stepKey}"]`);
    const countEl = this.querySelector(`[data-selected-count="${stepKey}"]`);
    if (!countEl) return;

    const selections = this._bundleState[stepKey] || {};
    const totalSelected = Object.values(selections).reduce((sum, item) => {
      return sum + (item.qty || 1);
    }, 0);

    countEl.textContent = totalSelected;

    if (badge) {
      badge.style.display = totalSelected > 0 ? '' : '';
    }
  }

  // ─── Bundle Total ────────────────────────────────────────────────────────────

  _updateBundleTotal() {
    const totalEl = this.querySelector('[data-bundle-total]');
    if (!totalEl) return;

    let total = 0;
    Object.values(this._bundleState).forEach(stepSelections => {
      Object.values(stepSelections).forEach(item => {
        total += (item.price || 0) * (item.qty || 1);
      });
    });

    totalEl.textContent = this._formatMoney(total);
  }

  _formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents);
    }
    const dollars = (cents / 100).toFixed(2);
    return `$${dollars}`;
  }

  // ─── Add to Cart ─────────────────────────────────────────────────────────────

  _initAtcButton() {
    const atcBtn = this.querySelector('[data-atc-bundle]');
    if (!atcBtn) return;

    const handler = () => this._handleAddToCart(atcBtn);
    atcBtn._sdAtcHandler = handler;
    atcBtn.addEventListener('click', handler);
  }

  _handleAddToCart(btn) {
    const items = [];

    Object.values(this._bundleState).forEach(stepSelections => {
      Object.values(stepSelections).forEach(item => {
        if (item.variantId && item.qty > 0) {
          items.push({
            id: item.variantId,
            quantity: item.qty
          });
        }
      });
    });

    if (items.length === 0) {
      this._showAtcError(btn, 'Please select at least one product.');
      return;
    }

    this._setAtcLoading(btn, true);

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ items })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => Promise.reject(err));
        }
        return response.json();
      })
      .then(() => {
        this._setAtcLoading(btn, false);
        this._showAtcSuccess(btn);
        this._dispatchCartUpdate();
      })
      .catch(err => {
        this._setAtcLoading(btn, false);
        const message = (err && err.description) ? err.description : 'An error occurred. Please try again.';
        this._showAtcError(btn, message);
      });
  }

  _setAtcLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.classList.add('sd-frame-8234__next-btn--loading');
      btn._originalText = btn.textContent;
      btn.textContent = 'Adding...';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      btn.classList.remove('sd-frame-8234__next-btn--loading');
      if (btn._originalText) {
        btn.textContent = btn._originalText;
      }
    }
  }

  _showAtcSuccess(btn) {
    if (!btn) return;
    btn.classList.add('sd-frame-8234__next-btn--success');
    btn._originalText = btn._originalText || btn.textContent;
    btn.textContent = 'Added to Cart!';

    setTimeout(() => {
      btn.classList.remove('sd-frame-8234__next-btn--success');
      if (btn._originalText) {
        btn.textContent = btn._originalText;
      }
    }, 2500);
  }

  _showAtcError(btn, message) {
    let errorEl = this.querySelector('.sd-frame-8234__atc-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.className = 'sd-frame-8234__atc-error';
      errorEl.setAttribute('role', 'alert');
      errorEl.setAttribute('aria-live', 'assertive');
      const ctaArea = this.querySelector('.sd-frame-8234__step-cta--final');
      if (ctaArea) {
        ctaArea.appendChild(errorEl);
      }
    }
    errorEl.textContent = message;
    errorEl.style.display = 'block';

    setTimeout(() => {
      if (errorEl) {
        errorEl.style.display = 'none';
      }
    }, 5000);
  }

  _dispatchCartUpdate() {
    document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));
    // Also trigger Dawn's native cart update if available
    document.dispatchEvent(new CustomEvent('cart-update', { bubbles: true }));
  }
}

// ─── Custom Element Registration ─────────────────────────────────────────────

if (!customElements.get('sd-frame-8234')) {
  customElements.define('sd-frame-8234', SdFrame8234);
}

// ─── Shopify Section Editor Events ───────────────────────────────────────────

document.addEventListener('shopify:section:load', (e) => {
  const sectionEl = e.target;
  const customEl = sectionEl.querySelector('sd-frame-8234');
  if (customEl && typeof customEl._init === 'function') {
    customEl._bundleState = {
      cameras: {},
      plan: {},
      sensors: {},
      protection: {}
    };
    customEl._init();
  }
});

document.addEventListener('shopify:section:unload', (e) => {
  const sectionEl = e.target;
  const customEl = sectionEl.querySelector('sd-frame-8234');
  if (customEl && typeof customEl._destroy === 'function') {
    customEl._destroy();
  }
});

document.addEventListener('shopify:block:select', (e) => {
  const block = e.target;
  if (!block) return;

  // Find which step this block belongs to and open it
  const card = block.querySelector('[data-bundle-card]');
  if (!card) return;

  const stepKey = card.dataset.stepKey;
  if (!stepKey) return;

  const sectionEl = block.closest('.sd-frame-8234');
  if (!sectionEl) return;

  const customEl = sectionEl.querySelector('sd-frame-8234');
  if (!customEl) return;

  const stepEl = customEl.querySelector(`[data-step-key="${stepKey}"]`);
  if (stepEl) {
    const stepNumber = parseInt(stepEl.dataset.step, 10);
    if (!isNaN(stepNumber)) {
      customEl._openStep(stepNumber);
    }
  }
});