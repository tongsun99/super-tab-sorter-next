# Project guidance

Super Tab Sorter Next is an independently maintained GPL v3 derivative of Peter White's Super Tab Sorter / Simple Tab Sorter. Preserve upstream notices and history.

- All extension runtime files live in `src/`; Manifest V3, vanilla JS modules, no build step.
- `background.js` owns sorting, group handling, per-batch newest-ID deduplication and auto-sort. Preserve behavior unless explicitly asked to change it.
- `options.html` / `options.js` are the single settings page. Keep existing sync storage keys compatible.
- `_locales/en/messages.json` and `_locales/zh_CN/messages.json` contain manifest and UI strings. `i18n.js` applies the browser default or saved language.
- The popup opens settings on the first click after install/update, then triggers sorting on subsequent clicks.
- `psl.min.js` is the original psl 1.9.0 dependency. `vendor/psl.js` contains its readable source; keep `THIRD_PARTY_NOTICES`.
- Load `src/` at `chrome://extensions` for manual testing. Reload the extension after edits.
- Run `node --test tests/*.test.mjs` for regression checks. `tests/ui.cjs` uses Playwright and a mock Chrome storage API; it does not test native tab movement. See `docs/RELEASING.md`.
- `./package_for_web_store.sh` builds store and corresponding-source ZIPs in `dist/`. Version comes only from `src/manifest.json`; LICENSE/NOTICE copies in `src/` are synchronized during packaging.
- `scripts/icons.py` regenerates original Next icons with Pillow; no icon-generation dependency is required at runtime or for packaging.
- Do not claim that sub-minute timers run reliably during service worker suspension. Intervals >=60 seconds round up to whole minutes.
- Public distribution requires the exact corresponding source and a hosted privacy policy. No analytics, ads, remote code, or uninstall feedback endpoint.
