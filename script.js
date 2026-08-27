"use strict";

/* ==========================================================
   1. SÉLECTION DES ÉLÉMENTS HTML
   Ces constantes donnent accès aux éléments interactifs du site.
========================================================== */
const page = document.body;
const modeButton = document.querySelector(".mode-toggle");
const techLabel = document.querySelector(".tech-label");
const businessLabel = document.querySelector(".business-label");
const menuButton = document.querySelector(".menu-button");
const navigation = document.querySelector(".main-navigation");
const navigationLinks = navigation.querySelectorAll("a");
const terminalText = document.querySelector("#typed-command");
const yearElement = document.querySelector("#current-year");
const languageSelector = document.querySelector("#language-selector");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const contactRedirect = document.querySelector("#contact-redirect");

function readStoredValue(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    return;
  }
}

/* ==========================================================
   2. MODE TECH / BUSINESS
   Change le message principal selon le profil choisi.
========================================================== */
function toggleProfileMode() {
  const businessModeIsActive = page.classList.toggle("business-mode");

  page.classList.toggle("tech-mode", !businessModeIsActive);
  techLabel.classList.toggle("active", !businessModeIsActive);
  businessLabel.classList.toggle("active", businessModeIsActive);
  modeButton.setAttribute("aria-pressed", String(businessModeIsActive));
  writeStoredValue("portfolio-mode", businessModeIsActive ? "business" : "tech");
}

function restoreProfileMode() {
  const savedMode = readStoredValue("portfolio-mode");
  const businessModeWasSelected = savedMode === "business";

  page.classList.toggle("business-mode", businessModeWasSelected);
  page.classList.toggle("tech-mode", !businessModeWasSelected);
  techLabel.classList.toggle("active", !businessModeWasSelected);
  businessLabel.classList.toggle("active", businessModeWasSelected);
  modeButton.setAttribute("aria-pressed", String(businessModeWasSelected));
}

/* ==========================================================
   3. MENU MOBILE
   Ouvre ou ferme la navigation sur les petits écrans.
========================================================== */
function updateMobileMenu(isOpen) {
  navigation.classList.toggle("nav-open", isOpen);
  menuButton.textContent = isOpen ? "×" : "☰";
  menuButton.setAttribute("aria-expanded", String(isOpen));
}

function toggleMobileMenu() {
  const menuIsOpen = navigation.classList.contains("nav-open");

  updateMobileMenu(!menuIsOpen);
}

function closeMobileMenu() {
  updateMobileMenu(false);
}

/* ==========================================================
   4. TERMINAL ANIMÉ
   Affiche progressivement la commande dans la section Hero.
========================================================== */
function startTerminalAnimation() {
  if (!terminalText) {
    return;
  }

  const command =
    "Myrtho.obtenirCompetences() => ['Ingénierie de prompts', 'Développement full-stack', 'Tableaux de bord financiers']";

  let characterIndex = 0;

  const typingInterval = window.setInterval(function typeNextCharacter() {
    characterIndex += 1;
    terminalText.textContent = command.slice(0, characterIndex);

    if (characterIndex >= command.length) {
      window.clearInterval(typingInterval);
    }
  }, 28);
}

/* ==========================================================
   5. ANNÉE DU COPYRIGHT
   Évite de modifier manuellement l'année dans le pied de page.
========================================================== */
function displayCurrentYear() {
  const currentYear = new Date().getFullYear();

  yearElement.textContent = currentYear;
}

/* ==========================================================
   6. TRADUCTION GOOGLE
   Le choix manuel est conservé dans le navigateur. Lors de la
   première visite, la langue du navigateur sert de préférence.
========================================================== */
const supportedLanguages = ["en", "es", "fr", "ht"];
const languagePreferenceKey = "portfolio-language";
let requestedLanguage = "fr";

function getPreferredLanguage() {
  const savedLanguage = readStoredValue(languagePreferenceKey);

  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }

  return "fr";
}

function saveLanguagePreference(language) {
  writeStoredValue(languagePreferenceKey, language);
}

function clearSavedGoogleTranslation() {
  const expiredCookie =
    "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

  document.cookie = expiredCookie;
  document.cookie = `${expiredCookie}; domain=${window.location.hostname}`;
  document.cookie = `${expiredCookie}; domain=.${window.location.hostname}`;
}

function saveGoogleTranslationCookie(language) {
  const cookieValue = `googtrans=/fr/${language}; path=/`;

  document.cookie = cookieValue;
  document.cookie = `${cookieValue}; domain=${window.location.hostname}`;
}

function initializeGoogleTranslate() {
  if (!window.google || !window.google.translate) {
    return;
  }

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "fr",
      includedLanguages: "en,es,fr,ht",
      autoDisplay: false
    },
    "google-translate-element"
  );

  window.setTimeout(applySelectedTranslation, 300);
}

function applySelectedTranslation() {
  const googleSelector = document.querySelector(".goog-te-combo");

  if (!googleSelector) {
    return;
  }

  googleSelector.value = requestedLanguage;
  googleSelector.dispatchEvent(new Event("change"));
}

function revealTranslatedPage() {
  document.documentElement.classList.remove("translation-pending");
}

function waitForInitialTranslation() {
  if (!document.documentElement.classList.contains("translation-pending")) {
    return;
  }

  function checkTranslation() {
    const translationIsReady =
      document.body.classList.contains("translated-ltr") ||
      document.body.classList.contains("translated-rtl");

    if (!translationIsReady) {
      return;
    }

    translationObserver.disconnect();

    window.requestAnimationFrame(function waitForTranslatedPaint() {
      window.requestAnimationFrame(revealTranslatedPage);
    });
  }

  const translationObserver = new MutationObserver(checkTranslation);

  translationObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  checkTranslation();
}

