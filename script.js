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
            <img class="lightbox-image" src="" alt="" />
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
  const lightboxTitle = lightbox.querySelector(".lightbox-title");
  const lightboxNote = lightbox.querySelector(".lightbox-note");
  const closeButton = lightbox.querySelector(".lightbox-close");

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.removeAttribute("src");
    lightboxImage.alt = "";
    lightboxTitle.textContent = "";
    lightboxNote.textContent = "";
    document.body.classList.remove("lightbox-open");
  };

  const openLightbox = ({ src, alt, title, note }) => {
    lightboxImage.src = src || "";
    lightboxImage.alt = alt || "";
    lightboxTitle.textContent = title || "";
    lightboxNote.textContent = note || "";
    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  };

  document.querySelectorAll("[data-lightbox-src]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      openLightbox({
        src: trigger.dataset.lightboxSrc || "",
        alt: trigger.dataset.lightboxAlt || "",
        title: trigger.dataset.lightboxTitle || "",
        note: trigger.dataset.lightboxNote || "",
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
      });
    });
  });

  closeButton?.addEventListener("click", closeLightbox);

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
}

applyTheme(localStorage.getItem(THEME_KEY) || "dark");

document.addEventListener("DOMContentLoaded", () => {
  renderSiteHeader();
  renderSiteFooter();
  applyTheme(document.documentElement.getAttribute("data-theme") || "dark");
  setupThemeToggle();
  setupLightbox();
});
