class SdTttBbHeroooElement extends HTMLElement {
  connectedCallback() {
    this._sectionEl = this.closest('.sd-ttt-bb-herooo');
    this._initAnimations();
    this._bindSectionEvents();
  }

  disconnectedCallback() {
    this._destroyAnimations();
    document.removeEventListener('shopify:section:load', this._onSectionLoad);
    document.removeEventListener('shopify:section:unload', this._onSectionUnload);
    document.removeEventListener('shopify:block:select', this._onBlockSelect);
  }

  _initAnimations() {
    const animatables = this.querySelectorAll('[data-animate]');
    if (!animatables.length) return;

    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('sd-ttt-bb-herooo--animate-in');
              this._observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      animatables.forEach((el) => {
        this._observer.observe(el);
      });
    } else {
      /* Fallback: just show elements immediately if IntersectionObserver not supported */
      animatables.forEach((el) => {
        el.classList.add('sd-ttt-bb-herooo--animate-in');
      });
    }
  }

  _destroyAnimations() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }

  _bindSectionEvents() {
    this._onSectionLoad = (e) => {
      if (e.target === this._sectionEl || this._sectionEl?.contains(e.target)) {
        this._destroyAnimations();
        this._initAnimations();
      }
    };

    this._onSectionUnload = (e) => {
      if (e.target === this._sectionEl || this._sectionEl?.contains(e.target)) {
        this._destroyAnimations();
      }
    };

    this._onBlockSelect = (e) => {
      if (!this._sectionEl) return;
      const block = e.target;
      if (this._sectionEl.contains(block)) {
        const navItem = block.closest('.sd-ttt-bb-herooo__nav-item');
        if (navItem) {
          const link = navItem.querySelector('.sd-ttt-bb-herooo__nav-link');
          if (link) {
            link.focus({ preventScroll: true });
          }
        }
      }
    };

    document.addEventListener('shopify:section:load', this._onSectionLoad);
    document.addEventListener('shopify:section:unload', this._onSectionUnload);
    document.addEventListener('shopify:block:select', this._onBlockSelect);
  }
}

if (!customElements.get('sd-ttt-bb-herooo')) {
  customElements.define('sd-ttt-bb-herooo', SdTttBbHeroooElement);
}