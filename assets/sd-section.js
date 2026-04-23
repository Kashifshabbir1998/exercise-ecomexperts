class SdSectionController {
  constructor(element) {
    this.el = element;
    this.init();
  }

  init() {
    const block = this.el.querySelector('.split-feature-block');
    if (!block) return;
    this.observeEntrance(block);
  }

  observeEntrance(block) {
    if (!('IntersectionObserver' in window)) {
      block.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(block);
    this._observer = observer;
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
  }
}

// Registry to manage instances per section
const sdSectionInstances = new Map();

function initSdSection(container) {
  const sectionEl = container.querySelector('sd-section');
  if (!sectionEl) return;

  const sectionId = container.id;
  if (sdSectionInstances.has(sectionId)) {
    sdSectionInstances.get(sectionId).destroy();
  }

  const instance = new SdSectionController(sectionEl);
  sdSectionInstances.set(sectionId, instance);
}

function destroySdSection(container) {
  const sectionId = container.id;
  if (sdSectionInstances.has(sectionId)) {
    sdSectionInstances.get(sectionId).destroy();
    sdSectionInstances.delete(sectionId);
  }
}

function getContainer(event) {
  return event.detail && event.detail.sectionId
    ? document.getElementById('shopify-section-' + event.detail.sectionId)
    : null;
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sd-section.shopify-section').forEach((container) => {
    initSdSection(container);
  });
});

document.addEventListener('shopify:section:load', (event) => {
  const container = getContainer(event);
  if (!container || !container.classList.contains('sd-section')) return;
  initSdSection(container);
});

document.addEventListener('shopify:section:unload', (event) => {
  const container = getContainer(event);
  if (!container || !container.classList.contains('sd-section')) return;
  destroySdSection(container);
});

document.addEventListener('shopify:section:select', (event) => {
  const container = getContainer(event);
  if (!container || !container.classList.contains('sd-section')) return;
  const block = container.querySelector('.split-feature-block');
  if (block) block.classList.add('is-visible');
});

document.addEventListener('shopify:block:select', (event) => {
  const container = getContainer(event);
  if (!container || !container.classList.contains('sd-section')) return;
  const block = container.querySelector('.split-feature-block');
  if (block) block.classList.add('is-visible');
});