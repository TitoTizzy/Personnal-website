"use strict";

/* ==========================================================
   PRÉPARATION DE LA LANGUE AVANT LE PREMIER AFFICHAGE
   Ce fichier est chargé dans le <head>. Il empêche le contenu
   anglais d'apparaître avant l'application d'une traduction.
========================================================== */
(function prepareInitialLanguage() {
  const supportedLanguages = ["en", "es", "fr", "ht"];
  let savedLanguage = null;
  let initialLanguage = "fr";

  try {
    savedLanguage = localStorage.getItem("portfolio-language");
  } catch (error) {
    savedLanguage = null;
  }

  if (supportedLanguages.includes(savedLanguage)) {
    initialLanguage = savedLanguage;
  }

  document.documentElement.lang = initialLanguage;
  document.documentElement.dataset.initialLanguage = initialLanguage;

  if (initialLanguage === "fr") {
    return;
  }

  document.documentElement.classList.add("translation-pending");
  document.cookie = `googtrans=/fr/${initialLanguage}; path=/`;

  window.setTimeout(function preventPermanentHiddenPage() {
    document.documentElement.classList.remove("translation-pending");
  }, 5000);
})();
