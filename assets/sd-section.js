class SdSectionHeroElement extends HTMLElement {
  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._bindEvents();
    this._handleSectionEditorEvents();
  }

  disconnectedCallback() {
    this._unbindSectionEditorEvents();
  }

  _bindEvents() {
    // CTA click — graceful no-op; native anchor handles navigation
    const cta = this.querySelector('.sd-section__cta');
    if (cta) {
      this._ctaClickHandler = (e) => {
        // Allow default anchor behaviour; add visual feedback if needed
        cta.classList.add('sd-section__cta--clicked');
        setTimeout(() => cta.classList.remove('sd-section__cta--clicked'), 300);
      };
      cta.addEventListener('click', this._ctaClickHandler);
    }
  }

  _unbindEvents() {
    const cta = this.querySelector('.sd-section__cta');
    if (cta && this._ctaClickHandler) {
      cta.removeEventListener('click', this._ctaClickHandler);
    }
  }

  _handleSectionEditorEvents() {
    this._onSectionLoad = (e) => {
      if (e.detail?.sectionId === this._sectionId) {
        this._unbindEvents();
        this._bindEvents();
      }
    };

    this._onSectionUnload = (e) => {
      if (e.detail?.sectionId === this._sectionId) {
        this._unbindEvents();
      }
    };

    this._onBlockSelect = (e) => {
      if (e.detail?.sectionId === this._sectionId) {
        // No blocks defined in schema; placeholder for future block selection handling
      }
    };

    document.addEventListener('shopify:section:load', this._onSectionLoad);
    document.addEventListener('shopify:section:unload', this._onSectionUnload);
    document.addEventListener('shopify:block:select', this._onBlockSelect);
  }

  _unbindSectionEditorEvents() {
    if (this._onSectionLoad) {
      document.removeEventListener('shopify:section:load', this._onSectionLoad);
    }
    if (this._onSectionUnload) {
      document.removeEventListener('shopify:section:unload', this._onSectionUnload);
    }
    if (this._onBlockSelect) {
      document.removeEventListener('shopify:block:select', this._onBlockSelect);
    }
  }
}

if (!customElements.get('sd-section-hero')) {
  customElements.define('sd-section-hero', SdSectionHeroElement);
}