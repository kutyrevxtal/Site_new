const THEME_KEY = "anton-kutyrev-theme-v2";
const HOME_HREF = "./index.html";
const DEFAULT_THEME = "orange";
const STANDARD_THEME = "dark";

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
  const orangeButton = document.querySelector(".theme-toggle-orange");
  const nextTheme =
    theme === "accessible" || theme === "orange" ? theme : DEFAULT_THEME;

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

  if (orangeButton) {
    const orangeActive = nextTheme === "orange";
    const label = orangeActive
      ? "Switch to standard theme"
      : "Switch to orange theme";

    orangeButton.textContent = "O";
    orangeButton.setAttribute("aria-label", label);
    orangeButton.setAttribute("title", label);
    orangeButton.setAttribute("aria-pressed", orangeActive ? "true" : "false");
    orangeButton.classList.toggle("active", orangeActive);
  }
}

function renderSiteHeader() {
  document.querySelectorAll("[data-site-header]").forEach((header) => {
    const activeKey = header.dataset.siteHeader;
    const nav = NAV_ITEMS.map(([key, href, label]) => {
      const activeClass = key === activeKey ? " class=\"active\"" : "";
      return `<a${activeClass} href="${href}">${label}</a>`;
    }).join("");

    header.innerHTML = `
      <a class="brand" href="${HOME_HREF}">Anton Kutyrev</a>
      <nav class="site-nav" aria-label="Primary">${nav}</nav>
      <div class="theme-controls">
        <button
          class="theme-toggle theme-toggle-accessibility"
          type="button"
          aria-label="Toggle accessibility theme"
        >A+</button>
        <button
          class="theme-toggle theme-toggle-orange"
          type="button"
          aria-label="Toggle orange theme"
        >O</button>
      </div>
    `;
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
              <img class="lightbox-image" src="" alt="" />
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
  const orangeButton = document.querySelector(".theme-toggle-orange");

  if (!accessibilityButton && !orangeButton) {
    return;
  }

  accessibilityButton?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "accessible" ? DEFAULT_THEME : "accessible";

    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  orangeButton?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "orange" ? STANDARD_THEME : "orange";

    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
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
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    resetZoom();
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxTitle.textContent = "";
    lightboxNote.textContent = "";
    lightboxCount.textContent = "";
    currentItem = null;
    lightboxVariants.hidden = true;
    document.body.classList.remove("lightbox-open");
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

  const openGalleryItem = (index) => {
    if (!galleryItems.length) {
      return;
    }

    currentIndex = (index + galleryItems.length) % galleryItems.length;
    openLightbox(galleryItems[currentIndex], 0);
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
      item.element.addEventListener("click", () => {
        openGalleryItem(existingIndex);
      });
      return;
    }

    const itemIndex = galleryItems.length;

    galleryItems.push(item);
    item.element.addEventListener("click", () => {
      openGalleryItem(itemIndex);
    });
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

    if (event.key === "Escape") {
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      showPreviousImage();
      return;
    }

    if (event.key === "ArrowRight") {
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
  setupThemeToggle();
  setupLightbox();
});
