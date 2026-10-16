/**
 * focale-cinema — i18n (FR / EN / Tamazight Taqbaylit)
 * Strings only; no external deps.
 */
(function (global) {
  "use strict";

  const STRINGS = {
    fr: {
      title: "Focale Cinéma",
      subtitle: "Profondeur de champ & champ de vision",
      lang: "Langue",
      units: "Unités",
      metric: "Métrique (m)",
      imperial: "Impérial (ft)",
      sensor: "Capteur / format",
      sensor_ff: "Plein format (Full Frame)",
      sensor_apsc: "APS-C",
      sensor_s35: "Super 35",
      sensor_m43: "Micro 4/3",
      sensor_1inch: "1 pouce",
      sensor_phone: "Smartphone 1/1.3\"",
      sensor_custom: "Facteur de crop personnalisé",
      crop_factor: "Facteur de crop",
      focal: "Focale (mm)",
      aperture: "Ouverture (f)",
      aperture_custom: "Personnalisée",
      distance: "Distance sujet",
      distance_m: "m",
      distance_ft: "ft",
      coc: "Cercle de confusion (mm)",
      coc_auto: "Auto (selon capteur)",
      coc_override: "Forcer CoC",
      results: "Résultats",
      near: "Limite proche",
      far: "Limite lointaine",
      dof: "DoF totale",
      hyperfocal: "Distance hyperfocale",
      fov_h: "FOV horizontal",
      fov_v: "FOV vertical",
      ff_equiv: "Équivalent plein format",
      infinity: "∞",
      diagram: "Schéma optique",
      diagram_lens: "Objectif",
      diagram_subject: "Sujet",
      diagram_near: "Proche",
      diagram_far: "Lointain",
      share: "Lien partageable",
      share_copied: "Copié !",
      footer: "Outil libre · MIT · 100 % navigateur · aucun serveur",
      aria_lang: "Choisir la langue",
      aria_units: "Choisir les unités",
    },
    en: {
      title: "Cinema Focal",
      subtitle: "Depth of field & field of view",
      lang: "Language",
      units: "Units",
      metric: "Metric (m)",
      imperial: "Imperial (ft)",
      sensor: "Sensor / format",
      sensor_ff: "Full Frame",
      sensor_apsc: "APS-C",
      sensor_s35: "Super 35",
      sensor_m43: "Micro 4/3",
      sensor_1inch: "1-inch",
      sensor_phone: "Smartphone 1/1.3\"",
      sensor_custom: "Custom crop factor",
      crop_factor: "Crop factor",
      focal: "Focal length (mm)",
      aperture: "Aperture (f)",
      aperture_custom: "Custom",
      distance: "Subject distance",
      distance_m: "m",
      distance_ft: "ft",
      coc: "Circle of confusion (mm)",
      coc_auto: "Auto (from sensor)",
      coc_override: "Override CoC",
      results: "Results",
      near: "Near limit",
      far: "Far limit",
      dof: "Total DoF",
      hyperfocal: "Hyperfocal distance",
      fov_h: "Horizontal FOV",
      fov_v: "Vertical FOV",
      ff_equiv: "Full-frame equivalent",
      infinity: "∞",
      diagram: "Optical diagram",
      diagram_lens: "Lens",
      diagram_subject: "Subject",
      diagram_near: "Near",
      diagram_far: "Far",
      share: "Shareable link",
      share_copied: "Copied!",
      footer: "Free tool · MIT · 100% browser · no server",
      aria_lang: "Choose language",
      aria_units: "Choose units",
    },
    tzm: {
      title: "Fucal n Usineman",
      subtitle: "Tadrimt n teɣzi & agrud n tmuɣli",
      lang: "Tutlayt",
      units: "Iferdisen",
      metric: "Amitṛi (m)",
      imperial: "Aymbiryal (ft)",
      sensor: "Asensur / amasal",
      sensor_ff: "Full Frame",
      sensor_apsc: "APS-C",
      sensor_s35: "Super 35",
      sensor_m43: "Micro 4/3",
      sensor_1inch: "1-inch",
      sensor_phone: "Asawal 1/1.3\"",
      sensor_custom: "Crop udmawan",
      crop_factor: "Ameslay n crop",
      focal: "Fucal (mm)",
      aperture: "Tawuri (f)",
      aperture_custom: "Udmawan",
      distance: "Ameccaε n usentel",
      distance_m: "m",
      distance_ft: "ft",
      coc: "Tawenza n usfehem (mm)",
      coc_auto: "Awurman (s usensur)",
      coc_override: "Ḥbes CoC",
      results: "Igmaḍen",
      near: "Talast n uqrib",
      far: "Talast n ubeεed",
      dof: "DoF s umata",
      hyperfocal: "Ameccaε hyperfocal",
      fov_h: "FOV aglawan",
      fov_v: "FOV abaduran",
      ff_equiv: "Amdya n Full Frame",
      infinity: "∞",
      diagram: "Asenɣel n tẓuri",
      diagram_lens: "Aseɣẓan",
      diagram_subject: "Asentel",
      diagram_near: "Aqrib",
      diagram_far: "Abeεed",
      share: "Aseɣwen n beṭṭu",
      share_copied: "Yettwaɣ!",
      footer: "Afecku ilelli · MIT · 100% aminig · ulac aqeddac",
      aria_lang: "Fren tutlayt",
      aria_units: "Fren iferdisen",
    },
  };

  const LANG_KEY = "focale-cinema-lang";

  function getLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && STRINGS[stored]) return stored;
    return "fr";
  }

  function setLang(code) {
    if (!STRINGS[code]) return;
    localStorage.setItem(LANG_KEY, code);
  }

  function t(key) {
    const lang = getLang();
    return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.fr[key] || key;
  }

  function apply() {
    document.documentElement.lang = getLang() === "tzm" ? "kab" : getLang();
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      const key = el.getAttribute("data-i18n");
      const val = t(key);
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = val;
      } else if (el.hasAttribute("data-i18n-attr")) {
        el.setAttribute(el.getAttribute("data-i18n-attr"), val);
      } else {
        el.textContent = val;
      }
    });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(el.getAttribute("data-i18n-aria")));
    });
    const titleEl = document.querySelector("title");
    if (titleEl) titleEl.textContent = t("title") + " — " + t("subtitle");
  }

  global.FocaleI18n = { STRINGS: STRINGS, getLang: getLang, setLang: setLang, t: t, apply: apply };
})(typeof window !== "undefined" ? window : globalThis);
