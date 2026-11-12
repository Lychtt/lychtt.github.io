
// =====================================
// HELPERS
// =====================================

const $ = (selector) => document.querySelector(selector);

const createElement = (tag, className, text) => {
  const element = document.createElement(tag);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  return element;
};


// =====================================
// SKILLS
// =====================================

const skillsList = $("#skills");

if (skillsList) {
  skillsList.replaceChildren(
    ...skills.map((skill) => createElement("li", "", skill))
  );
}


// =====================================
// PROJECT THUMBNAILS
// =====================================

const thumb = (src, alt = "Project preview") => {
  if (!src) return null;

  const button = createElement("button", "thumb");
  button.type = "button";
  button.dataset.full = src;
  button.dataset.alt = alt;
  button.setAttribute("aria-label", `Open image: ${alt}`);

  const img = createElement("img");
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";

  button.append(img);

  return button;
};


// =====================================
// PROJECTS
// =====================================

const projectGrid = $("#projectGrid");
const filters = $("#filters");

const categories = [
  "All",
  ...new Set(projects.map((project) => project.category))
];

function renderProjects(category = "All") {
  if (!projectGrid) return;

  const filteredProjects = projects.filter(
    (project) =>
      category === "All" || project.category === category
  );

  projectGrid.replaceChildren();

  if (filteredProjects.length === 0) {
    const emptyMessage = createElement(
      "p",
      "empty-state",
      "No projects found in this category."
    );

    projectGrid.append(emptyMessage);
    return;
  }

  filteredProjects.forEach((project) => {
    const card = createElement(
      "article",
      `card ${project.featured ? "featured" : ""}`
    );

    // Image or icon
    const image = project.image
      ? thumb(project.image, project.alt || project.title)
      : createElement("div", "icon", project.icon || "💻");

    if (image) card.append(image);

    // Category
    card.append(
      createElement("span", "badge", project.category)
    );

    // Title and description
    card.append(
      createElement("h3", "", project.title),
      createElement("p", "", project.description)
    );

    // Technologies
    const tags = createElement("div", "tags");

    project.tech.forEach((technology) => {
      tags.append(createElement("span", "", technology));
    });

    card.append(tags);

    // Links
    const links = createElement("div", "card-links");

    if (project.demo) {
      const demo = createElement("a", "", "Live Demo");
      demo.href = project.demo;
      demo.target = "_blank";
      demo.rel = "noopener noreferrer";
      links.append(demo);
    }

    if (project.code) {
      const code = createElement("a", "", "Source Code");
      code.href = project.code;
      code.target = "_blank";
      code.rel = "noopener noreferrer";
      links.append(code);
    }

    card.append(links);
    projectGrid.append(card);
  });
}


// =====================================
// PROJECT FILTERS
// =====================================

if (filters) {
  filters.replaceChildren();

  categories.forEach((category, index) => {
    const button = createElement("button", "", category);

    button.type = "button";
    button.classList.toggle("active", index === 0);
    button.setAttribute("aria-pressed", String(index === 0));

    button.addEventListener("click", () => {
      filters.querySelectorAll("button").forEach((filter) => {
        filter.classList.remove("active");
        filter.setAttribute("aria-pressed", "false");
      });

      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");

      renderProjects(category);
    });

    filters.append(button);
  });
}

renderProjects();


// =====================================
// CERTIFICATES
// =====================================

const certGrid = $("#certGrid");

if (certGrid) {
  certificates.forEach((certificate) => {
    const card = createElement("article", "card");

    const image = thumb(
      certificate.image,
      certificate.alt || certificate.title
    );

    if (image) card.append(image);

    card.append(
      createElement("h3", "", certificate.title),
      createElement(
        "p",
        "",
        `${certificate.issuer} · ${certificate.date}`
      )
    );

    certGrid.append(card);
  });
}


// =====================================
// LIGHTBOX
// =====================================

const lightbox = $("#lightbox");
const lightboxImage = $("#lbImg");
const closeButton = $(".lb-close");

let previousFocus = null;
let previousOverflow = "";

function openLightbox(button) {
  if (!lightbox || !lightboxImage) return;

  previousFocus = button;
  previousOverflow = document.body.style.overflow;

  lightboxImage.src = button.dataset.full;
  lightboxImage.alt = button.dataset.alt || "Image preview";

  lightbox.hidden = false;
  lightbox.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  closeButton?.focus();
}

function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");

  lightboxImage.src = "";
  lightboxImage.alt = "";

  document.body.style.overflow = previousOverflow;

  previousFocus?.focus();
  previousFocus = null;
}

