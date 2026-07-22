const THEME_KEY = "anton-kutyrev-theme-v2";
const HOME_HREF = "./index.html";
const DEFAULT_THEME = "orange";
const MOBILE_NAV_QUERY = "(max-width: 720px)";

const NAV_ITEMS = [
  ["home", HOME_HREF, "Home"],
  ["research", "./research.html", "Research"],
  ["publications", "./publications.html", "Publications"],
  ["cv", "./cv.html", "CV"],
  ["talks", "./talks.html", "Talks"],
  ["photography", "./photography.html", "Photography"],
  ["petrography", "./petrography.html", "Petrography"],
  ["hobbies", "./hobbies.html", "Hobbies"],
];

function applyTheme(theme) {
  const root = document.documentElement;
  const accessibilityButton = document.querySelector(
    ".theme-toggle-accessibility",
  );
  const nextTheme = theme === "accessible" ? "accessible" : DEFAULT_THEME;

  root.setAttribute("data-theme", nextTheme);

  if (accessibilityButton) {
    const accessibilityActive = nextTheme === "accessible";
    const label = accessibilityActive
      ? "Switch to standard theme"
      : "Switch to accessibility theme";

    accessibilityButton.textContent = accessibilityActive ? "A−" : "A+";
    accessibilityButton.setAttribute("aria-label", label);
    accessibilityButton.setAttribute("title", label);
    accessibilityButton.setAttribute(
      "aria-pressed",
      accessibilityActive ? "true" : "false",
    );
    accessibilityButton.classList.toggle("active", accessibilityActive);
  }
}

function renderSiteHeader() {
  // Give the main content a stable destination for the keyboard skip link.
  const mainContent = document.querySelector("main");

  if (mainContent && !mainContent.id) {
    mainContent.id = "main-content";
  }

  document.querySelectorAll("[data-site-header]").forEach((header) => {
    const activeKey = header.dataset.siteHeader;
    const nav = NAV_ITEMS.map(([key, href, label]) => {
      // aria-current tells screen readers which page is open.
      const activeAttributes =
        key === activeKey ? ' class="active" aria-current="page"' : "";

      return `<a${activeAttributes} href="${href}">${label}</a>`;
    }).join("");

    header.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to main content</a>
      <a class="brand" href="${HOME_HREF}">Anton Kutyrev</a>
      <nav class="site-nav" id="site-navigation" aria-label="Primary">${nav}</nav>
      <div class="theme-controls">
        <button
          class="nav-toggle"
          type="button"
          aria-controls="site-navigation"
          aria-expanded="false"
        >Menu</button>
        <button
          class="theme-toggle theme-toggle-accessibility"
          type="button"
          aria-label="Toggle accessibility theme"
        >A+</button>
      </div>
    `;
  });
}

function setupMenuToggle() {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".nav-toggle");
  const navigation = document.querySelector(".site-nav");

  if (!header || !menuButton || !navigation) {
    return;
  }

  // Keep the visual state, button text, and accessibility state synchronized.
  const setMenuOpen = (isOpen) => {
    header.classList.toggle("nav-open", isOpen);
    menuButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    menuButton.textContent = isOpen ? "Close" : "Menu";
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    setMenuOpen(!isOpen);
  });

  // Close the menu after a visitor chooses a page.
  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  // Escape closes the menu and returns focus to its button.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  // Reset the mobile menu when the window becomes wider than the breakpoint.
  window.matchMedia(MOBILE_NAV_QUERY).addEventListener("change", (event) => {
    if (!event.matches) {
      setMenuOpen(false);
    }
  });
}

function syncHomeLinks() {
  document.querySelectorAll("[data-home-link]").forEach((link) => {
    link.setAttribute("href", HOME_HREF);
  });
}

function renderSiteFooter() {
  document.querySelectorAll("[data-site-footer]").forEach((footer) => {
    const primary = footer.dataset.siteFooterPrimary || "Anton Kutyrev";
    const secondary = footer.dataset.siteFooterSecondary || "";

    footer.innerHTML = `<p>${primary}</p><p>${secondary}</p>`;
  });
}

function ensureLightbox() {
  if (
    !document.querySelector("[data-lightbox-src]") &&
    !document.querySelector("[data-lightbox-self]")
  ) {
    return null;
  }

  let lightbox = document.querySelector(".lightbox");

  if (!lightbox) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
        <div class="lightbox" hidden aria-hidden="true">
          <div
            class="lightbox-inner"
            role="dialog"
            aria-modal="true"
            aria-label="Expanded photo view"
          >
            <button class="lightbox-close" type="button" aria-label="Close expanded photo">
              ×
            </button>
            <button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">
              ‹
            </button>
            <div class="lightbox-viewport">
              <img
                class="lightbox-image"
                src=""
                alt=""
                role="button"
                tabindex="0"
                aria-label="Zoom expanded image"
              />
            </div>
            <button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">
              ›
            </button>
            <div class="lightbox-caption">
              <div class="lightbox-variants" hidden>
                <button
                  class="lightbox-variant-button"
                  type="button"
                  data-lightbox-variant-index="0"
                ></button>
                <button
                  class="lightbox-variant-button"
                  type="button"
                  data-lightbox-variant-index="1"
                ></button>
              </div>
              <p class="lightbox-title"></p>
              <p class="lightbox-note"></p>
              <p class="lightbox-count"></p>
            </div>
          </div>
        </div>
      `,
    );
    lightbox = document.querySelector(".lightbox");
  }

  return lightbox;
}

