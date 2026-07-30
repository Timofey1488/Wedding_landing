# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A single-page static wedding invitation site (Russian language) for Алина & Тимофей. Plain HTML/CSS/JS — no build system, no dependencies, no package.json, no tests. To view it, open `index.html` in a browser or serve the directory (e.g. `python3 -m http.server`).

## Architecture

The core design principle: **all content lives in `js/config.js`, all rendering lives in `js/script.js`**. Content edits (names, date, venue, program, contacts, dress-code palette, gallery photos, RSVP/app links) should be made in the `WEDDING` config object — not in the HTML.

- `index.html` — static section skeleton (hero, invite/countdown, program, place, dresscode, gifts, rsvp, ours app, contacts). Several containers are intentionally empty (`#timeline`, `#palette`, `#galleryTrack`, `#contactsList`) and are populated at runtime from config.
- `js/config.js` — the `WEDDING` object (global, loaded before script.js). Comments in it are user-facing editing instructions; keep them.
- `js/script.js` — reads `WEDDING` on DOMContentLoaded: fills text/links by element id, renders the timeline/palette/gallery/contacts via `innerHTML` templates, plus UI behaviors (countdown with Russian pluralization, IntersectionObserver reveal animations, falling petals, gallery lightbox, hero parallax, mobile burger nav).
- `css/style.css` — single stylesheet. The `:root` palette variables are derived from the dress-code colors; the accent system (backgrounds, buttons, headings) is documented in a comment at the top of the file.
- `images/` — couple photo, venue gallery photos (`venue-*.jpg`), section backgrounds. Gallery photos are referenced from `config.js`, not hardcoded in HTML.

## Conventions

- All copy, code comments, and commit context are in Russian; keep new UI text and comments in Russian.
- CSS uses BEM-style class naming (`block__element--modifier`).
- Optional config fields (e.g. `oursApp.googlePlay`, contact `telegram`/`phone`, program item `text`) are handled by hiding/omitting the element when empty — preserve that pattern when adding config-driven features.
- Google Fonts are loaded from CDN (Cormorant, Montserrat, and Marck Script subset only for the "&" glyph).
