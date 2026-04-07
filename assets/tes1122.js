(function () {
  'use strict';

  /**
   * Tes1122 Section Controller
   * Handles: mobile nav toggle, scroll-spy nav highlight, radar animation,
   * hero entrance animations, and Shopify section editor lifecycle events.
   */

  class Tes1122Section {
    constructor(sectionEl) {
      this.section = sectionEl;
      this.sectionId = sectionEl.id.replace('tes1122-', '');

      // Cache elements
      this.navToggle = sectionEl.querySelector('.tes1122__nav-toggle');
      this.mobileNav = sectionEl.querySelector('.tes1122__nav-mobile');
      this.navLinks = sectionEl.querySelectorAll('.tes1122__nav-link');
      this.nav = sectionEl.querySelector('.tes1122__nav');
      this.heroSection = sectionEl.querySelector('.tes1122__hero');
      this.radarRings = sectionEl.querySelectorAll('.tes1122__radar-ring');
      this.radarGlow = sectionEl.querySelector('.tes1122__radar-glow');
      this.scrollIndicator = sectionEl.querySelector('.tes1122__hero-scroll');

      // Bound handlers (for removal on unload)
      this._onToggleClick = this._onToggleClick.bind(this);
      this._onDocumentClick = this._onDocumentClick.bind(this);
      this._onScroll = this._onScroll.bind(this);
      this._onKeydown = this._onKeydown.bind(this);
      this._onScrollIndicatorClick = this._onScrollIndicatorClick.bind(this);

      this.init();
    }

    init() {
      this._initMobileNav();
      this._initScrollBehaviours();
      this._initHeroEntranceAnimation();
      this._initRadarAnimation();
      this._initScrollIndicator();
      this._initNavActiveState();
    }

    // ─── Mobile Navigation ──────────────────────────────────────────────────────

    _initMobileNav() {
      if (!this.navToggle || !this.mobileNav) return;

      this.navToggle.addEventListener('click', this._onToggleClick);
      document.addEventListener('click', this._onDocumentClick);
      document.addEventListener('keydown', this._onKeydown);

      // Close mobile nav links on click
      const mobileLinks = this.mobileNav.querySelectorAll(
        '.tes1122__nav-mobile-link, .tes1122__nav-mobile-cta'
      );
      mobileLinks.forEach((link) => {
        link.addEventListener('click', () => this._closeMobileNav());
      });
    }

    _onToggleClick(e) {
      e.stopPropagation();
      const isExpanded = this.navToggle.getAttribute('aria-expanded') === 'true';
      if (isExpanded) {
        this._closeMobileNav();
      } else {
        this._openMobileNav();
      }
    }

    _openMobileNav() {
      if (!this.navToggle || !this.mobileNav) return;
      this.navToggle.setAttribute('aria-expanded', 'true');
      this.mobileNav.setAttribute('aria-hidden', 'false');
      this.mobileNav.classList.add('tes1122__nav-mobile--open');
      this.navToggle.classList.add('tes1122__nav-toggle--active');
    }

    _closeMobileNav() {
      if (!this.navToggle || !this.mobileNav) return;
      this.navToggle.setAttribute('aria-expanded', 'false');
      this.mobileNav.setAttribute('aria-hidden', 'true');
      this.mobileNav.classList.remove('tes1122__nav-mobile--open');
      this.navToggle.classList.remove('tes1122__nav-toggle--active');
    }

    _onDocumentClick(e) {
      if (!this.nav) return;
      if (!this.nav.contains(e.target)) {
        this._closeMobileNav();
      }
    }

    _onKeydown(e) {
      if (e.key === 'Escape') {
        this._closeMobileNav();
        if (this.navToggle) this.navToggle.focus();
      }
    }

    // ─── Scroll Behaviours ───────────────────────────────────────────────────────

    _initScrollBehaviours() {
      window.addEventListener('scroll', this._onScroll, { passive: true });
      // Run once on init to set initial state
      this._onScroll();
    }

    _onScroll() {
      this._handleNavShrink();
    }

    _handleNavShrink() {
      if (!this.nav) return;
      if (window.scrollY > 40) {
        this.nav.classList.add('tes1122__nav--scrolled');
      } else {
        this.nav.classList.remove('tes1122__nav--scrolled');
      }
    }

    // ─── Nav Active State ────────────────────────────────────────────────────────

    _initNavActiveState() {
      if (!this.navLinks.length) return;
      const currentPath = window.location.pathname;

      this.navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && href !== '/' && currentPath.startsWith(href)) {
          link.classList.add('tes1122__nav-link--active');
          link.setAttribute('aria-current', 'page');
        } else if (href === '/' && currentPath === '/') {
          link.classList.add('tes1122__nav-link--active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }

    // ─── Hero Entrance Animation ─────────────────────────────────────────────────

    _initHeroEntranceAnimation() {
      if (!this.heroSection) return;

      const animatableEls = [
        this.section.querySelector('.tes1122__hero-badge'),
        this.section.querySelector('.tes1122__hero-headline'),
        this.section.querySelector('.tes1122__hero-subheading'),
        this.section.querySelector('.tes1122__hero-ctas'),
        this.section.querySelector('.tes1122__stats'),
        this.section.querySelector('.tes1122__hero-graphic'),
        this.section.querySelector('.tes1122__hero-counter'),
        this.section.querySelector('.tes1122__hero-scroll'),
      ];

      animatableEls.forEach((el, index) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
      });

      // Use requestAnimationFrame to ensure styles are applied before animating
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          animatableEls.forEach((el) => {
            if (!el) return;
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      });
    }

    // ─── Radar Animation ─────────────────────────────────────────────────────────

    _initRadarAnimation() {
      if (!this.radarRings.length) return;

      // Add staggered pulse animation classes
      this.radarRings.forEach((ring, index) => {
        ring.style.animationDelay = `${index * 0.4}s`;
        ring.classList.add('tes1122__radar-ring--animated');
      });

      if (this.radarGlow) {
        this.radarGlow.classList.add('tes1122__radar-glow--animated');
      }
    }

    // ─── Scroll Indicator Click ───────────────────────────────────────────────────

    _initScrollIndicator() {
      if (!this.scrollIndicator) return;
      this.scrollIndicator.style.cursor = 'pointer';
      this.scrollIndicator.addEventListener('click', this._onScrollIndicatorClick);
    }

    _onScrollIndicatorClick() {
      if (!this.heroSection) return;
      const heroBottom = this.heroSection.offsetTop + this.heroSection.offsetHeight;
      window.scrollTo({
        top: heroBottom,
        behavior: 'smooth',
      });
    }

    // ─── Teardown ────────────────────────────────────────────────────────────────

    destroy() {
      if (this.navToggle) {
        this.navToggle.removeEventListener('click', this._onToggleClick);
      }
      document.removeEventListener('click', this._onDocumentClick);
      document.removeEventListener('keydown', this._onKeydown);
      window.removeEventListener('scroll', this._onScroll);
      if (this.scrollIndicator) {
        this.scrollIndicator.removeEventListener('click', this._onScrollIndicatorClick);
      }
    }
  }

  // ─── Registry ─────────────────────────────────────────────────────────────────

  const instances = new Map();

  function initSection(sectionEl) {
    if (!sectionEl) return;
    // Destroy existing instance if re-initialising
    if (instances.has(sectionEl.id)) {
      instances.get(sectionEl.id).destroy();
      instances.delete(sectionEl.id);
    }
    const instance = new Tes1122Section(sectionEl);
    instances.set(sectionEl.id, instance);
  }

  function destroySection(sectionEl) {
    if (!sectionEl) return;
    if (instances.has(sectionEl.id)) {
      instances.get(sectionEl.id).destroy();
      instances.delete(sectionEl.id);
    }
  }

  function getSectionEl(event) {
    return event.target && event.target.closest
      ? event.target.closest('.tes1122')
      : null;
  }

  // ─── Initialise on DOMContentLoaded ──────────────────────────────────────────

  function initAll() {
    const sections = document.querySelectorAll('.tes1122');
    sections.forEach((el) => initSection(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // ─── Shopify Section Editor Events ────────────────────────────────────────────

  document.addEventListener('shopify:section:load', (event) => {
    const sectionEl = getSectionEl(event);
    if (sectionEl) {
      initSection(sectionEl);
    }
  });

  document.addEventListener('shopify:section:unload', (event) => {
    const sectionEl = getSectionEl(event);
    if (sectionEl) {
      destroySection(sectionEl);
    }
  });

  document.addEventListener('shopify:section:select', (event) => {
    const sectionEl = getSectionEl(event);
    if (sectionEl) {
      // Ensure nav is visible and section is in view in the editor
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  document.addEventListener('shopify:section:deselect', () => {
    // No specific action needed on deselect
  });

  document.addEventListener('shopify:block:select', (event) => {
    const sectionEl = getSectionEl(event);
    if (sectionEl) {
      // Re-initialise if a block is selected (e.g. settings updated)
      initSection(sectionEl);
    }
  });

})();