function setupThemeToggle() {
  const accessibilityButton = document.querySelector(
    ".theme-toggle-accessibility",
  );

  if (!accessibilityButton) {
    return;
  }

  accessibilityButton?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "accessible" ? DEFAULT_THEME : "accessible";

    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

function prepareLightboxTrigger(element, label, openItem) {
  // Buttons and links already have built-in keyboard behavior.
  const isNaturallyInteractive = element.matches("button, a[href]");

  if (!isNaturallyInteractive) {
    element.setAttribute("role", "button");
    element.setAttribute("tabindex", "0");
    element.setAttribute("aria-label", `Open expanded image: ${label}`);

    // Enter and Space now open a bare gallery image just like a button.
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openItem();
      }
    });
  }

  element.addEventListener("click", openItem);
}

function setupLightbox() {
  const lightbox = ensureLightbox();

  if (!lightbox) {
    return;
  }

  const lightboxImage = lightbox.querySelector(".lightbox-image");
  const lightboxViewport = lightbox.querySelector(".lightbox-viewport");
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxNote = lightbox.querySelector(".lightbox-note");
  const lightboxCount = lightbox.querySelector(".lightbox-count");
  const lightboxVariants = lightbox.querySelector(".lightbox-variants");
  const variantButtons = Array.from(
    lightbox.querySelectorAll(".lightbox-variant-button"),
  );
  const closeButton = lightbox.querySelector(".lightbox-close");
  const previousButton = lightbox.querySelector(".lightbox-prev");
  const nextButton = lightbox.querySelector(".lightbox-next");
  const galleryItems = [];
  let isDragging = false;
  let didDrag = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let scrollStartLeft = 0;
  let scrollStartTop = 0;
  let currentIndex = 0;
  let currentItem = null;
  let previouslyFocusedElement = null;

  const getVariants = (item) =>
    Array.isArray(item?.variants)
      ? item.variants.filter((variant) => variant?.src)
      : [];

  const setVariantButtons = (item, activeIndex = 0) => {
    const variants = getVariants(item);
    const hasVariantSwitcher = variants.length > 1;

    lightboxVariants.hidden = !hasVariantSwitcher;

    variantButtons.forEach((button, index) => {
      const variant = variants[index];

      if (!variant) {
        button.hidden = true;
        button.textContent = "";
        button.classList.remove("is-active");
        button.removeAttribute("aria-pressed");
        return;
      }

      button.hidden = false;
      button.textContent = variant.label || `View ${index + 1}`;
      button.classList.toggle("is-active", index === activeIndex);
      button.setAttribute(
        "aria-pressed",
        index === activeIndex ? "true" : "false",
      );
    });
  };

  const getCurrentView = (item, requestedVariantIndex = 0) => {
    const variants = getVariants(item);

    if (!variants.length) {
      return {
        src: item?.src || "",
        alt: item?.alt || "",
        variantIndex: 0,
      };
    }

    const safeVariantIndex = Math.min(
      Math.max(requestedVariantIndex, 0),
      variants.length - 1,
    );
    const variant = variants[safeVariantIndex];

    return {
      src: variant.src || item?.src || "",
      alt: variant.alt || item?.alt || "",
      variantIndex: safeVariantIndex,
    };
  };

  const setLightboxFrame = () => {
    const naturalWidth = lightboxImage.naturalWidth || 1;
    const naturalHeight = lightboxImage.naturalHeight || 1;
    const aspectRatio = naturalWidth / naturalHeight;
    const maxWidth = Math.max(280, window.innerWidth - 24);
    const maxHeight = Math.max(220, window.innerHeight - 96);
    let frameWidth = maxWidth;
    let frameHeight = frameWidth / aspectRatio;

    if (frameHeight > maxHeight) {
      frameHeight = maxHeight;
      frameWidth = frameHeight * aspectRatio;
    }

    lightboxViewport.style.setProperty(
      "--lightbox-frame-width",
      `${Math.round(frameWidth)}px`,
    );
    lightboxViewport.style.setProperty(
      "--lightbox-frame-height",
      `${Math.round(frameHeight)}px`,
    );
  };

  const resetZoom = () => {
    lightbox.classList.remove("is-zoomed");
    lightboxImage.style.width = "";
    lightboxImage.setAttribute("aria-label", "Zoom expanded image");
    lightboxViewport.scrollLeft = 0;
    lightboxViewport.scrollTop = 0;
  };

  const zoomImage = () => {
    const fittedWidth = lightboxImage.getBoundingClientRect().width;
    const naturalWidth = lightboxImage.naturalWidth || fittedWidth;
    const targetWidth = Math.min(
      naturalWidth,
      Math.max(fittedWidth * 2.5, window.innerWidth * 1.8),
    );

    lightboxImage.style.width = `${Math.round(targetWidth)}px`;
    lightbox.classList.add("is-zoomed");
    lightboxImage.setAttribute("aria-label", "Reset image zoom");

    requestAnimationFrame(() => {
      lightboxViewport.scrollLeft =
        (lightboxViewport.scrollWidth - lightboxViewport.clientWidth) / 2;
      lightboxViewport.scrollTop =
        (lightboxViewport.scrollHeight - lightboxViewport.clientHeight) / 2;
    });
  };

  const toggleZoom = () => {
    if (lightbox.classList.contains("is-zoomed")) {
      resetZoom();
      return;
    }

    if (lightboxImage.complete) {
      zoomImage();
      return;
    }

    lightboxImage.addEventListener("load", zoomImage, { once: true });
  };

  const closeLightbox = () => {
    const focusTarget = previouslyFocusedElement;

    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    resetZoom();
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxTitle.textContent = "";
    lightboxNote.textContent = "";
    lightboxCount.textContent = "";
    currentItem = null;
    previouslyFocusedElement = null;
    lightboxVariants.hidden = true;
    document.body.classList.remove("lightbox-open");

    // Return keyboard users to the image or button that opened the viewer.
    if (focusTarget && document.contains(focusTarget)) {
      focusTarget.focus();
    }
  };

  const updateGalleryControls = () => {
    const hasGallery = galleryItems.length > 1;

    lightbox.classList.toggle("has-gallery", hasGallery);
    previousButton.hidden = !hasGallery;
    nextButton.hidden = !hasGallery;
    lightboxCount.textContent = galleryItems.length
      ? `${currentIndex + 1} / ${galleryItems.length}`
      : "";
  };

  const openLightbox = (
    item,
    requestedVariantIndex = 0,
    options = {},
  ) => {
    const { src, alt, variantIndex } = getCurrentView(
      item,
      requestedVariantIndex,
    );
    const reopenZoomed =
      options.preserveZoom === true && lightbox.classList.contains("is-zoomed");

    if (lightbox.hidden) {
      previouslyFocusedElement =
        options.triggerElement || item?.element || document.activeElement;
    }

    currentItem = item;
    lightboxImage.src = src || "";
    lightboxImage.alt = alt || "";
    lightboxTitle.textContent = item?.title || "";
    lightboxNote.textContent = item?.note || "";
    setVariantButtons(item, variantIndex);
    updateGalleryControls();
    resetZoom();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    // Move focus into the dialog so its controls are announced immediately.
    requestAnimationFrame(() => {
      closeButton?.focus();
    });

    if (item?.zoomOnOpen || reopenZoomed) {
      if (lightboxImage.complete) {
        requestAnimationFrame(() => {
          setLightboxFrame();
          zoomImage();
        });
        return;
      }

      lightboxImage.addEventListener(
        "load",
        () => {
          setLightboxFrame();
          zoomImage();
        },
        { once: true },
      );
      return;
    }

    if (lightboxImage.complete) {
      requestAnimationFrame(setLightboxFrame);
      return;
    }

    lightboxImage.addEventListener("load", setLightboxFrame, { once: true });
  };

  const openGalleryItem = (index, triggerElement = null) => {
    if (!galleryItems.length) {
      return;
    }

    currentIndex = (index + galleryItems.length) % galleryItems.length;
    openLightbox(galleryItems[currentIndex], 0, { triggerElement });
  };

  const showPreviousImage = () => {
    openGalleryItem(currentIndex - 1);
  };

  const showNextImage = () => {
    openGalleryItem(currentIndex + 1);
  };

  const addGalleryItem = (item) => {
    if (!item.src) {
      return;
    }

    const existingIndex = galleryItems.findIndex(
      (galleryItem) => galleryItem.src === item.src,
    );

    if (existingIndex !== -1) {
      const openExistingItem = () => {
        openGalleryItem(existingIndex, item.element);
      };

      prepareLightboxTrigger(
        item.element,
        item.alt || item.title || "image",
        openExistingItem,
      );
      return;
    }

    const itemIndex = galleryItems.length;

    galleryItems.push(item);
    const openNewItem = () => {
      openGalleryItem(itemIndex, item.element);
    };

    prepareLightboxTrigger(
      item.element,
      item.alt || item.title || "image",
      openNewItem,
    );
  };

  document
    .querySelectorAll("[data-lightbox-src], img[data-lightbox-self]")
    .forEach((element) => {
      if (element.matches("[data-lightbox-src]")) {
        addGalleryItem({
          element,
          src: element.dataset.lightboxSrc || "",
          alt: element.dataset.lightboxAlt || "",
          title: element.dataset.lightboxTitle || "",
          note: element.dataset.lightboxNote || "",
          zoomOnOpen: element.dataset.lightboxZoom === "true",
          variants: [
            {
              src: element.dataset.lightboxVariantASrc || "",
              alt:
                element.dataset.lightboxVariantAAlt ||
                element.dataset.lightboxAlt ||
                "",
              label: element.dataset.lightboxVariantALabel || "",
            },
            {
              src: element.dataset.lightboxVariantBSrc || "",
              alt:
                element.dataset.lightboxVariantBAlt ||
                element.dataset.lightboxAlt ||
                "",
              label: element.dataset.lightboxVariantBLabel || "",
            },
          ].filter((variant) => variant.src),
        });
        return;
      }

      const image = element;
      const figure = image.closest("figure");
      const caption = figure?.querySelector("figcaption");

      addGalleryItem({
        element: image,
        src: image.currentSrc || image.getAttribute("src") || "",
        alt: image.getAttribute("alt") || "",
        title:
          image.dataset.lightboxTitle ||
          caption?.textContent?.trim() ||
          image.getAttribute("alt") ||
          "",
        note: image.dataset.lightboxNote || "",
        zoomOnOpen: image.dataset.lightboxZoom === "true",
      });
    });

  variantButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (!currentItem) {
        return;
      }

      const variantIndex = Number(button.dataset.lightboxVariantIndex || 0);
      openLightbox(currentItem, variantIndex, { preserveZoom: true });
    });
  });

  closeButton?.addEventListener("click", closeLightbox);
  previousButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showPreviousImage();
  });
  nextButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    showNextImage();
  });
  lightboxViewport.addEventListener("click", (event) => {
    event.stopPropagation();

    if (
      event.target === closeButton ||
      event.target === previousButton ||
      event.target === nextButton
    ) {
      return;
    }

    if (didDrag) {
      didDrag = false;
      return;
    }

    toggleZoom();
  });

  lightboxImage.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleZoom();
    }
  });

  lightboxViewport.addEventListener("pointerdown", (event) => {
    if (!lightbox.classList.contains("is-zoomed")) {
      return;
    }

    isDragging = true;
    didDrag = false;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    scrollStartLeft = lightboxViewport.scrollLeft;
    scrollStartTop = lightboxViewport.scrollTop;
    lightboxViewport.setPointerCapture(event.pointerId);
  });

  lightboxViewport.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    if (
      Math.abs(event.clientX - dragStartX) > 4 ||
      Math.abs(event.clientY - dragStartY) > 4
    ) {
      didDrag = true;
    }

    lightboxViewport.scrollLeft = scrollStartLeft - (event.clientX - dragStartX);
    lightboxViewport.scrollTop = scrollStartTop - (event.clientY - dragStartY);
  });

  lightboxViewport.addEventListener("pointerup", () => {
    isDragging = false;
  });

  lightboxViewport.addEventListener("pointercancel", () => {
    isDragging = false;
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) {
      return;
    }

    if (event.key === "Tab") {
      // Keep Tab focus inside the open dialog.
      const focusableElements = Array.from(
        lightbox.querySelectorAll(
          'button:not([hidden]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusableElements.length) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousImage();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextImage();
    }
  });

  window.addEventListener("resize", () => {
    if (!lightbox.hidden) {
      setLightboxFrame();
    }
  });
}

applyTheme(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);

document.addEventListener("DOMContentLoaded", () => {
  renderSiteHeader();
  renderSiteFooter();
  syncHomeLinks();
  applyTheme(document.documentElement.getAttribute("data-theme") || DEFAULT_THEME);
  setupMenuToggle();
  setupThemeToggle();
  setupLightbox();
});