// Open image
document.addEventListener("click", (event) => {
  const button = event.target.closest(".thumb");

  if (button) {
    openLightbox(button);
    return;
  }

  if (
    lightbox &&
    !lightbox.hidden &&
    (event.target === lightbox || event.target.closest(".lb-close"))
  ) {
    closeLightbox();
  }
});

// Keyboard controls
document.addEventListener("keydown", (event) => {
  if (lightbox && !lightbox.hidden) {
    if (event.key === "Escape") {
      closeLightbox();
    }

    // Keep keyboard focus inside the lightbox
    if (event.key === "Tab") {
      event.preventDefault();
      closeButton?.focus();
    }
  }
});


// =====================================
// DARK MODE
// =====================================

const root = document.documentElement;
const themeButton = $("#theme");

let savedTheme = null;

try {
  savedTheme = localStorage.getItem("theme");
} catch (error) {
  savedTheme = null;
}

function setTheme(theme) {
  root.dataset.theme = theme;

  if (themeButton) {
    const isDark = theme === "dark";

    themeButton.textContent = isDark ? "☀️" : "🌙";
    themeButton.setAttribute(
      "aria-label",
      isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    themeButton.setAttribute("aria-pressed", String(isDark));
  }
}

setTheme(savedTheme || "dark");

themeButton?.addEventListener("click", () => {
  const nextTheme =
    root.dataset.theme === "dark" ? "light" : "dark";

  setTheme(nextTheme);

  try {
    localStorage.setItem("theme", nextTheme);
  } catch (error) {
    // Theme still works even if storage is unavailable
  }
});


// =====================================
// MOBILE NAVIGATION
// =====================================

const menu = $("#menu");
const burger = $("#burger");

function closeMenu() {
  menu?.classList.remove("open");

  burger?.setAttribute("aria-expanded", "false");
  burger?.setAttribute("aria-label", "Open navigation menu");
}

burger?.addEventListener("click", () => {
  const isOpen = menu.classList.toggle("open");

  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute(
    "aria-label",
    isOpen ? "Close navigation menu" : "Open navigation menu"
  );
});

// Close menu after selecting a link
menu?.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    closeMenu();
  }
});

// Close menu when clicking outside
document.addEventListener("click", (event) => {
  if (
    menu?.classList.contains("open") &&
    !menu.contains(event.target) &&
    !burger?.contains(event.target)
  ) {
    closeMenu();
  }
});

// Close menu using Escape
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menu?.classList.contains("open")) {
    closeMenu();
    burger?.focus();
  }
});


// =====================================
// SCROLL REVEAL
// =====================================

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("show"));
}


// =====================================
// COPY EMAIL
// =====================================

const copyButton = $(".copy-email");
const copyStatus = $("#copyStatus");

copyButton?.addEventListener("click", async () => {
  const email = copyButton.dataset.copyEmail;

  try {
    await navigator.clipboard.writeText(email);

    copyButton.textContent = "Copied!";

    if (copyStatus) {
      copyStatus.textContent = "Email address copied to clipboard.";
    }

    setTimeout(() => {
      copyButton.textContent = "Copy";
    }, 2000);

  } catch (error) {
    if (copyStatus) {
      copyStatus.textContent =
        "Unable to copy automatically. Please copy the email manually.";
    }
  }
});


// =====================================
// BACK TO TOP
// =====================================

const backToTop = $("#backToTop");

function updateBackToTop() {
  if (!backToTop) return;

  backToTop.classList.toggle(
    "visible",
    window.scrollY > 400
  );
}

window.addEventListener("scroll", updateBackToTop, {
  passive: true
});

updateBackToTop();

backToTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth"
  });
});


// =====================================
// CONTACT FORM
// =====================================

const contactForm = $(".contact-grid form");
const formStatus = $("#formStatus");

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!contactForm.reportValidity()) return;

  const submitButton = contactForm.querySelector(
    'button[type="submit"]'
  );

  const originalText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";

  if (formStatus) {
    formStatus.textContent = "Sending your message...";
  }

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: new FormData(contactForm),
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Message could not be sent.");
    }

    if (formStatus) {
      formStatus.textContent =
        "Your message was sent successfully. Thank you!";
    }

    contactForm.reset();

  } catch (error) {
    if (formStatus) {
      formStatus.textContent =
        "Something went wrong. Please try again or email me directly.";
    }

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
});


// =====================================
// FOOTER YEAR
// =====================================

const year = $("#year");

if (year) {
  year.textContent = new Date().getFullYear();
}
