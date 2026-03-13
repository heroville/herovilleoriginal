# UI improvement ideas

Recommendations from reviewing **visual capture screenshots** (01–08) and the codebase.

**Last pass:** Tutorial overhaul – Redux-driven steps, reliable Next button, game log after completion. Melvor-style layout; all unit tests pass.

---

## Tutorial system (overhaul)

- **State:** Tutorial lives in Redux (`tutorial` slice: `tutorialStepIndex`, `tutorialCompleted`, `gameLog`). No dependency on UiService or GameStateService for progression; Next button dispatches `advanceTutorial()`.
- **Steps:** Content and “show Next” are in `src/constants/tutorialSteps.js`. Same 23 steps and trigger points (e.g. buy tent at step 2, create potion at step 6) with clearer, shorter copy.
- **Progression:** GuidePanel reads from `state.tutorial`, shows current step and Next when `step.showNext`. Building/Production/GameUiService call `api.nextTutorial()` (dispatches `advanceTutorial`) when the player does the right action at the right step; they use `tutorialStepIndex` (synced from Redux to GameStateService on every store change).
- **Game log:** After tutorial completion, the panel shows “Log” and `gameLog`. `api.notifyError(msg)` dispatches `addGameLogMessage(msg)` when `tutorialCompleted`, so save/random-event messages appear there.
- **Save/load:** `tutorialStepIndex`, `tutorialCompleted`, `gameLog` are saved and restored; `REPLACE_STATE` from other services preserves tutorial state when the payload has no tutorial fields.

---

## Current UI (Melvor-style)

- **No tabs:** Navigation is a **left sidebar** (like Melvor Idle): Guide, section links (Heroes, Town, Production, Bestiary, Professions), Upgrades, Options/Help. One main content area shows the selected section.
- **Top bar:** Compact strip above the content: logo + resources + Gather + save message. No three-column header.
- **Sidebar:** Dark strip (`--hv-sidebar-bg`: slate/blue-gray), light text, active section with accent (gold) left border. Guide and Upgrades live in the sidebar; `#gameTabs` is the sidebar container for E2E.
- **Viewport:** Main area has its own background (`--hv-viewport-bg`); content panels use a game-window style (border, shadow) so it feels like a different game, not Bootstrap.
- **Aesthetic:** Sidebar = dark UI chrome; viewport = content area; panels have a clear “window” look. Dark theme flips sidebar/viewport colours via `data-bs-theme="dark"`.

Run `npm run test:visual` and diff `screenshots/` to compare before/after changes.

---

## Recently addressed (no longer in scope)

The following were in the original list and have been implemented or explicitly declined:

- **Layout/container:** User prefers full width; no container constraint.
- **Resources bar:** Moved into header center column with logo; middle-aligned; success vs error styling for save message.
- **Nav tab active state:** Only the active tab is highlighted; Options/Help no longer uses link-style blue when inactive.
- **Header:** Guide and Upgrades use the same card design; logo smaller (max-width); Next in card flow; upgrade button width constrained.
- **Tables:** Town and Production use `<thead>`/`<th>`, header background, and card wrappers; “Prod Cost (Resource)” spelled out.
- **Buttons:** Primary (Gather, Improve, Accept, Create) vs secondary (Save, Load, etc.); auto width where appropriate.
- **Modals:** CSS variables for dark theme; consistent font.
- **Footer:** Tooltips/aria-labels on social links; padding and border.
- **Typography:** Single emphasis level (no bold+underline on headers); card headers normal weight.
- **Tab content:** All tabs use `justify-content-center` so content is centered on the page; Town, Production, Options, Hero, Bestiary, Professions centered.
- **Hero HP/XP bars:** Centered label overlay with `var(--hv-text)` and text-shadow for visibility when bar is full or empty.
- **Options tab internal alignment:** Left column content (buttons, Hero Options card, Skip Tutorial) centered via `text-center`, flex wrappers, and max-width card; card body kept `text-start` for form labels.
- **Hero tab Sort/Filter:** Visible label “Sort / filter heroes:” and `aria-label` on the group; tooltip on filter input.
- **Disabled tabs:** Stronger muted style; “ (Locked)” suffix via CSS `::after` on disabled nav links.
- **Bestiary and Professions tables:** Switched to `<thead>`/`<th>`, card wrappers, same header styling as Town/Production.
- **Production narrow view:** All production tables wrapped in `table-responsive` for horizontal scroll on small viewports.
- **HP/XP label contrast:** Stronger text-shadow and explicit `text-align: center` on `.hv-progress-label`.
- **Modals:** Escape key closes the open dialog (hero, worker, version, confirm, loading).

---

## 1. **Resource and buff icon clarity** ✓ Addressed in overhaul

- **Observed:** Buff icons (e.g. green creature/leaf) can appear with no number or label; “0/0” gold could clarify “unlocked but empty” vs “not yet unlocked.” Tooltips exist for resources and gold; buff icons have titles but could be more discoverable.
- **Improvement:** Ensure all buff icons have a clear `title`; consider a short “Resources / Gold” label above or beside the row on first load. Optionally label gold capacity when 0 (e.g. “Unlock Stockpile for gold”).

---

## 2. **Hero cards** ✓ Addressed in overhaul

- **Observed (05):** Hero card still uses nested tables; Equip is terse (“(1-1) Durability: 1”); Loot/Equip can feel disconnected from HP/XP. Fixed height (250×390) can cramp content.
- **Done:** Card layout with sections (name+class, HP/XP bars, loot/equip, location, progress); flex layout and min-height; Equip shows item name and stats inline; popover kept for full details.

---

## 3. **Accessibility** ✓ Addressed in overhaul

- **Current:** Focus outline on tabs/buttons; `aria-live` on error/save message; modal uses theme variables; Escape closes modals.
- **Done:** Focus trap in modals (Tab wraps, focus on first focusable when open, restore on close); `:focus-visible` on inputs/selects and in modals; `aria-modal`, `aria-describedby`, `role="alert"` on modal errors.

---

## Summary (current backlog)

| # | Area | Status |
|---|------|--------|
| 1 | Resource/buff icons | Addressed in overhaul |
| 2 | Hero cards | Addressed in overhaul |
| 3 | Accessibility | Addressed in overhaul |

Run `npm run test:visual` before and after changes and diff the `screenshots/` folder to catch regressions.

