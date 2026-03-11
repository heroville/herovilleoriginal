# Angular → React Migration Report

**Date:** 2025-03-06  
**Purpose:** Identify remaining migration artifacts and incomplete work before committing the React migration.

---

## Summary

The app is **functionally migrated**: the UI is React (Vite + Redux), entry is `src/main.js` → `bootstrap.js` → `bootstrapReact.js`, and there are no Angular runtime dependencies in `package.json`. The following items are **cleanup and documentation** only; they do not block the migration from a runtime perspective.

---

## 1. Orphaned Angular partials (remove or archive)

These HTML files are **not referenced** by the React app. Equivalent UI lives in React components.

| File | Notes |
|------|--------|
| `public/partials/showBattle.html` | Uses `ng-hide`, `ng-repeat`, `ng-show`, `uib-progressbar`. Battle popover is implemented in `HeroTab.jsx`. |
| `public/partials/showEquip.html` | Uses `ng-src`, `ng-repeat`. Equip popover is implemented in `HeroTab.jsx`. |
| `public/partials/dialogs.html` | Plain HTML for jQuery UI dialogs (New Hero, New Worker, Version, Confirm, Loading). Dialogs are implemented in `AppDialogs.jsx`. |

**Recommendation:** Delete these three files. If you want to keep them for reference, move to a folder like `docs/legacy-partials/` and add a short README.

---

## 2. Broken documentation references (MODERNIZATION.md)

**MODERNIZATION.md** has been removed (per git status), but it is still referenced in:

- `.cursor/rules/heroville-migration.mdc` — “See MODERNIZATION.md for architecture and state contract.”
- `.cursor/rules/heroville-game-architecture.mdc` — “See MODERNIZATION.md for the full state contract.”
- `.cursor/rules/project-structure-and-tests.mdc` — “per MODERNIZATION.md setup step” and “see MODERNIZATION.md.”

**Recommendation:** Either restore MODERNIZATION.md (e.g. from git history) or update these three rule files to remove or replace the MODERNIZATION.md references (e.g. point to this report or to inline descriptions in the rules).

---

## 3. Stale comments in E2E tests

**File:** `e2e/smoke.spec.js`

- **Lines 70–71:**  
  `// Disabled-tab visual/class behavior is not asserted here (ng-class/scope quirk with uib-tab).`  
  `// Revisit when tabs are migrated to React.`

Tabs are now implemented in React, so the “Revisit when tabs are migrated to React” note is outdated.

**Recommendation:** Remove or reword these comments (e.g. “Tab behavior is React-driven; disabled state not asserted here” or delete if no longer relevant).

---

## 4. Stale .npmrc comment

**File:** `.npmrc`

- Content: `# Required for angulartics-google-analytics peer resolution with angulartics 1.x` and `legacy-peer-deps=true`.

`package.json` no longer depends on Angular or angulartics. The comment is misleading.

**Recommendation:** Update the comment to reflect current use (e.g. “Allow legacy peer deps for [actual reason]”) or remove the comment if `legacy-peer-deps=true` is still needed for other packages.

---

## 5. Cursor rules: post-migration cleanup (optional)

**File:** `.cursor/rules/rules-maintenance.mdc`

- Refers to “When the project is entirely React” and suggests removing or softening Angular/legacy references in other rules.

**Recommendation:** Treat the project as fully React for rules. In `heroville-game-architecture.mdc` and any other rule that still mentions “Current (AngularJS)” or “Target (React + Redux)”, drop or archive the Angular parts and keep only the React/Redux description.

---

## 6. Constants vs models (future improvement)

Game config lives in two places: **`src/constants/gameConfig.data.js`** (buildings, blueprints, weapons, potions, events, heroClasses, etc.) and **`public/models/`** JSON files (e.g. `heroName.json`, `dungeons.json`, `monsterList.json`) loaded at runtime. This split is not a migration bug—it works—but unifying config (e.g. moving JSON into constants or loading all from one source) could be a future cleanup.

**Recommendation:** Leave as-is for now; treat as an optional later improvement.

---

## 7. Intentional / non-issues (no change needed)

- **`appContext` in `bootstrap.js`:** A small context object (getState, notifyError, setDialogState, nextTutorial, skipTut, changeTheme, forceReset) passed to services that need state + UI callbacks. Replaces the previous scope-like bridge; dark theme is in the Redux UI slice.
- **`src/services/saveLoad.service.js` — “legacy: optional clear”:** Comment describes behavior (version mismatch / optional clear); no Angular reference.
- **`src/components/AppDialogs.jsx` — “Old Version”:** User-facing title for the “loading from old save” dialog, not a migration TODO.
- **Analytics:** `src/analytics.js` uses plain Google Analytics (`window.ga`); no Angular/angulartics.
- **index.html:** Loads only `/src/main.js` (no Angular scripts). Styles under `./styles/` (e.g. jQuery UI, Bootstrap) are still used by the app and can stay unless you refactor CSS.
- **`.vs` / `.vscode`:** Updated so the project runs via `npm run dev`; old launch configs (hero.localtest.me, attach) and VS workspace references to Controllers/maincontroller have been removed or simplified. Empty folders `src/controllers`, `src/lib`, and `src/vendor` have been removed.

---

## Checklist before considering migration “complete”

- [ ] Remove or relocate `public/partials/showBattle.html`, `showEquip.html`, and `dialogs.html`.
- [ ] Fix or remove MODERNIZATION.md references in `.cursor/rules/heroville-migration.mdc`, `heroville-game-architecture.mdc`, and `project-structure-and-tests.mdc`.
- [ ] Update or remove the stale E2E comments in `e2e/smoke.spec.js` (lines 70–71).
- [ ] Update `.npmrc` comment (and keep or drop `legacy-peer-deps` as appropriate).
- [ ] (Optional) Simplify Cursor rules per `rules-maintenance.mdc` now that the app is fully React.

---

## Conclusion

The migration is **complete from a runtime and architecture perspective**: the application runs on React and Redux with no Angular runtime. The items above are cleanup (dead partials, outdated docs/comments, and rule references). Addressing them will make the repo consistent and avoid confusion; none of them block committing the migration.
