const THEME_KEY = "anton-kutyrev-theme";

function applyTheme(theme) {
  const root = document.documentElement;
  const button = document.querySelector(".theme-toggle");
  const nextTheme = theme === "dark" ? "dark" : "light";

  root.setAttribute("data-theme", nextTheme);

  if (button) {
    button.textContent = nextTheme === "dark" ? "Light mode" : "Dark mode";
    button.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
  }
}

const storedTheme = localStorage.getItem(THEME_KEY);

applyTheme(storedTheme || "light");

document.addEventListener("DOMContentLoaded", () => {
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
});
