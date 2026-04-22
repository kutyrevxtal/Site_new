const THEME_KEY = "anton-kutyrev-theme";

const NAV_ITEMS = [
  ["home", "./index.html", "Home"],
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
  const button = document.querySelector(".theme-toggle");
  const nextTheme = theme === "dark" ? "dark" : "light";

  root.setAttribute("data-theme", nextTheme);

  if (button) {
    const label =
      nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode";

    button.textContent = "☼";
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
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
      <a class="brand" href="./index.html">Anton Kutyrev</a>
      <nav class="site-nav" aria-label="Primary">${nav}</nav>
      <button class="theme-toggle" type="button" aria-label="Toggle color theme">☼</button>
    `;
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
            <div class="lightbox-viewport">
              <img class="lightbox-image" src="" alt="" />
            </div>
            <div class="lightbox-caption">
              <p class="lightbox-title"></p>
              <p class="lightbox-note"></p>
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
  const button = document.querySelector(".theme-toggle");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

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
  const closeButton = lightbox.querySelector(".lightbox-close");
  let isDragging = false;
  let didDrag = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let scrollStartLeft = 0;
  let scrollStartTop = 0;

  const setLightboxFrame = () => {
    const naturalWidth = lightboxImage.naturalWidth || 1;
    const naturalHeight = lightboxImage.naturalHeight || 1;
    const aspectRatio = naturalWidth / naturalHeight;
    const maxWidth = Math.min(1320, Math.max(280, window.innerWidth - 40));
    const maxHeight = Math.max(220, window.innerHeight - 150);
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
    document.body.classList.remove("lightbox-open");
  };

  const openLightbox = ({ src, alt, title, note, zoomOnOpen = false }) => {
    lightboxImage.src = src || "";
    lightboxImage.alt = alt || "";
    lightboxTitle.textContent = title || "";
    lightboxNote.textContent = note || "";
    resetZoom();
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");

    if (zoomOnOpen) {
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

  document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox({
        src: trigger.dataset.lightboxSrc || "",
        alt: trigger.dataset.lightboxAlt || "",
        title: trigger.dataset.lightboxTitle || "",
        note: trigger.dataset.lightboxNote || "",
        zoomOnOpen: trigger.dataset.lightboxZoom === "true",
      });
    });
  });

  document.querySelectorAll("img[data-lightbox-self]").forEach((image) => {
    image.addEventListener("click", () => {
      const figure = image.closest("figure");
      const caption = figure?.querySelector("figcaption");
      openLightbox({
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
  });

  closeButton?.addEventListener("click", closeLightbox);
  lightboxImage.addEventListener("click", (event) => {
    event.stopPropagation();

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
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });

  window.addEventListener("resize", () => {
    if (!lightbox.hidden) {
      setLightboxFrame();
    }
  });
}

applyTheme(localStorage.getItem(THEME_KEY) || "dark");

document.addEventListener("DOMContentLoaded", () => {
  renderSiteHeader();
  renderSiteFooter();
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  setupThemeToggle();
  setupLightbox();
});
