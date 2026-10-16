# Focale Cinéma

Calculateur de **profondeur de champ (DoF)** et de **champ de vision (FOV)** pour cinéastes et vidéastes.

**100 % navigateur** — aucun serveur, aucune clé API, aucune dépendance payante.

- **Démo** : [https://salimadour31-boop.github.io/focale-cinema/](https://salimadour31-boop.github.io/focale-cinema/)
- **Licence** : MIT

## Fonctionnalités

- Capteurs : Full Frame, APS-C, Super 35, Micro 4/3, 1 pouce, smartphone 1/1.3", crop personnalisé
- Focale, ouverture (stops courants + personnalisée), distance sujet
- Cercle de confusion auto (diagonale / 1500) ou forcé
- Résultats live : limites proche/lointaine, DoF totale, hyperfocale, FOV H/V, équivalent plein format
- Schéma SVG original (objectif → sujet → plans)
- Unités métriques / impériales
- État partageable via URL hash
- Interface **FR / EN / Tamazight (Taqbaylit)** — préférence mémorisée
- UI sombre cinématographique, responsive desktop & mobile

## Utilisation

1. Ouvre `index.html` dans un navigateur (ou la démo GitHub Pages).
2. Choisis le capteur, la focale, l’ouverture et la distance.
3. Lis les résultats et le schéma ; copie le lien pour partager ta config.

## Formules

- CoC ≈ diagonale_capteur / 1500
- Hyperfocale H = f² / (N · c) + f
- Proche = (s · H) / (H + (s − f)) ; Lointain = (s · H) / (H − (s − f))
- FOV = 2 · atan(dimension / (2 · f))

## English

Browser-only DoF & FOV calculator for filmmakers. Sensor presets, live results, SVG diagram, metric/imperial, shareable URL state, FR/EN/Tamazight UI. MIT licensed.

## Structure

```
index.html
css/style.css
js/i18n.js
js/app.js
assets/screenshot.svg
LICENSE
.gitignore
```

## GitHub Pages

Settings → Pages → Source: branch `main`, folder `/` (root).

---

© 2026 Amirouche Amwanes — MIT
