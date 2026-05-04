(() => {
  class SdFrame1736Element extends HTMLElement {
    constructor() {
      super();
      this._boundHandleQtyMinus = this._handleQtyMinus.bind(this);
      this._boundHandleQtyPlus = this._handleQtyPlus.bind(this);
      this._boundHandleQtyInput = this._handleQtyInput.bind(this);
      this._boundHandleCheckout = this._handleCheckout.bind(this);
      this._boundHandleSaveBundle = this._handleSaveBundle.bind(this);
    }

    connectedCallback() {
      this._sectionId = this.dataset.sectionId;
      this._init();
    }

    disconnectedCallback() {
      this._removeEventListeners();
    }

    _init() {
      this._attachEventListeners();
      this._recalcTotals();
    }

    _attachEventListeners() {
      // Quantity minus buttons
      this.querySelectorAll('[data-sd-qty-minus]').forEach((btn) => {
        btn.addEventListener('click', this._boundHandleQtyMinus);
      });

      // Quantity plus buttons
      this.querySelectorAll('[data-sd-qty-plus]').forEach((btn) => {
        btn.addEventListener('click', this._boundHandleQtyPlus);
      });

      // Quantity inputs (in case someone bypasses readonly — defensive)
      this.querySelectorAll('[data-sd-qty-input]').forEach((input) => {
        input.addEventListener('change', this._boundHandleQtyInput);
      });

      // Checkout button
      const checkoutBtn = this.querySelector('[data-sd-checkout-btn]');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', this._boundHandleCheckout);
      }

      // Save bundle button
      const saveBtn = this.querySelector('[data-sd-save-bundle]');
      if (saveBtn) {
        saveBtn.addEventListener('click', this._boundHandleSaveBundle);
      }
    }

    _removeEventListeners() {
      this.querySelectorAll('[data-sd-qty-minus]').forEach((btn) => {
        btn.removeEventListener('click', this._boundHandleQtyMinus);
      });

      this.querySelectorAll('[data-sd-qty-plus]').forEach((btn) => {
        btn.removeEventListener('click', this._boundHandleQtyPlus);
      });

      this.querySelectorAll('[data-sd-qty-input]').forEach((input) => {
        input.removeEventListener('change', this._boundHandleQtyInput);
      });

      const checkoutBtn = this.querySelector('[data-sd-checkout-btn]');
      if (checkoutBtn) {
        checkoutBtn.removeEventListener('click', this._boundHandleCheckout);
      }

      const saveBtn = this.querySelector('[data-sd-save-bundle]');
      if (saveBtn) {
        saveBtn.removeEventListener('click', this._boundHandleSaveBundle);
      }
    }

    _getLineItemFromButton(btn) {
      return btn.closest('[data-sd-line-item]');
    }

    _handleQtyMinus(event) {
      const btn = event.currentTarget;
      const lineItem = this._getLineItemFromButton(btn);
      if (!lineItem) return;

      const input = lineItem.querySelector('[data-sd-qty-input]');
      if (!input) return;

      const min = parseInt(input.min, 10) || 0;
      const current = parseInt(input.value, 10) || 0;
      const next = Math.max(min, current - 1);

      if (next !== current) {
        input.value = next;
        this._onQtyChange(lineItem, next);
      }

      this._updateStepperButtonStates(lineItem);
    }

    _handleQtyPlus(event) {
      const btn = event.currentTarget;
      const lineItem = this._getLineItemFromButton(btn);
      if (!lineItem) return;

      const input = lineItem.querySelector('[data-sd-qty-input]');
      if (!input) return;

      const max = parseInt(input.max, 10) || Infinity;
      const current = parseInt(input.value, 10) || 0;
      const next = Math.min(max, current + 1);

      if (next !== current) {
        input.value = next;
        this._onQtyChange(lineItem, next);
      }

      this._updateStepperButtonStates(lineItem);
    }

    _handleQtyInput(event) {
      const input = event.currentTarget;
      const lineItem = this._getLineItemFromButton(input);
      if (!lineItem) return;

      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || Infinity;
      let value = parseInt(input.value, 10);

      if (isNaN(value)) value = min;
      value = Math.max(min, Math.min(max, value));
      input.value = value;

      this._onQtyChange(lineItem, value);
      this._updateStepperButtonStates(lineItem);
    }

    _onQtyChange(lineItem, qty) {
      // Update line price display
      const isFree = lineItem.dataset.isFree === 'true';
      if (!isFree) {
        const linePriceEl = lineItem.querySelector('[data-sd-line-price]');
        if (linePriceEl) {
          const unitPrice = parseInt(linePriceEl.dataset.unitPrice, 10) || 0;
          const lineTotal = unitPrice * qty;
          linePriceEl.textContent = this._formatMoney(lineTotal);
          linePriceEl.dataset.currentQty = qty;
        }
      }

      // Recalculate bundle totals
      this._recalcTotals();
    }

    _updateStepperButtonStates(lineItem) {
      if (!lineItem) return;

      const input = lineItem.querySelector('[data-sd-qty-input]');
      if (!input) return;

      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || Infinity;
      const current = parseInt(input.value, 10) || 0;

      const minusBtn = lineItem.querySelector('[data-sd-qty-minus]');
      const plusBtn = lineItem.querySelector('[data-sd-qty-plus]');

      if (minusBtn) {
        minusBtn.disabled = current <= min;
        minusBtn.setAttribute('aria-disabled', current <= min ? 'true' : 'false');
      }

      if (plusBtn) {
        plusBtn.disabled = current >= max;
        plusBtn.setAttribute('aria-disabled', current >= max ? 'true' : 'false');
      }
    }

    _recalcTotals() {
      let totalCurrent = 0;
      let totalCompare = 0;

      this.querySelectorAll('[data-sd-line-item]').forEach((lineItem) => {
        const isFree = lineItem.dataset.isFree === 'true';
        const input = lineItem.querySelector('[data-sd-qty-input]');
        const qty = input ? parseInt(input.value, 10) || 0 : 0;

        const unitPrice = parseInt(lineItem.dataset.price, 10) || 0;
        const comparePrice = parseInt(lineItem.dataset.comparePrice, 10) || 0;

        if (!isFree) {
          totalCurrent += unitPrice * qty;
        }

        // For compare price: use compare price if available, else use unit price
        const effectiveCompare = comparePrice > 0 ? comparePrice : unitPrice;
        totalCompare += effectiveCompare * qty;
      });

      this._updateSummary(totalCurrent, totalCompare);
    }

    _updateSummary(totalCurrent, totalCompare) {
      const totalCurrentEl = this.querySelector('[data-sd-total-current]');
      const totalCompareEl = this.querySelector('[data-sd-total-compare]');
      const savingsEl = this.querySelector('[data-sd-savings]');

      if (totalCurrentEl) {
        totalCurrentEl.textContent = this._formatMoney(totalCurrent);
      }

      if (totalCompareEl) {
        if (totalCompare > totalCurrent && totalCompare > 0) {
          totalCompareEl.textContent = this._formatMoney(totalCompare);
          totalCompareEl.style.display = '';
        } else {
          totalCompareEl.textContent = '';
          totalCompareEl.style.display = 'none';
        }
      }

      // Update savings banner
      if (savingsEl) {
        const savings = totalCompare - totalCurrent;
        if (savings > 0) {
          const savingsText = this._buildSavingsText(savings);
          savingsEl.textContent = savingsText;
          savingsEl.style.display = '';
        } else {
          savingsEl.textContent = '';
          savingsEl.style.display = 'none';
        }
      }

      // Update financing amount if present
      this._updateFinancingAmount(totalCurrent);
    }

    _buildSavingsText(savingsAmount) {
      // Attempt to read prefix/suffix from data attributes on the element, 
      // fall back to generic text
      const savingsEl = this.querySelector('[data-sd-savings]');
      const prefix = savingsEl ? (savingsEl.dataset.prefix || '') : '';
      const suffix = savingsEl ? (savingsEl.dataset.suffix || '') : '';

      if (prefix || suffix) {
        return `${prefix} ${this._formatMoney(savingsAmount)} ${suffix}`.trim();
      }

      return this._formatMoney(savingsAmount);
    }

    _updateFinancingAmount(totalCurrent) {
      // Financing amount is static from settings; only update if dynamic calculation is needed
      // Currently the financing amount is set via Liquid settings, so no dynamic update required
    }

    _formatMoney(cents) {
      // Use Shopify's money format if available
      if (window.Shopify && window.Shopify.formatMoney) {
        return window.Shopify.formatMoney(cents, window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}');
      }

      // Fallback formatter
      const amount = (cents / 100).toFixed(2);
      return `$${amount}`;
    }

    _buildCartItems() {
      const items = [];

      this.querySelectorAll('[data-sd-line-item]').forEach((lineItem) => {
        const variantId = parseInt(lineItem.dataset.variantId, 10);
        const input = lineItem.querySelector('[data-sd-qty-input]');
        const qty = input ? parseInt(input.value, 10) || 0 : 0;

        if (variantId && qty > 0) {
          items.push({
            id: variantId,
            quantity: qty,
          });
        }
      });

      return items;
    }

    async _handleCheckout(event) {
      const btn = event.currentTarget;
      if (!btn) return;

      const items = this._buildCartItems();

      if (items.length === 0) {
        this._setCheckoutState('error', btn);
        return;
      }

      this._setCheckoutState('loading', btn);

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
          throw new Error(`Cart add failed: ${response.status}`);
        }

        await response.json();

        this._setCheckoutState('success', btn);

        // Redirect to checkout
        window.location.href = '/checkout';
      } catch (err) {
        this._setCheckoutState('error', btn);

        // Re-enable button after error delay
        setTimeout(() => {
          this._setCheckoutState('idle', btn);
        }, 3000);
      }
    }

    _setCheckoutState(state, btn) {
      if (!btn) return;

      btn.removeAttribute('data-state');
      btn.setAttribute('data-state', state);

      switch (state) {
        case 'loading':
          btn.disabled = true;
          btn.setAttribute('aria-busy', 'true');
          break;
        case 'success':
          btn.disabled = true;
          btn.setAttribute('aria-busy', 'false');
          break;
        case 'error':
          btn.disabled = false;
          btn.setAttribute('aria-busy', 'false');
          break;
        case 'idle':
        default:
          btn.disabled = false;
          btn.setAttribute('aria-busy', 'false');
          break;
      }
    }

    _handleSaveBundle(event) {
      const items = this._buildCartItems();
      if (items.length === 0) return;

      try {
        const bundleData = JSON.stringify(items);
        localStorage.setItem(`sd-bundle-${this._sectionId}`, bundleData);

        const saveBtn = event.currentTarget;
        if (saveBtn) {
          saveBtn.setAttribute('data-state', 'saved');
          // Reset state after delay
          setTimeout(() => {
            if (saveBtn) saveBtn.removeAttribute('data-state');
          }, 2000);
        }
      } catch (err) {
        // localStorage may be unavailable in private browsing
      }
    }

    _initStepperStates() {
      this.querySelectorAll('[data-sd-line-item]').forEach((lineItem) => {
        this._updateStepperButtonStates(lineItem);
      });
    }

    _reinit() {
      this._removeEventListeners();
      this._init();
      this._initStepperStates();
    }
  }

  // Register the custom element
  if (!customElements.get('sd-frame-1736')) {
    customElements.define('sd-frame-1736', SdFrame1736Element);
  }

  // Handle Shopify section editor events
  function getSectionElement(sectionId) {
    return document.querySelector(`sd-frame-1736[data-section-id="${sectionId}"]`);
  }

  document.addEventListener('shopify:section:load', (event) => {
    const el = getSectionElement(event.detail.sectionId);
    if (el) {
      el._reinit();
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    const el = getSectionElement(event.detail.sectionId);
    if (el) {
      el._removeEventListeners();
    }
  });

  document.addEventListener('shopify:block:select', (event) => {
    const sectionId = event.detail.sectionId;
    const el = getSectionElement(sectionId);
    if (!el) return;

    const blockId = event.detail.blockId;
    const blockEl = el.querySelector(`[data-shopify-editor-block="${blockId}"]`);
    if (blockEl) {
      blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Initialize on DOMContentLoaded for non-custom-element fallback
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('sd-frame-1736').forEach((el) => {
      if (el._initStepperStates) {
        el._initStepperStates();
      }
    });
  });
})();