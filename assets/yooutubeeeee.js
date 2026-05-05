class SdYooutubeeeee extends HTMLElement {
  constructor() {
    super();
    this._filterSwiper = null;
    this._handleFilterPillClick = this._handleFilterPillClick.bind(this);
    this._handleSectionLoad = this._handleSectionLoad.bind(this);
    this._handleSectionUnload = this._handleSectionUnload.bind(this);
    this._handleBlockSelect = this._handleBlockSelect.bind(this);
  }

  connectedCallback() {
    this._sectionId = this.dataset.sectionId;
    this._initFilterSwiper();
    this._initFilterPills();
    this._initMoreMenuButtons();

    document.addEventListener('shopify:section:load', this._handleSectionLoad);
    document.addEventListener('shopify:section:unload', this._handleSectionUnload);
    document.addEventListener('shopify:block:select', this._handleBlockSelect);
  }

  disconnectedCallback() {
    this._destroyFilterSwiper();
    document.removeEventListener('shopify:section:load', this._handleSectionLoad);
    document.removeEventListener('shopify:section:unload', this._handleSectionUnload);
    document.removeEventListener('shopify:block:select', this._handleBlockSelect);
  }

  _handleSectionLoad(event) {
    if (event.detail && event.detail.sectionId === this._sectionId) {
      this._destroyFilterSwiper();
      this._initFilterSwiper();
      this._initFilterPills();
      this._initMoreMenuButtons();
    }
  }

  _handleSectionUnload(event) {
    if (event.detail && event.detail.sectionId === this._sectionId) {
      this._destroyFilterSwiper();
    }
  }

  _handleBlockSelect(event) {
    if (!event.detail || event.detail.sectionId !== this._sectionId) return;
    const block = event.detail.blockId
      ? this.querySelector(`[data-block-id="${event.detail.blockId}"]`)
      : null;
    if (block) {
      block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  _initFilterSwiper() {
    const filterSwiperEl = this.querySelector('.sd-yooutubeeeee__filter-swiper');
    if (!filterSwiperEl) return;

    if (typeof Swiper === 'undefined') return;

    const prevEl = this.querySelector('.sd-yooutubeeeee__filter-prev');
    const nextEl = this.querySelector('.sd-yooutubeeeee__filter-next');

    this._filterSwiper = new Swiper(filterSwiperEl, {
      slidesPerView: 'auto',
      spaceBetween: 8,
      freeMode: true,
      grabCursor: true,
      navigation: {
        prevEl: prevEl || null,
        nextEl: nextEl || null,
      },
      a11y: {
        prevSlideMessage: 'Previous filters',
        nextSlideMessage: 'Next filters',
      },
      on: {
        navigationShow: () => {
          if (prevEl) prevEl.style.display = '';
          if (nextEl) nextEl.style.display = '';
        },
        navigationHide: () => {
          if (prevEl) prevEl.style.display = 'none';
          if (nextEl) nextEl.style.display = 'none';
        },
      },
    });

    /* Keyboard support for custom nav arrows */
    if (prevEl) {
      prevEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._filterSwiper && this._filterSwiper.slidePrev();
        }
      });
    }
    if (nextEl) {
      nextEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this._filterSwiper && this._filterSwiper.slideNext();
        }
      });
    }
  }

  _destroyFilterSwiper() {
    if (this._filterSwiper) {
      this._filterSwiper.destroy(true, true);
      this._filterSwiper = null;
    }
  }

  _initFilterPills() {
    const pills = this.querySelectorAll('[data-filter-pill]');
    if (!pills.length) return;

    pills.forEach((pill) => {
      pill.addEventListener('click', this._handleFilterPillClick);
    });
  }

  _handleFilterPillClick(event) {
    const clickedPill = event.currentTarget;
    const pills = this.querySelectorAll('[data-filter-pill]');

    pills.forEach((pill) => {
      const isActive = pill === clickedPill;
      pill.classList.toggle('sd-yooutubeeeee__filter-pill--active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    /* Slide the filter swiper to show the active pill if needed */
    if (this._filterSwiper) {
      const slideEls = this.querySelectorAll('.sd-yooutubeeeee__filter-slide');
      slideEls.forEach((slide, index) => {
        if (slide.contains(clickedPill)) {
          this._filterSwiper.slideTo(index);
        }
      });
    }
  }

  _initMoreMenuButtons() {
    const moreBtns = this.querySelectorAll('[data-more-menu]');
    moreBtns.forEach((btn) => {
      btn.addEventListener('click', this._handleMoreMenuClick.bind(this));
    });

    const shortsMoreBtn = this.querySelector('.sd-yooutubeeeee__shorts-more-btn');
    if (shortsMoreBtn) {
      shortsMoreBtn.addEventListener('click', this._handleShortsMoreClick.bind(this));
    }
  }

  _handleMoreMenuClick(event) {
    const btn = event.currentTarget;
    /* Toggle a simple active state — styling/menu can be extended via CSS */
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');

    /* Close other open menus within this section */
    const allMoreBtns = this.querySelectorAll('[data-more-menu]');
    allMoreBtns.forEach((otherBtn) => {
      if (otherBtn !== btn) {
        otherBtn.setAttribute('aria-expanded', 'false');
      }
    });

    /* Close on outside click */
    if (!isExpanded) {
      const closeOnOutside = (e) => {
        if (!btn.contains(e.target)) {
          btn.setAttribute('aria-expanded', 'false');
          document.removeEventListener('click', closeOnOutside);
        }
      };
      /* Use setTimeout to avoid immediately closing from this same click */
      setTimeout(() => {
        document.addEventListener('click', closeOnOutside);
      }, 0);
    }
  }

  _handleShortsMoreClick(event) {
    const btn = event.currentTarget;
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
  }
}

if (!customElements.get('sd-yooutubeeeee')) {
  customElements.define('sd-yooutubeeeee', SdYooutubeeeee);
}