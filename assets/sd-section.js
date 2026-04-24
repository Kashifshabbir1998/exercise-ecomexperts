class SdSection extends HTMLElement {
  connectedCallback() {
    this._swiper = null;
    this._mobileQuery = window.matchMedia('(max-width: 749px)');
    this._onMediaChange = this._onMediaChange.bind(this);
    this._swiperEl = this.querySelector('.sd-section__swiper');
    if (!this._swiperEl) return;
    this._mobileQuery.addEventListener('change', this._onMediaChange);
    this._initIfMobile();
  }

  disconnectedCallback() {
    if (this._mobileQuery) {
      this._mobileQuery.removeEventListener('change', this._onMediaChange);
    }
    this._destroySwiper();
  }

  _onMediaChange(e) {
    if (e.matches) {
      this._initIfMobile();
    } else {
      this._destroySwiper();
    }
  }

  _initIfMobile() {
    if (this._mobileQuery.matches) {
      this._initSwiper();
    }
  }

  _initSwiper() {
    if (this._swiper) return;
    if (typeof Swiper === 'undefined') {
      this._loadSwiper().then(() => this._createSwiper());
    } else {
      this._createSwiper();
    }
  }

  _loadSwiper() {
    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="swiper"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  _createSwiper() {
    if (!this._swiperEl || this._swiper) return;

    this._swiper = new Swiper(this._swiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 24,
      grabCursor: true,
      freeMode: true,
      a11y: {
        enabled: true,
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
      },
    });
  }

  _destroySwiper() {
    if (this._swiper) {
      this._swiper.destroy(true, true);
      this._swiper = null;
    }
  }
}

if (!customElements.get('sd-section')) {
  customElements.define('sd-section', SdSection);
}

// Handle Shopify customizer block:select to scroll carousel to selected block
document.addEventListener('shopify:block:select', (event) => {
  const sdEl = event.target.closest('sd-section');
  if (!sdEl || !sdEl._swiper) return;

  const slide = event.target.closest('.swiper-slide');
  if (!slide) return;

  const slides = Array.from(sdEl.querySelectorAll('.swiper-slide'));
  const index = slides.indexOf(slide);
  if (index !== -1) {
    sdEl._swiper.slideTo(index);
  }
});