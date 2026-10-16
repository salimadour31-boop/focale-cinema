/**
 * focale-cinema — Depth of Field & Field of View calculator
 * All math in millimetres internally. Original implementation.
 */
(function () {
  "use strict";

  /* ---------- Sensor presets (width × height mm, crop vs FF 36×24) ---------- */
  const SENSORS = {
    ff: { w: 36, h: 24, labelKey: "sensor_ff" },
    apsc: { w: 23.6, h: 15.6, labelKey: "sensor_apsc" }, // common APS-C
    s35: { w: 24.89, h: 18.66, labelKey: "sensor_s35" }, // Super 35 approx
    m43: { w: 17.3, h: 13.0, labelKey: "sensor_m43" },
    inch1: { w: 13.2, h: 8.8, labelKey: "sensor_1inch" },
    phone: { w: 9.6, h: 7.2, labelKey: "sensor_phone" }, // ~1/1.3"
    custom: { w: null, h: null, labelKey: "sensor_custom" },
  };

  const FF_DIAG = Math.sqrt(36 * 36 + 24 * 24); // ≈ 43.27 mm
  const COMMON_APERTURES = [1.2, 1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22];

  /** Circle of confusion: diagonal / 1500 (Zeiss formula variant) */
  function cocFromDims(w, h) {
    const diag = Math.sqrt(w * w + h * h);
    return diag / 1500;
  }

  function cropFactor(w, h) {
    const diag = Math.sqrt(w * w + h * h);
    return FF_DIAG / diag;
  }

  /**
   * Classic DoF formulas (f, c, s in mm; N dimensionless).
   * H = f²/(N·c) + f
   * Near = (s·H) / (H + (s − f))
   * Far  = (s·H) / (H − (s − f))  when H > (s − f), else ∞
   */
  function computeDoF(fMm, N, cMm, sMm) {
    if (fMm <= 0 || N <= 0 || cMm <= 0 || sMm <= fMm) {
      return { H: NaN, near: NaN, far: NaN, dof: NaN, infinite: false };
    }
    const H = (fMm * fMm) / (N * cMm) + fMm;
    const denomNear = H + (sMm - fMm);
    const denomFar = H - (sMm - fMm);
    const near = (sMm * H) / denomNear;
    let far, infinite;
    if (denomFar <= 0) {
      far = Infinity;
      infinite = true;
    } else {
      far = (sMm * H) / denomFar;
      infinite = false;
    }
    const dof = infinite ? Infinity : far - near;
    return { H: H, near: near, far: far, dof: dof, infinite: infinite };
  }

  /** FOV in degrees: 2·atan(sensor_dim / (2·f)) */
  function fovDeg(sensorDimMm, fMm) {
    if (fMm <= 0 || sensorDimMm <= 0) return NaN;
    return (2 * Math.atan(sensorDimMm / (2 * fMm)) * 180) / Math.PI;
  }

  function mmToDisplay(mm, units) {
    if (!isFinite(mm)) return null;
    if (units === "imperial") return mm / 304.8; // feet
    return mm / 1000; // metres
  }

  function displayToMm(val, units) {
    if (units === "imperial") return val * 304.8;
    return val * 1000;
  }

  function formatDist(mm, units, t) {
    if (!isFinite(mm)) return t("infinity");
    const v = mmToDisplay(mm, units);
    if (v === null) return "—";
    const unit = units === "imperial" ? "ft" : "m";
    if (v >= 100) return v.toFixed(0) + " " + unit;
    if (v >= 10) return v.toFixed(1) + " " + unit;
    if (v >= 1) return v.toFixed(2) + " " + unit;
    return v.toFixed(3) + " " + unit;
  }

  function formatDeg(d) {
    if (!isFinite(d)) return "—";
    return d.toFixed(1) + "°";
  }

  /* ---------- State ---------- */
  const state = {
    sensor: "ff",
    crop: 1,
    focal: 50,
    aperture: 1.8,
    apertureCustom: false,
    distance: 2, // display units (m or ft)
    units: "metric",
    cocOverride: false,
    coc: 0.029,
  };

  function getSensorDims() {
    if (state.sensor === "custom") {
      const crop = state.crop > 0 ? state.crop : 1;
      // Scale FF by crop
      return { w: 36 / crop, h: 24 / crop };
    }
    const s = SENSORS[state.sensor];
    return { w: s.w, h: s.h };
  }

  function getCoC() {
    if (state.cocOverride) return state.coc;
    const d = getSensorDims();
    return cocFromDims(d.w, d.h);
  }

  function recalculate() {
    const d = getSensorDims();
    const c = getCoC();
    const sMm = displayToMm(state.distance, state.units);
    const dof = computeDoF(state.focal, state.aperture, c, sMm);
    const fovH = fovDeg(d.w, state.focal);
    const fovV = fovDeg(d.h, state.focal);
    const crop = cropFactor(d.w, d.h);
    const ffEquiv = state.focal * crop;

    return {
      near: dof.near,
      far: dof.far,
      dof: dof.dof,
      H: dof.H,
      infinite: dof.infinite,
      fovH: fovH,
      fovV: fovV,
      ffEquiv: ffEquiv,
      coc: c,
      crop: crop,
      sMm: sMm,
    };
  }

  /* ---------- DOM helpers ---------- */
  function $(id) {
    return document.getElementById(id);
  }

  function updateResults() {
    const t = window.FocaleI18n.t;
    const r = recalculate();
    const u = state.units;

    $("res-near").textContent = formatDist(r.near, u, t);
    $("res-far").textContent = formatDist(r.far, u, t);
    $("res-dof").textContent = formatDist(r.dof, u, t);
    $("res-hyper").textContent = formatDist(r.H, u, t);
    $("res-fovh").textContent = formatDeg(r.fovH);
    $("res-fovv").textContent = formatDeg(r.fovV);
    $("res-ff").textContent = r.ffEquiv.toFixed(1) + " mm";
    $("res-coc").textContent = r.coc.toFixed(4) + " mm";

    if (!$("coc-override").checked) {
      $("coc-input").value = r.coc.toFixed(4);
    }

    updateDiagram(r);
    syncUrl();
  }

  function updateDiagram(r) {
    const svg = $("dof-diagram");
    if (!svg) return;
    const W = 400;
    const H = 160;
    const marginL = 40;
    const marginR = 20;
    const usable = W - marginL - marginR;

    // Map distances relative to subject for visual layout
    const s = r.sMm;
    const near = r.near;
    const far = isFinite(r.far) ? r.far : s * 3;
    const maxD = Math.max(far, s * 1.2, near * 1.1);
    const minD = 0;

    function xOf(mm) {
      return marginL + ((mm - minD) / (maxD - minD)) * usable;
    }

    const xLens = marginL;
    const xNear = xOf(near);
    const xSubj = xOf(s);
    const xFar = xOf(Math.min(far, maxD));

    const midY = H / 2;
    const coneHalfNear = 28;
    const coneHalfFar = 42;

    // Optical axis
    const axis = svg.querySelector(".axis");
    axis.setAttribute("x1", xLens);
    axis.setAttribute("y1", midY);
    axis.setAttribute("x2", W - marginR);
    axis.setAttribute("y2", midY);

    // Lens body (simple rectangle + circle)
    const lens = svg.querySelector(".lens-body");
    lens.setAttribute("x", xLens - 10);
    lens.setAttribute("y", midY - 22);
    lens.setAttribute("width", 20);
    lens.setAttribute("height", 44);

    const lensGlass = svg.querySelector(".lens-glass");
    lensGlass.setAttribute("cx", xLens);
    lensGlass.setAttribute("cy", midY);
    lensGlass.setAttribute("r", 14);

    // DoF zone rectangle
    const zone = svg.querySelector(".dof-zone");
    zone.setAttribute("x", xNear);
    zone.setAttribute("y", midY - coneHalfFar);
    zone.setAttribute("width", Math.max(2, xFar - xNear));
    zone.setAttribute("height", coneHalfFar * 2);

    // Near / far / subject markers
    function setMarker(cls, x, labelKey) {
      const line = svg.querySelector("." + cls + "-line");
      const label = svg.querySelector("." + cls + "-label");
      line.setAttribute("x1", x);
      line.setAttribute("y1", midY - coneHalfFar - 4);
      line.setAttribute("x2", x);
      line.setAttribute("y2", midY + coneHalfFar + 4);
      label.setAttribute("x", x);
      label.setAttribute("y", midY + coneHalfFar + 18);
      label.textContent = window.FocaleI18n.t(labelKey);
    }
    setMarker("near", xNear, "diagram_near");
    setMarker("subj", xSubj, "diagram_subject");
    setMarker("far", xFar, "diagram_far");

    // Cone lines (simplified FOV wedge)
    const coneTop = svg.querySelector(".cone-top");
    const coneBot = svg.querySelector(".cone-bot");
    coneTop.setAttribute("d", "M " + xLens + " " + midY + " L " + xFar + " " + (midY - coneHalfFar));
    coneBot.setAttribute("d", "M " + xLens + " " + midY + " L " + xFar + " " + (midY + coneHalfFar));

    const lensLabel = svg.querySelector(".lens-label");
    lensLabel.setAttribute("x", xLens);
    lensLabel.setAttribute("y", midY - 30);
    lensLabel.textContent = window.FocaleI18n.t("diagram_lens");
  }

  /* ---------- URL state ---------- */
  function syncUrl() {
    const p = new URLSearchParams();
    p.set("s", state.sensor);
    if (state.sensor === "custom") p.set("crop", String(state.crop));
    p.set("f", String(state.focal));
    p.set("n", String(state.aperture));
    p.set("d", String(state.distance));
    p.set("u", state.units);
    if (state.cocOverride) p.set("c", String(state.coc));
    const lang = window.FocaleI18n.getLang();
    if (lang !== "fr") p.set("lang", lang);
    const hash = "#" + p.toString();
    if (location.hash !== hash) {
      history.replaceState(null, "", location.pathname + location.search + hash);
    }
  }

  function loadFromUrl() {
    const raw = location.hash.replace(/^#/, "");
    if (!raw) return;
    const p = new URLSearchParams(raw);
    if (p.get("s") && SENSORS[p.get("s")]) state.sensor = p.get("s");
    if (p.get("crop")) state.crop = parseFloat(p.get("crop")) || 1;
    if (p.get("f")) state.focal = parseFloat(p.get("f")) || 50;
    if (p.get("n")) state.aperture = parseFloat(p.get("n")) || 1.8;
    if (p.get("d")) state.distance = parseFloat(p.get("d")) || 2;
    if (p.get("u") === "imperial" || p.get("u") === "metric") state.units = p.get("u");
    if (p.get("c")) {
      state.cocOverride = true;
      state.coc = parseFloat(p.get("c")) || state.coc;
    }
    if (p.get("lang") && window.FocaleI18n.STRINGS[p.get("lang")]) {
      window.FocaleI18n.setLang(p.get("lang"));
    }
  }

  /* ---------- Bind UI ---------- */
  function bind() {
    const t = window.FocaleI18n.t;

    // Language
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.FocaleI18n.setLang(btn.getAttribute("data-set-lang"));
        window.FocaleI18n.apply();
        syncControlsFromState();
        updateResults();
        highlightLang();
      });
    });

    // Units
    $("units-metric").addEventListener("change", function () {
      if (this.checked) {
        // convert current distance to metric
        if (state.units === "imperial") {
          state.distance = (state.distance * 304.8) / 1000;
        }
        state.units = "metric";
        syncControlsFromState();
        updateResults();
      }
    });
    $("units-imperial").addEventListener("change", function () {
      if (this.checked) {
        if (state.units === "metric") {
          state.distance = (state.distance * 1000) / 304.8;
        }
        state.units = "imperial";
        syncControlsFromState();
        updateResults();
      }
    });

    $("sensor").addEventListener("change", function () {
      state.sensor = this.value;
      $("crop-wrap").hidden = state.sensor !== "custom";
      updateResults();
    });

    $("crop").addEventListener("input", function () {
      state.crop = parseFloat(this.value) || 1;
      updateResults();
    });

    function setFocal(v) {
      v = Math.max(8, Math.min(800, v));
      state.focal = v;
      $("focal").value = v;
      $("focal-num").value = v;
      updateResults();
    }
    $("focal").addEventListener("input", function () {
      setFocal(parseFloat(this.value));
    });
    $("focal-num").addEventListener("change", function () {
      setFocal(parseFloat(this.value));
    });

    $("aperture-select").addEventListener("change", function () {
      if (this.value === "custom") {
        state.apertureCustom = true;
        $("aperture-custom-wrap").hidden = false;
        state.aperture = parseFloat($("aperture-custom").value) || 2.8;
      } else {
        state.apertureCustom = false;
        $("aperture-custom-wrap").hidden = true;
        state.aperture = parseFloat(this.value);
      }
      updateResults();
    });
    $("aperture-custom").addEventListener("input", function () {
      state.aperture = parseFloat(this.value) || 2.8;
      updateResults();
    });

    $("distance").addEventListener("input", function () {
      state.distance = parseFloat(this.value) || 1;
      $("distance-num").value = state.distance;
      updateResults();
    });
    $("distance-num").addEventListener("change", function () {
      state.distance = parseFloat(this.value) || 1;
      $("distance").value = Math.min(parseFloat($("distance").max), Math.max(0.1, state.distance));
      updateResults();
    });

    $("coc-override").addEventListener("change", function () {
      state.cocOverride = this.checked;
      $("coc-input").disabled = !this.checked;
      updateResults();
    });
    $("coc-input").addEventListener("input", function () {
      state.coc = parseFloat(this.value) || 0.029;
      updateResults();
    });

    $("btn-share").addEventListener("click", function () {
      syncUrl();
      const url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          $("share-status").textContent = t("share_copied");
          setTimeout(function () {
            $("share-status").textContent = "";
          }, 2000);
        });
      } else {
        $("share-status").textContent = url;
      }
    });
  }

  function syncControlsFromState() {
    $("sensor").value = state.sensor;
    $("crop-wrap").hidden = state.sensor !== "custom";
    $("crop").value = state.crop;
    $("focal").value = state.focal;
    $("focal-num").value = state.focal;

    const aptSel = $("aperture-select");
    const match = COMMON_APERTURES.find(function (a) {
      return Math.abs(a - state.aperture) < 0.001;
    });
    if (match !== undefined && !state.apertureCustom) {
      aptSel.value = String(match);
      $("aperture-custom-wrap").hidden = true;
    } else {
      aptSel.value = "custom";
      state.apertureCustom = true;
      $("aperture-custom-wrap").hidden = false;
      $("aperture-custom").value = state.aperture;
    }

    // Distance slider range depends on units
    const dist = $("distance");
    if (state.units === "imperial") {
      dist.min = 0.5;
      dist.max = 100;
      dist.step = 0.5;
    } else {
      dist.min = 0.1;
      dist.max = 50;
      dist.step = 0.1;
    }
    dist.value = state.distance;
    $("distance-num").value = state.distance;
    $("dist-unit-label").textContent =
      state.units === "imperial" ? window.FocaleI18n.t("distance_ft") : window.FocaleI18n.t("distance_m");

    $("units-metric").checked = state.units === "metric";
    $("units-imperial").checked = state.units === "imperial";

    $("coc-override").checked = state.cocOverride;
    $("coc-input").disabled = !state.cocOverride;
    $("coc-input").value = state.coc.toFixed(4);

    highlightLang();
  }

  function highlightLang() {
    const lang = window.FocaleI18n.getLang();
    document.querySelectorAll("[data-set-lang]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-set-lang") === lang);
      btn.setAttribute("aria-pressed", btn.getAttribute("data-set-lang") === lang ? "true" : "false");
    });
  }

  /* ---------- Init ---------- */
  function init() {
    loadFromUrl();
    window.FocaleI18n.apply();
    bind();
    syncControlsFromState();
    updateResults();
  }

  // Expose for node unit tests
  window.FocaleCalc = {
    computeDoF: computeDoF,
    fovDeg: fovDeg,
    cocFromDims: cocFromDims,
    cropFactor: cropFactor,
    SENSORS: SENSORS,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
