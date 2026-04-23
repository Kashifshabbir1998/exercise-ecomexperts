class SdSectionElement extends HTMLElement {
  connectedCallback() {
    this._init();
  }

  _init() {
    // Animate content panels into view when they enter the viewport
    this._setupIntersectionObserver();
    // Handle CTA link accessibility enhancement
    this._setupCta();
  }

  _setupIntersectionObserver() {
    const panels = this.querySelectorAll('.sd-section__panel');
    if (!panels.length) return;

    if (!('IntersectionObserver' in window)) {
      // Graceful degradation: just make everything visible
      panels.forEach((panel) => panel.classList.add('sd-section__panel--visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('sd-section__panel--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    panels.forEach((panel) => observer.observe(panel));
    this._observer = observer;
  }

  _setupCta() {
    const cta = this.querySelector('.sd-section__cta');
    if (!cta) return;

    // Ensure keyboard focus is visually apparent and the link is operable
    cta.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        cta.click();
      }
    });
  }

  disconnectedCallback() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

// Register custom element only once
if (!customElements.get('sd-section')) {
  customElements.define('sd-section', SdSectionElement);
}

// Handle Shopify section editor events
document.addEventListener('shopify:section:load', (event) => {
  const sectionEl = event.target;
  if (!sectionEl) return;

  const sdSection = sectionEl.querySelector('sd-section');
  if (sdSection) {
    // Re-initialise after section reload in editor
    sdSection._init();
  }
});

document.addEventListener('shopify:section:unload', (event) => {
  const sectionEl = event.target;
  if (!sectionEl) return;

  const sdSection = sectionEl.querySelector('sd-section');
  if (sdSection && sdSection._observer) {
    sdSection._observer.disconnect();
    sdSection._observer = null;
  }
});

document.addEventListener('shopify:block:select', (event) => {
  const block = event.target;
  if (!block) return;

  // Bring selected block into view within the editor
  if (block.scrollIntoView) {
    block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});