(function () {
  'use strict';

  // ============================================================
  // UTILITY: Safe querySelector scoped to a container
  // ============================================================
  function qs(container, selector) {
    return container ? container.querySelector(selector) : null;
  }

  function qsa(container, selector) {
    return container ? Array.from(container.querySelectorAll(selector)) : [];
  }

  // ============================================================
  // INTERSECTION OBSERVER — scroll-triggered animations
  // ============================================================
  function initAnimations(sectionEl) {
    const animatables = qsa(sectionEl, '[data-animate]');
    if (!animatables.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sd-is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    animatables.forEach((el) => observer.observe(el));

    // Store observer for cleanup
    sectionEl._sdAnimationObserver = observer;
  }

  function destroyAnimations(sectionEl) {
    if (sectionEl._sdAnimationObserver) {
      sectionEl._sdAnimationObserver.disconnect();
      sectionEl._sdAnimationObserver = null;
    }
  }

  // ============================================================
  // SWIPER — How It Works (mobile)
  // ============================================================
  function initHowSwiper(sectionEl) {
    const swiperEl = qs(sectionEl, '.sd-testpage__how-swiper');
    if (!swiperEl) return null;

    if (typeof Swiper === 'undefined') return null;

    const swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: false,
      pagination: {
        el: qs(sectionEl, '.sd-testpage__how-pagination'),
        clickable: true,
      },
      a11y: {
        prevSlideMessage: 'Previous step',
        nextSlideMessage: 'Next step',
      },
    });

    return swiper;
  }

  // ============================================================
  // SWIPER — Reviews (mobile)
  // ============================================================
  function initReviewsSwiper(sectionEl) {
    const swiperEl = qs(sectionEl, '.sd-testpage__reviews-swiper');
    if (!swiperEl) return null;

    if (typeof Swiper === 'undefined') return null;

    const swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      navigation: {
        prevEl: qs(sectionEl, '.sd-testpage__reviews-prev'),
        nextEl: qs(sectionEl, '.sd-testpage__reviews-next'),
      },
      a11y: {
        prevSlideMessage: 'Previous review',
        nextSlideMessage: 'Next review',
      },
      breakpoints: {
        640: {
          slidesPerView: 1.5,
        },
      },
    });

    return swiper;
  }

  // ============================================================
  // VARIANT SELECTOR — Shade swatches + price update
  // ============================================================
  function initVariantSelector(sectionEl) {
    const swatches = qsa(sectionEl, '.sd-testpage__swatch');
    if (!swatches.length) return;

    const variantInput = qs(sectionEl, '[data-sd-variant-input]');
    const priceDisplay = qs(sectionEl, '.sd-testpage__product-price');
    const atcBtn = qs(sectionEl, '.sd-testpage__btn--atc[type="submit"]');

    swatches.forEach((swatch) => {
      swatch.addEventListener('click', function () {
        const variantId = this.dataset.variantId;
        if (!variantId) return;

        // Update active state
        swatches.forEach((s) => {
          s.classList.remove('sd-testpage__swatch--active');
          s.setAttribute('aria-pressed', 'false');
        });
        this.classList.add('sd-testpage__swatch--active');
        this.setAttribute('aria-pressed', 'true');

        // Update hidden input
        if (variantInput) {
          variantInput.value = variantId;
        }

        // Fetch variant data and update price / ATC state
        fetchVariantData(variantId, priceDisplay, atcBtn);
      });
    });
  }

  function fetchVariantData(variantId, priceDisplay, atcBtn) {
    fetch(`/variants/${variantId}.js`)
      .then((response) => {
        if (!response.ok) throw new Error('Variant fetch failed');
        return response.json();
      })
      .then((variant) => {
        if (priceDisplay) {
          priceDisplay.textContent = formatMoney(variant.price);
        }

        if (atcBtn) {
          if (variant.available) {
            atcBtn.removeAttribute('disabled');
            atcBtn.textContent = window.theme && window.theme.strings && window.theme.strings.addToCart
              ? window.theme.strings.addToCart
              : 'Add to cart';
          } else {
            atcBtn.setAttribute('disabled', 'disabled');
            atcBtn.textContent = window.theme && window.theme.strings && window.theme.strings.soldOut
              ? window.theme.strings.soldOut
              : 'Sold out';
          }
        }
      })
      .catch(() => {
        // Silently handle fetch errors — variant data unavailable
      });
  }

  function formatMoney(cents) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, window.theme && window.theme.moneyFormat ? window.theme.moneyFormat : '${{amount}}');
    }
    return '$' + (cents / 100).toFixed(2);
  }

  // ============================================================
  // ADD TO CART — AJAX form submission
  // ============================================================
  function initAtcForm(sectionEl) {
    const form = qs(sectionEl, '.sd-testpage__atc-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = qs(form, '[type="submit"]');
      const variantInput = qs(form, '[data-sd-variant-input]');
      const variantId = variantInput ? variantInput.value : null;

      if (!variantId) return;

      // Loading state
      if (submitBtn) {
        submitBtn.setAttribute('disabled', 'disabled');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.dataset.originalText = submitBtn.textContent;
        submitBtn.textContent = 'Adding…';
      }

      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          id: parseInt(variantId, 10),
          quantity: 1,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((data) => {
              throw new Error(data.description || 'Could not add to cart');
            });
          }
          return response.json();
        })
        .then(() => {
          // Success state
          if (submitBtn) {
            submitBtn.textContent = 'Added!';
            submitBtn.removeAttribute('aria-busy');
          }

          // Dispatch cart update event for cart drawer / mini cart
          document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));

          // Attempt to refresh cart count via Shopify API
          refreshCartCount();

          // Reset button after delay
          setTimeout(() => {
            if (submitBtn) {
              submitBtn.textContent = submitBtn.dataset.originalText || 'Add to cart';
              submitBtn.removeAttribute('disabled');
            }
          }, 2000);
        })
        .catch((error) => {
          // Error state
          if (submitBtn) {
            submitBtn.textContent = error.message || 'Error — try again';
            submitBtn.removeAttribute('aria-busy');
            submitBtn.removeAttribute('disabled');
          }

          setTimeout(() => {
            if (submitBtn) {
              submitBtn.textContent = submitBtn.dataset.originalText || 'Add to cart';
            }
          }, 3000);
        });
    });
  }

  function refreshCartCount() {
    fetch('/cart.js')
      .then((res) => res.json())
      .then((cart) => {
        // Update any cart count bubbles on the page
        const countEls = document.querySelectorAll('[data-cart-count]');
        countEls.forEach((el) => {
          el.textContent = cart.item_count;
        });
        document.dispatchEvent(
          new CustomEvent('cart:count-updated', {
            bubbles: true,
            detail: { count: cart.item_count },
          })
        );
      })
      .catch(() => {
        // Cart count refresh failed silently
      });
  }

  // ============================================================
  // FAQ ACCORDION — smooth animation for <details> elements
  // ============================================================
  function initFaqAccordion(sectionEl) {
    const faqItems = qsa(sectionEl, '.sd-testpage__faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((details) => {
      const summary = qs(details, '.sd-testpage__faq-question');
      const answer = qs(details, '.sd-testpage__faq-answer');

      if (!summary || !answer) return;

      summary.addEventListener('click', function (e) {
        e.preventDefault();

        const isOpen = details.hasAttribute('open');

        // Close any other open items
        faqItems.forEach((otherDetails) => {
          if (otherDetails !== details && otherDetails.hasAttribute('open')) {
            closeFaqItem(otherDetails);
          }
        });

        if (isOpen) {
          closeFaqItem(details);
        } else {
          openFaqItem(details);
        }
      });
    });
  }

  function openFaqItem(details) {
    details.setAttribute('open', '');
    const answer = qs(details, '.sd-testpage__faq-answer');
    if (!answer) return;

    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.3s ease';

    requestAnimationFrame(() => {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  }

  function closeFaqItem(details) {
    const answer = qs(details, '.sd-testpage__faq-answer');
    if (!answer) return;

    answer.style.maxHeight = answer.scrollHeight + 'px';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.3s ease';

    requestAnimationFrame(() => {
      answer.style.maxHeight = '0';
    });

    answer.addEventListener(
      'transitionend',
      () => {
        details.removeAttribute('open');
        answer.style.maxHeight = '';
        answer.style.overflow = '';
        answer.style.transition = '';
      },
      { once: true }
    );
  }

  // ============================================================
  // MAIN INIT / DESTROY PER SECTION
  // ============================================================
  const sectionInstances = new Map();

  function initSection(sectionEl) {
    if (!sectionEl) return;

    // Wait for Swiper to be available (loaded via defer)
    const tryInitSwipers = () => {
      if (typeof Swiper !== 'undefined') {
        const howSwiper = initHowSwiper(sectionEl);
        const reviewsSwiper = initReviewsSwiper(sectionEl);
        sectionInstances.set(sectionEl, { howSwiper, reviewsSwiper });
      } else {
        setTimeout(tryInitSwipers, 100);
      }
    };

    tryInitSwipers();
    initAnimations(sectionEl);
    initVariantSelector(sectionEl);
    initAtcForm(sectionEl);
    initFaqAccordion(sectionEl);
  }

  function destroySection(sectionEl) {
    if (!sectionEl) return;

    destroyAnimations(sectionEl);

    const instances = sectionInstances.get(sectionEl);
    if (instances) {
      if (instances.howSwiper && typeof instances.howSwiper.destroy === 'function') {
        instances.howSwiper.destroy(true, true);
      }
      if (instances.reviewsSwiper && typeof instances.reviewsSwiper.destroy === 'function') {
        instances.reviewsSwiper.destroy(true, true);
      }
      sectionInstances.delete(sectionEl);
    }
  }

  // ============================================================
  // BLOCK SELECT — highlight selected block in editor
  // ============================================================
  function handleBlockSelect(sectionEl, blockId) {
    if (!sectionEl || !blockId) return;

    // Scroll FAQ item into view when selected in editor
    const block = sectionEl.querySelector(`[data-shopify-editor-block="${blockId}"]`);
    if (block) {
      block.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Open FAQ item if it's a details element
      if (block.tagName === 'DETAILS' && !block.hasAttribute('open')) {
        openFaqItem(block);
      }
    }

    // For swiper blocks (how_step, review_card), navigate to correct slide
    const instances = sectionInstances.get(sectionEl);
    if (instances) {
      if (instances.howSwiper) {
        const slides = qsa(sectionEl, '.sd-testpage__how-swiper .swiper-slide');
        slides.forEach((slide, index) => {
          if (slide.dataset.shopifyEditorBlock === blockId) {
            instances.howSwiper.slideTo(index);
          }
        });
      }
      if (instances.reviewsSwiper) {
        const slides = qsa(sectionEl, '.sd-testpage__reviews-swiper .swiper-slide');
        slides.forEach((slide, index) => {
          if (slide.dataset.shopifyEditorBlock === blockId) {
            instances.reviewsSwiper.slideTo(index);
          }
        });
      }
    }
  }

  // ============================================================
  // SHOPIFY SECTION EDITOR EVENTS
  // ============================================================
  document.addEventListener('shopify:section:load', function (e) {
    const sectionEl = e.target;
    if (!sectionEl) return;
    if (!sectionEl.querySelector('sd-testpage')) return;

    destroySection(sectionEl);
    initSection(sectionEl);
  });

  document.addEventListener('shopify:section:unload', function (e) {
    const sectionEl = e.target;
    if (!sectionEl) return;
    destroySection(sectionEl);
  });

  document.addEventListener('shopify:section:reorder', function (e) {
    const sectionEl = e.target;
    if (!sectionEl) return;
    if (!sectionEl.querySelector('sd-testpage')) return;
    destroySection(sectionEl);
    initSection(sectionEl);
  });

  document.addEventListener('shopify:block:select', function (e) {
    const sectionEl = e.target.closest('.shopify-section');
    if (!sectionEl) return;
    if (!sectionEl.querySelector('sd-testpage')) return;
    handleBlockSelect(sectionEl, e.detail && e.detail.blockId);
  });

  document.addEventListener('shopify:block:deselect', function (e) {
    const sectionEl = e.target.closest('.shopify-section');
    if (!sectionEl) return;
    if (!sectionEl.querySelector('sd-testpage')) return;
    // Close any open FAQ items on block deselect
    qsa(sectionEl, '.sd-testpage__faq-item[open]').forEach((details) => {
      closeFaqItem(details);
    });
  });

  // ============================================================
  // DOM CONTENT LOADED — initialise all sd-testpage sections
  // ============================================================
  function onReady() {
    const sections = document.querySelectorAll('.sd-testpage-section, .sd-testpage');
    sections.forEach((sectionEl) => {
      // Find the nearest .shopify-section ancestor or the element itself
      const root = sectionEl.closest('.shopify-section') || sectionEl;
      initSection(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }
})();