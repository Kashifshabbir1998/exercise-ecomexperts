class SdBundleBuilder extends HTMLElement {
  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._bundleState = {};
    this._abortController = new AbortController();
    const signal = this._abortController.signal;

    this._initStepToggles(signal);
    this._initNextStepButtons(signal);
    this._initQtySteppers(signal);
    this._initVariantPills(signal);
    this._initAddToCart(signal);
    this._updateAllSelectedCounts();

    document.addEventListener('shopify:section:load', (e) => {
      if (e.detail.sectionId === this._sectionId) {
        this._bundleState = {};
        this._initStepToggles(signal);
        this._initNextStepButtons(signal);
        this._initQtySteppers(signal);
        this._initVariantPills(signal);
        this._initAddToCart(signal);
        this._updateAllSelectedCounts();
      }
    }, { signal });

    document.addEventListener('shopify:section:unload', (e) => {
      if (e.detail.sectionId === this._sectionId) {
        this.disconnectedCallback();
      }
    }, { signal });

    document.addEventListener('shopify:block:select', (e) => {
      if (e.detail.sectionId === this._sectionId) {
        const blockId = e.detail.blockId;
        const card = this.querySelector(`[data-block-id="${blockId}"]`);
        if (card) {
          const stepEl = card.closest('[data-step]');
          if (stepEl) {
            const stepNum = stepEl.dataset.step;
            this._openStep(stepNum);
          }
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, { signal });
  }

  disconnectedCallback() {
    if (this._abortController) {
      this._abortController.abort();
    }
  }

  // ── Step toggles ──────────────────────────────────────────────────────────

  _initStepToggles(signal) {
    this.querySelectorAll('[data-step-toggle]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const stepNum = e.currentTarget.dataset.stepToggle;
        this._toggleStep(stepNum);
      }, { signal });
    });
  }

  _toggleStep(stepNum) {
    const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
    if (!stepEl) return;

    const isOpen = stepEl.dataset.stepOpen === 'true';
    if (isOpen) {
      this._closeStep(stepNum);
    } else {
      this._openStep(stepNum);
    }
  }

  _openStep(stepNum) {
    const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
    if (!stepEl) return;

    const content = this.querySelector(`[data-step-content="${stepNum}"]`);
    const toggleBtns = this.querySelectorAll(`[data-step-toggle="${stepNum}"]`);
    const header = stepEl.querySelector('.sd-bundle-builder__step-header');
    const tracker = stepEl.querySelector('.sd-bundle-builder__step-tracker');

    stepEl.dataset.stepOpen = 'true';
    stepEl.classList.add('sd-bundle-builder__step--open');

    if (content) {
      content.classList.remove('sd-bundle-builder__step-content--hidden');
    }

    if (header) {
      header.classList.add('sd-bundle-builder__step-header--open');
    }

    if (tracker) {
      tracker.classList.remove('sd-bundle-builder__step-tracker--inactive');
    }

    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'true');
      const arrow = btn.querySelector('.sd-bundle-builder__toggle-arrow');
      if (arrow) {
        arrow.classList.add('sd-bundle-builder__toggle-arrow--up');
        arrow.innerHTML = '&#9650;';
      }
    });
  }

  _closeStep(stepNum) {
    const stepEl = this.querySelector(`[data-step="${stepNum}"]`);
    if (!stepEl) return;

    const content = this.querySelector(`[data-step-content="${stepNum}"]`);
    const toggleBtns = this.querySelectorAll(`[data-step-toggle="${stepNum}"]`);
    const header = stepEl.querySelector('.sd-bundle-builder__step-header');
    const tracker = stepEl.querySelector('.sd-bundle-builder__step-tracker');

    stepEl.dataset.stepOpen = 'false';
    stepEl.classList.remove('sd-bundle-builder__step--open');

    if (content) {
      content.classList.add('sd-bundle-builder__step-content--hidden');
    }

    if (header) {
      header.classList.remove('sd-bundle-builder__step-header--open');
    }

    if (tracker) {
      tracker.classList.add('sd-bundle-builder__step-tracker--inactive');
    }

    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      const arrow = btn.querySelector('.sd-bundle-builder__toggle-arrow');
      if (arrow) {
        arrow.classList.remove('sd-bundle-builder__toggle-arrow--up');
        arrow.innerHTML = '&#9660;';
      }
    });
  }

  // ── Next step buttons ─────────────────────────────────────────────────────

  _initNextStepButtons(signal) {
    this.querySelectorAll('[data-next-step]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const currentStep = parseInt(e.currentTarget.dataset.nextStep, 10);
        const nextStep = currentStep + 1;
        this._closeStep(String(currentStep));
        this._openStep(String(nextStep));

        const nextStepEl = this.querySelector(`[data-step="${nextStep}"]`);
        if (nextStepEl) {
          nextStepEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, { signal });
    });
  }

  // ── Quantity steppers ─────────────────────────────────────────────────────

  _initQtySteppers(signal) {
    this.querySelectorAll('[data-qty-minus]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const blockId = e.currentTarget.dataset.qtyMinus;
        this._changeQty(blockId, -1);
      }, { signal });
    });

    this.querySelectorAll('[data-qty-plus]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const blockId = e.currentTarget.dataset.qtyPlus;
        this._changeQty(blockId, 1);
      }, { signal });
    });

    this.querySelectorAll('[data-qty-input]').forEach((input) => {
      input.addEventListener('change', (e) => {
        const blockId = e.currentTarget.dataset.qtyInput;
        const val = parseInt(e.currentTarget.value, 10) || 0;
        this._setQty(blockId, val);
      }, { signal });
    });
  }

  _changeQty(blockId, delta) {
    const input = this.querySelector(`[data-qty-input="${blockId}"]`);
    if (!input) return;

    const current = parseInt(input.value, 10) || 0;
    const min = parseInt(input.min, 10) || 0;
    const max = parseInt(input.max, 10) || 10;
    const newVal = Math.min(max, Math.max(min, current + delta));

    this._setQty(blockId, newVal);
  }

  _setQty(blockId, qty) {
    const input = this.querySelector(`[data-qty-input="${blockId}"]`);
    if (!input) return;

    const min = parseInt(input.min, 10) || 0;
    const max = parseInt(input.max, 10) || 10;
    const clamped = Math.min(max, Math.max(min, qty));
    input.value = clamped;

    const productId = input.dataset.productId;
    const variantId = input.dataset.variantId;
    const price = parseInt(input.dataset.price, 10) || 0;

    if (!this._bundleState[blockId]) {
      this._bundleState[blockId] = {};
    }
    this._bundleState[blockId].qty = clamped;
    this._bundleState[blockId].variantId = variantId;
    this._bundleState[blockId].productId = productId;
    this._bundleState[blockId].price = price;

    this._updateMinusBtn(blockId, clamped, min);
    this._updateSelectedCount(blockId);
    this._updateAllSelectedCounts();
  }

  _updateMinusBtn(blockId, qty, min) {
    const minusBtn = this.querySelector(`[data-qty-minus="${blockId}"]`);
    if (!minusBtn) return;
    minusBtn.disabled = qty <= min;
  }

  // ── Variant pills ─────────────────────────────────────────────────────────

  _initVariantPills(signal) {
    this.querySelectorAll('[data-variant-pills]').forEach((pillGroup) => {
      pillGroup.querySelectorAll('.sd-bundle-builder__variant-pill').forEach((pill) => {
        pill.addEventListener('click', (e) => {
          const clickedPill = e.currentTarget;
          const blockId = clickedPill.dataset.blockId;
          const variantId = clickedPill.dataset.variantId;
          const price = parseInt(clickedPill.dataset.price, 10) || 0;

          // Update active pill state
          const group = this.querySelector(`[data-variant-pills="${blockId}"]`);
          if (group) {
            group.querySelectorAll('.sd-bundle-builder__variant-pill').forEach((p) => {
              p.classList.remove('sd-bundle-builder__variant-pill--active');
              p.setAttribute('aria-pressed', 'false');
            });
          }
          clickedPill.classList.add('sd-bundle-builder__variant-pill--active');
          clickedPill.setAttribute('aria-pressed', 'true');

          // Update qty input's variant data
          const qtyInput = this.querySelector(`[data-qty-input="${blockId}"]`);
          if (qtyInput) {
            qtyInput.dataset.variantId = variantId;
            qtyInput.dataset.price = price;
          }

          // Update bundle state
          if (!this._bundleState[blockId]) {
            this._bundleState[blockId] = {};
          }
          this._bundleState[blockId].variantId = variantId;
          this._bundleState[blockId].price = price;

          // Update price display
          this._updatePriceDisplay(blockId, price);
        }, { signal });
      });
    });
  }

  _updatePriceDisplay(blockId, price) {
    const priceDisplay = this.querySelector(`[data-price-display="${blockId}"]`);
    if (!priceDisplay) return;

    const currentPriceEl = priceDisplay.querySelector('.sd-bundle-builder__price-current');
    if (currentPriceEl) {
      currentPriceEl.textContent = this._formatMoney(price);
    }
  }

  _formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    return `$${amount}`;
  }

  // ── Selected count badges ─────────────────────────────────────────────────

  _updateAllSelectedCounts() {
    // For each step, tally up selected items
    this.querySelectorAll('[data-step]').forEach((stepEl) => {
      const stepNum = stepEl.dataset.step;
      let totalSelected = 0;

      stepEl.querySelectorAll('[data-qty-input]').forEach((input) => {
        const qty = parseInt(input.value, 10) || 0;
        if (qty > 0) totalSelected += qty;
      });

      const countEl = this.querySelector(`[data-selected-count="${stepNum}"]`);
      if (countEl) {
        countEl.textContent = `${totalSelected} selected`;
      }
    });
  }

  _updateSelectedCount(blockId) {
    // Find the step that contains this block
    const card = this.querySelector(`[data-block-id="${blockId}"]`);
    if (!card) return;

    const stepEl = card.closest('[data-step]');
    if (!stepEl) return;

    const stepNum = stepEl.dataset.step;
    let totalSelected = 0;

    stepEl.querySelectorAll('[data-qty-input]').forEach((input) => {
      const qty = parseInt(input.value, 10) || 0;
      if (qty > 0) totalSelected += qty;
    });

    const countEl = this.querySelector(`[data-selected-count="${stepNum}"]`);
    if (countEl) {
      countEl.textContent = `${totalSelected} selected`;
    }
  }

  // ── Add to cart ───────────────────────────────────────────────────────────

  _initAddToCart(signal) {
    const addToCartBtn = this.querySelector('[data-add-to-cart]');
    if (!addToCartBtn) return;

    addToCartBtn.addEventListener('click', () => {
      this._handleAddToCart(addToCartBtn);
    }, { signal });
  }

  async _handleAddToCart(btn) {
    const items = this._buildCartItems();

    if (items.length === 0) {
      this._showLiveMessage('Please select at least one item before adding to cart.');
      return;
    }

    btn.disabled = true;
    btn.setAttribute('aria-busy', 'true');
    const originalText = btn.textContent;
    btn.textContent = 'Adding…';

    this._showLiveMessage('');

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.description || 'Could not add items to cart.');
      }

      btn.textContent = 'Added!';
      this._showLiveMessage('Bundle added to cart successfully.');

      // Dispatch cart update event for theme cart drawer/header
      document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.removeAttribute('aria-busy');
      }, 2500);

    } catch (err) {
      btn.textContent = originalText;
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      this._showLiveMessage(err.message || 'Something went wrong. Please try again.');
    }
  }

  _buildCartItems() {
    const items = [];

    this.querySelectorAll('[data-qty-input]').forEach((input) => {
      const qty = parseInt(input.value, 10) || 0;
      if (qty <= 0) return;

      const variantId = parseInt(input.dataset.variantId, 10);
      if (!variantId) return;

      // Check if we already have this variant (merge quantities)
      const existing = items.find((i) => i.id === variantId);
      if (existing) {
        existing.quantity += qty;
      } else {
        items.push({
          id: variantId,
          quantity: qty,
        });
      }
    });

    return items;
  }

  // ── Live region ───────────────────────────────────────────────────────────

  _showLiveMessage(message) {
    const liveRegion = this.querySelector(`[data-live-region="${this._sectionId}"]`);
    if (!liveRegion) return;
    liveRegion.textContent = '';
    // Trigger re-announcement by updating asynchronously
    requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }
}

if (!customElements.get('sd-bundle-builder')) {
  customElements.define('sd-bundle-builder', SdBundleBuilder);
}