(() => {
  'use strict';

  // ─── Utility: wait for Swiper to be available ───────────────────────────────
  function waitForSwiper(callback, attempts = 0) {
    if (typeof Swiper !== 'undefined') {
      callback();
    } else if (attempts < 20) {
      setTimeout(() => waitForSwiper(callback, attempts + 1), 150);
    }
  }

  // ─── Format money (cents → display string) ──────────────────────────────────
  function formatMoney(cents) {
    if (!cents && cents !== 0) return '';
    const amount = (cents / 100).toFixed(2);
    // Strip trailing zeros for whole dollar amounts
    const formatted = amount.endsWith('.00')
      ? '$' + (cents / 100).toFixed(0)
      : '$' + amount;
    return formatted;
  }

  // ─── Main Section Controller ─────────────────────────────────────────────────
  class SdQw111Section {
    constructor(container) {
      this.container = container;
      this.sectionId = container.dataset.sectionId;

      // State
      this.thumbSwiper = null;
      this.ugcSwiper = null;
      this.selectedOptions = {};

      this.init();
    }

    init() {
      this.cacheElements();
      this.readInitialOptions();
      this.bindSwatches();
      this.bindPills();
      this.bindThumbnails();
      this.bindThumbNext();
      this.bindForm();
      this.initThumbSwiper();
      this.initUgcSwiper();
    }

    cacheElements() {
      const id = this.sectionId;

      this.variantInput = this.container.querySelector(`#variant-input-${id}`);
      this.atcBtn = this.container.querySelector(`#atc-btn-${id}`);
      this.atcLabel = this.container.querySelector('[data-atc-label]');
      this.atcPrice = this.container.querySelector('[data-atc-price]');
      this.atcSpinner = this.container.querySelector('[data-atc-spinner]');
      this.swatchNameEl = this.container.querySelector('[data-swatch-name]');
      this.mainImg = this.container.querySelector(`#main-product-image-${id}`);
      this.mainImgWrap = this.container.querySelector(`#main-image-${id}`);
      this.form = this.container.querySelector(`#product-form-${id}`);
      this.thumbTrack = this.container.querySelector(`#thumb-swiper-${id}`);
      this.thumbNextBtn = this.container.querySelector('.sd-qw111__thumb-next');
      this.ugcSwiperEl = this.container.querySelector(`#ugc-swiper-${id}`);
      this.ugcPrevBtn = this.container.querySelector(`#ugc-prev-${id}`);
      this.ugcNextBtn = this.container.querySelector(`#ugc-next-${id}`);
      this.thumbBtns = this.container.querySelectorAll('.sd-qw111__thumb-btn');
      this.swatchBtns = this.container.querySelectorAll('.sd-qw111__swatch');
      this.pillBtns = this.container.querySelectorAll('.sd-qw111__pill');
    }

    // ── Read current selected options from the DOM ──────────────────────────
    readInitialOptions() {
      // Read from selected swatch buttons
      this.swatchBtns.forEach((btn) => {
        if (btn.getAttribute('aria-pressed') === 'true') {
          const optionIndex = btn.dataset.optionIndex;
          this.selectedOptions[optionIndex] = btn.dataset.swatchValue;
        }
      });

      // Read from selected pill buttons
      this.pillBtns.forEach((btn) => {
        if (btn.getAttribute('aria-pressed') === 'true') {
          const optionIndex = btn.dataset.optionIndex;
          this.selectedOptions[optionIndex] = btn.dataset.optionValue;
        }
      });
    }

    // ── Swatch (color/shade) selection ─────────────────────────────────────
    bindSwatches() {
      this.swatchBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const clickedBtn = e.currentTarget;
          const optionIndex = clickedBtn.dataset.optionIndex;
          const swatchValue = clickedBtn.dataset.swatchValue;
          const variantId = clickedBtn.dataset.variantId;

          // Update active state within the same option group
          const siblings = this.container.querySelectorAll(
            `.sd-qw111__swatch[data-option-index="${optionIndex}"]`
          );
          siblings.forEach((s) => {
            s.classList.remove('is-selected');
            s.setAttribute('aria-pressed', 'false');
          });
          clickedBtn.classList.add('is-selected');
          clickedBtn.setAttribute('aria-pressed', 'true');

          // Update swatch label
          if (this.swatchNameEl) {
            this.swatchNameEl.textContent = swatchValue;
          }

          // Update stored option
          this.selectedOptions[optionIndex] = swatchValue;

          // Update variant input directly from data attribute (single-option case)
          if (variantId) {
            this.updateVariantById(variantId);
          } else {
            this.resolveVariantFromOptions();
          }
        });
      });
    }

    // ── Pill (non-color option) selection ───────────────────────────────────
    bindPills() {
      this.pillBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const clickedBtn = e.currentTarget;
          const optionIndex = clickedBtn.dataset.optionIndex;
          const optionValue = clickedBtn.dataset.optionValue;

          // Update active state within the same option group
          const siblings = this.container.querySelectorAll(
            `.sd-qw111__pill[data-option-index="${optionIndex}"]`
          );
          siblings.forEach((s) => {
            s.classList.remove('is-selected');
            s.setAttribute('aria-pressed', 'false');
          });
          clickedBtn.classList.add('is-selected');
          clickedBtn.setAttribute('aria-pressed', 'true');

          this.selectedOptions[optionIndex] = optionValue;
          this.resolveVariantFromOptions();
        });
      });
    }

    // ── Update UI for a known variant ID ────────────────────────────────────
    updateVariantById(variantId) {
      if (!variantId || variantId === 'undefined') return;

      if (this.variantInput) {
        this.variantInput.value = variantId;
      }

      // Fetch variant data to update price/availability
      this.fetchVariantData(variantId);

      // Update the URL without reload
      this.updateUrl(variantId);
    }

    // ── Resolve variant from selected options using product JSON ─────────────
    resolveVariantFromOptions() {
      // Try to read product JSON from a script tag if available (Dawn pattern)
      const productJsonEl = this.container.closest('[data-section-id]')
        ? document.querySelector(`script[data-product-json]`)
        : null;

      if (productJsonEl) {
        try {
          const productData = JSON.parse(productJsonEl.textContent);
          this.matchVariantFromProductData(productData);
        } catch (e) {
          // JSON parse failed, fallback to URL-based fetch
        }
      }
    }

    matchVariantFromProductData(productData) {
      if (!productData || !productData.variants) return;

      const optionValues = Object.keys(this.selectedOptions)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => this.selectedOptions[key]);

      const matched = productData.variants.find((variant) => {
        return optionValues.every(
          (val, idx) => variant.options[idx] === val
        );
      });

      if (matched) {
        this.updateVariantById(matched.id);
      }
    }

    // ── Fetch variant data via AJAX ──────────────────────────────────────────
    fetchVariantData(variantId) {
      const productHandle = this.getProductHandle();
      if (!productHandle) return;

      fetch(
        `/products/${productHandle}.js`
      )
        .then((res) => {
          if (!res.ok) return null;
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          const variant = data.variants.find(
            (v) => String(v.id) === String(variantId)
          );
          if (variant) {
            this.updateAtcButton(variant);
            this.updateVariantImage(variant, data);
          }
        })
        .catch(() => {
          // Silently fail — form still has correct variant id
        });
    }

    getProductHandle() {
      // Try to extract from canonical link or window.location
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        const match = canonical.href.match(/\/products\/([^?#/]+)/);
        if (match) return match[1];
      }
      const match = window.location.pathname.match(/\/products\/([^?#/]+)/);
      return match ? match[1] : null;
    }

    // ── Update ATC button state based on variant ─────────────────────────────
    updateAtcButton(variant) {
      if (!this.atcBtn) return;

      const available = variant.available;

      // Update price
      if (this.atcPrice) {
        this.atcPrice.textContent = formatMoney(variant.price);
      }

      // Update label
      if (this.atcLabel) {
        if (available) {
          this.atcLabel.textContent =
            window.variantStrings?.addToCart || 'Add to cart';
        } else {
          this.atcLabel.textContent =
            window.variantStrings?.soldOut || 'Sold out';
        }
      }

      // Update button state
      if (available) {
        this.atcBtn.classList.remove('is-sold-out');
        this.atcBtn.removeAttribute('disabled');
        this.atcBtn.removeAttribute('aria-disabled');
      } else {
        this.atcBtn.classList.add('is-sold-out');
        this.atcBtn.setAttribute('disabled', 'true');
        this.atcBtn.setAttribute('aria-disabled', 'true');
      }
    }

    // ── Update main product image when variant changes ────────────────────────
    updateVariantImage(variant, productData) {
      if (!variant.featured_image) return;

      const imageId = variant.featured_image.id;
      this.setMainImage(imageId, variant.featured_image.src, productData);
    }

    setMainImage(imageId, src, productData) {
      if (!this.mainImgWrap) return;

      // Try to find an existing img element and update its src
      const currentImg = this.mainImgWrap.querySelector('.sd-qw111__main-img');
      if (currentImg) {
        // Build a srcset-friendly URL
        const baseSrc = src
          ? src.replace(/(\.[a-z]+)(\?.*)?$/, '_800x960$1')
          : src;
        currentImg.src = baseSrc || src;
        if (imageId) currentImg.dataset.currentImageId = imageId;

        // Sync the thumbnail active state
        this.syncThumbnailActive(imageId);
      }
    }

    // ── Thumbnail click binding ──────────────────────────────────────────────
    bindThumbnails() {
      this.thumbBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const clickedBtn = e.currentTarget;
          const imageId = clickedBtn.dataset.imageId;

          // Update active state
          this.thumbBtns.forEach((b) => {
            b.classList.remove('is-active');
            b.setAttribute('aria-current', 'false');
          });
          clickedBtn.classList.add('is-active');
          clickedBtn.setAttribute('aria-current', 'true');

          // Update main image: find the img inside the thumb button
          const thumbImg = clickedBtn.querySelector('img');
          if (thumbImg && this.mainImgWrap) {
            const currentMainImg = this.mainImgWrap.querySelector(
              '.sd-qw111__main-img'
            );
            if (currentMainImg && thumbImg) {
              // Upgrade to larger size
              const largeSrc = thumbImg.src
                .replace(/_\d+x\d+(\.[a-z]+)/, '_800x960$1')
                .replace(/\?.*$/, '');
              currentMainImg.src = largeSrc;
              currentMainImg.dataset.currentImageId = imageId;
            }
          }
        });
      });
    }

    // ── Sync thumbnail active state to match current image ───────────────────
    syncThumbnailActive(imageId) {
      if (!imageId) return;
      this.thumbBtns.forEach((btn) => {
        if (String(btn.dataset.imageId) === String(imageId)) {
          btn.classList.add('is-active');
          btn.setAttribute('aria-current', 'true');

          // Scroll thumb swiper to this slide
          if (this.thumbSwiper) {
            const slideIndex = Number(btn.dataset.imageIndex);
            this.thumbSwiper.slideTo(slideIndex);
          }
        } else {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-current', 'false');
        }
      });
    }

    // ── Thumb "next" arrow (scroll down) ────────────────────────────────────
    bindThumbNext() {
      if (!this.thumbNextBtn) return;
      this.thumbNextBtn.addEventListener('click', () => {
        if (this.thumbSwiper) {
          this.thumbSwiper.slideNext();
        }
      });
    }

    // ── Init thumbnail Swiper (vertical) ────────────────────────────────────
    initThumbSwiper() {
      if (!this.thumbTrack) return;

      waitForSwiper(() => {
        if (this.thumbSwiper) {
          this.thumbSwiper.destroy(true, true);
          this.thumbSwiper = null;
        }

        this.thumbSwiper = new Swiper(this.thumbTrack, {
          direction: 'vertical',
          slidesPerView: 'auto',
          spaceBetween: 8,
          freeMode: true,
          watchSlidesProgress: true,
          mousewheel: true,
          a11y: false,
        });
      });
    }

    // ── Init UGC Swiper (horizontal) ─────────────────────────────────────────
    initUgcSwiper() {
      if (!this.ugcSwiperEl) return;

      waitForSwiper(() => {
        if (this.ugcSwiper) {
          this.ugcSwiper.destroy(true, true);
          this.ugcSwiper = null;
        }

        this.ugcSwiper = new Swiper(this.ugcSwiperEl, {
          direction: 'horizontal',
          slidesPerView: 1.25,
          spaceBetween: 12,
          grabCursor: true,
          a11y: {
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
          },
          navigation: {
            nextEl: this.ugcNextBtn || null,
            prevEl: this.ugcPrevBtn || null,
          },
          breakpoints: {
            480: { slidesPerView: 2.25 },
            750: { slidesPerView: 3.25 },
            1024: { slidesPerView: 4 },
          },
        });
      });
    }

    // ── ATC form submission ──────────────────────────────────────────────────
    bindForm() {
      if (!this.form) return;

      this.form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!this.atcBtn || this.atcBtn.hasAttribute('disabled')) return;

        const variantId = this.variantInput ? this.variantInput.value : null;
        if (!variantId) return;

        this.setLoadingState(true);

        const formData = {
          id: variantId,
          quantity: 1,
        };

        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(formData),
        })
          .then((res) => {
            if (!res.ok) {
              return res.json().then((errData) => {
                throw new Error(errData.description || 'Cart add failed');
              });
            }
            return res.json();
          })
          .then(() => {
            this.setLoadingState(false);
            this.setSuccessState();

            // Dispatch cart update event for cart drawer / mini-cart
            document.dispatchEvent(new CustomEvent('cart:refresh', { bubbles: true }));

            // Also dispatch Shopify's standard event if listeners exist
            document.dispatchEvent(
              new CustomEvent('cart:item-added', {
                bubbles: true,
                detail: { variantId },
              })
            );

            // Reset button after delay
            setTimeout(() => this.resetAtcState(), 2500);
          })
          .catch(() => {
            this.setLoadingState(false);
            this.setErrorState();
            setTimeout(() => this.resetAtcState(), 3000);
          });
      });
    }

    setLoadingState(isLoading) {
      if (!this.atcBtn) return;

      if (isLoading) {
        this.atcBtn.classList.add('is-loading');
        this.atcBtn.setAttribute('aria-disabled', 'true');
        if (this.atcSpinner) {
          this.atcSpinner.removeAttribute('hidden');
          this.atcSpinner.setAttribute('aria-hidden', 'false');
        }
        if (this.atcLabel) {
          this._prevLabel = this.atcLabel.textContent;
        }
      } else {
        this.atcBtn.classList.remove('is-loading');
        this.atcBtn.removeAttribute('aria-disabled');
        if (this.atcSpinner) {
          this.atcSpinner.setAttribute('aria-hidden', 'true');
        }
      }
    }

    setSuccessState() {
      if (!this.atcBtn) return;
      this.atcBtn.classList.add('is-added');
      if (this.atcLabel) {
        this.atcLabel.textContent =
          window.variantStrings?.added || 'Added!';
      }
    }

    setErrorState() {
      if (!this.atcBtn) return;
      this.atcBtn.classList.add('is-error');
      if (this.atcLabel) {
        this.atcLabel.textContent =
          window.variantStrings?.error || 'Error — try again';
      }
    }

    resetAtcState() {
      if (!this.atcBtn) return;
      this.atcBtn.classList.remove('is-added', 'is-error');
      if (this.atcLabel && this._prevLabel) {
        this.atcLabel.textContent = this._prevLabel;
      }
    }

    // ── Update URL with selected variant ────────────────────────────────────
    updateUrl(variantId) {
      if (!variantId || !history.replaceState) return;
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variantId);
      history.replaceState({ variantId }, '', url.toString());
    }

    // ── Tear down ─────────────────────────────────────────────────────────────
    destroy() {
      if (this.thumbSwiper) {
        this.thumbSwiper.destroy(true, true);
        this.thumbSwiper = null;
      }
      if (this.ugcSwiper) {
        this.ugcSwiper.destroy(true, true);
        this.ugcSwiper = null;
      }
    }

    // ── Re-init after section editor reload ──────────────────────────────────
    reinit() {
      this.destroy();
      this.cacheElements();
      this.readInitialOptions();
      this.bindSwatches();
      this.bindPills();
      this.bindThumbnails();
      this.bindThumbNext();
      this.bindForm();
      this.initThumbSwiper();
      this.initUgcSwiper();
    }
  }

  // ─── Section registry ────────────────────────────────────────────────────────
  const sectionInstances = new Map();

  function mountSection(container) {
    const sectionId = container.dataset.sectionId;
    if (!sectionId) return;

    if (sectionInstances.has(sectionId)) {
      sectionInstances.get(sectionId).destroy();
    }

    const instance = new SdQw111Section(container);
    sectionInstances.set(sectionId, instance);
  }

  function unmountSection(sectionId) {
    if (sectionInstances.has(sectionId)) {
      sectionInstances.get(sectionId).destroy();
      sectionInstances.delete(sectionId);
    }
  }

  // ─── DOM Ready init ──────────────────────────────────────────────────────────
  function initAll() {
    document.querySelectorAll('sd-qw111[data-section-id]').forEach((el) => {
      mountSection(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // ─── Shopify section editor events ───────────────────────────────────────────
  document.addEventListener('shopify:section:load', (e) => {
    const sectionEl = e.target.querySelector('sd-qw111[data-section-id]');
    if (sectionEl) {
      mountSection(sectionEl);
    }
  });

  document.addEventListener('shopify:section:unload', (e) => {
    const sectionEl = e.target.querySelector('sd-qw111[data-section-id]');
    if (sectionEl) {
      unmountSection(sectionEl.dataset.sectionId);
    }
  });

  document.addEventListener('shopify:section:reorder', (e) => {
    const sectionEl = e.target.querySelector('sd-qw111[data-section-id]');
    if (sectionEl) {
      const instance = sectionInstances.get(sectionEl.dataset.sectionId);
      if (instance) instance.reinit();
    }
  });

  document.addEventListener('shopify:block:select', (e) => {
    const block = e.target;
    if (!block) return;

    // If a UGC block is selected in the editor, scroll/slide to it
    const sectionEl = block.closest('sd-qw111[data-section-id]');
    if (!sectionEl) return;

    const sectionId = sectionEl.dataset.sectionId;
    const instance = sectionInstances.get(sectionId);
    if (!instance || !instance.ugcSwiper) return;

    const slide = block.closest('.swiper-slide');
    if (!slide) return;

    const slides = Array.from(
      instance.ugcSwiperEl.querySelectorAll('.swiper-slide')
    );
    const index = slides.indexOf(slide);
    if (index > -1) {
      instance.ugcSwiper.slideTo(index);
    }
  });

  document.addEventListener('shopify:block:deselect', () => {
    // No special action needed on deselect
  });
})();