function removeGoogleHighlight() {
  const highlightedElements = document.querySelectorAll(".goog-text-highlight");

  highlightedElements.forEach(function cleanHighlightedElement(element) {
    element.classList.remove("goog-text-highlight");
    element.style.removeProperty("background");
    element.style.removeProperty("background-color");
    element.style.removeProperty("box-shadow");
  });
}

function preventGoogleHoverHighlight(event) {
  const translatedPageIsActive =
    document.body.classList.contains("translated-ltr") ||
    document.body.classList.contains("translated-rtl");

  if (!translatedPageIsActive || !event.target.closest("font")) {
    return;
  }

  event.stopImmediatePropagation();
  removeGoogleHighlight();
}

function loadGoogleTranslate() {
  const translationScript = document.createElement("script");

  translationScript.src =
    "https://translate.google.com/translate_a/element.js?cb=initializeGoogleTranslate";
  translationScript.async = true;
  translationScript.id = "google-translate-script";

  document.body.appendChild(translationScript);
}

function requestTranslation() {
  requestedLanguage = languageSelector.value;
  saveLanguagePreference(requestedLanguage);

  if (requestedLanguage === "fr") {
    clearSavedGoogleTranslation();

    if (window.google && window.google.translate) {
      applySelectedTranslation();
    }

    return;
  }

  saveGoogleTranslationCookie(requestedLanguage);

  if (window.google && window.google.translate) {
    applySelectedTranslation();
    return;
  }

  if (!document.querySelector("#google-translate-script")) {
    loadGoogleTranslate();
  }
}

function restoreLanguagePreference() {
  requestedLanguage = getPreferredLanguage();
  languageSelector.value = requestedLanguage;

  if (requestedLanguage === "fr") {
    clearSavedGoogleTranslation();
    return;
  }

  saveGoogleTranslationCookie(requestedLanguage);
  waitForInitialTranslation();
  loadGoogleTranslate();
}

window.initializeGoogleTranslate = initializeGoogleTranslate;

/* ==========================================================
   7. FORMULAIRE DE CONTACT
   Prépare l'envoi direct et la page de confirmation locale.
========================================================== */
function prepareContactSubmission() {
  if (!contactRedirect || !formStatus) {
    return;
  }

  contactRedirect.value = new URL("merci.html", window.location.href).href;
  formStatus.textContent = "Envoi sécurisé du message en cours…";
}

/* ==========================================================
   8. ANIMATIONS LÉGÈRES
   Révèle les sections au défilement et anime la lumière des
   cartes selon la position du pointeur.
========================================================== */
function initializeScrollReveals() {
  const revealSelector = [
    ".section-heading",
    ".human-intro",
    ".skill-card",
    ".project-card",
    ".timeline article",
    ".education-grid article",
    ".case-study-heading",
    ".site-browser",
    ".case-details article",
    ".detail-grid article",
    ".credential-grid article",
    ".contact-form",
    ".location-photo"
  ].join(",");
  const revealElements = document.querySelectorAll(revealSelector);
  const reducedMotionIsPreferred = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  revealElements.forEach(function prepareReveal(element, index) {
    const delay = (index % 4) * 75;

    element.classList.add("reveal-item");
    element.style.setProperty("--reveal-delay", `${delay}ms`);
  });

  if (reducedMotionIsPreferred || !("IntersectionObserver" in window)) {
    revealElements.forEach(function revealImmediately(element) {
      element.classList.add("is-visible");
    });

    return;
  }

  const revealObserver = new IntersectionObserver(
    function revealVisibleElements(entries) {
      entries.forEach(function revealEntry(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -45px 0px"
    }
  );

  revealElements.forEach(function observeReveal(element) {
    revealObserver.observe(element);
  });
}

function updateCardLight(event) {
  const card = event.currentTarget;
  const cardBounds = card.getBoundingClientRect();
  const pointerX = event.clientX - cardBounds.left;
  const pointerY = event.clientY - cardBounds.top;

  card.style.setProperty("--pointer-x", `${pointerX}px`);
  card.style.setProperty("--pointer-y", `${pointerY}px`);
}

function resetCardLight(event) {
  const card = event.currentTarget;

  card.style.setProperty("--pointer-x", "50%");
  card.style.setProperty("--pointer-y", "50%");
}

function initializeInteractiveCards() {
  const interactiveCards = document.querySelectorAll(
    ".skill-card, .project-card, .detail-grid article, " +
    ".credential-grid article, .case-study"
  );
  const precisePointerIsAvailable = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  if (!precisePointerIsAvailable) {
    return;
  }

  interactiveCards.forEach(function activateCardLight(card) {
    card.addEventListener("mousemove", updateCardLight);
    card.addEventListener("mouseleave", resetCardLight);
  });
}

/* ==========================================================
   9. ÉVÉNEMENTS ET INITIALISATION
========================================================== */
function initializeWebsite() {
  restoreProfileMode();
  modeButton.addEventListener("click", toggleProfileMode);
  menuButton.addEventListener("click", toggleMobileMenu);

  navigationLinks.forEach(function addNavigationEvent(link) {
    link.addEventListener("click", closeMobileMenu);
  });

  languageSelector.addEventListener("change", requestTranslation);
  document.addEventListener("mouseover", preventGoogleHoverHighlight, true);

  if (contactForm) {
    contactForm.addEventListener("submit", prepareContactSubmission);
  }

  restoreLanguagePreference();

  startTerminalAnimation();
  displayCurrentYear();
  initializeScrollReveals();
  initializeInteractiveCards();
}

initializeWebsite();
