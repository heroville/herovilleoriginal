# UI improvement ideas

Recommendations from reviewing **visual capture screenshots** (01–08) and the codebase. Keeps the existing visual style (Bootstrap, CSS variables, light/dark theme) but allows major overhauls of specific components or layouts.

**Last screenshot pass:** Fresh run of `npm run test:visual`; doc updated to remove addressed items and add new findings.

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

## 1. **Resource and buff icon clarity**

- **Observed:** Buff icons (e.g. green creature/leaf) can appear with no number or label; “0/0” gold could clarify “unlocked but empty” vs “not yet unlocked.” Tooltips exist for resources and gold; buff icons have titles but could be more discoverable.
- **Improvement:** Ensure all buff icons have a clear `title`; consider a short “Resources / Gold” label above or beside the row on first load. Optionally label gold capacity when 0 (e.g. “Unlock Stockpile for gold”).

---

## 2. **Hero cards**

- **Observed (05):** Hero card still uses nested tables; Equip is terse (“(1-1) Durability: 1”); Loot/Equip can feel disconnected from HP/XP. Fixed height (250×390) can cramp content.
- **Improvement:** Redesign as a single card: clear sections (avatar, name+class, HP/XP bars, loot/equip row, location, progress). Use flexbox/grid; `min-height` instead of fixed height. Expand Equip (e.g. item name) so card shows “all details” without relying only on hover. Keep progress bar colors and popover behavior.

---

## 3. **Accessibility**

- **Current:** Focus outline on tabs/buttons; `aria-live` on error/save message; modal uses theme variables; Escape closes modals.
- **Improvement:** Focus trap inside modals (keep focus on first focusable, wrap on Tab); ensure all interactive elements have visible `:focus-visible`; extend ARIA where needed (e.g. live region for toasts).

---

## Summary (current backlog)

| # | Area | Goal |
|---|------|------|
| 1 | Resource/buff icons | Tooltips/labels; clarify gold when 0 |
| 2 | Hero cards | Card layout; flex/grid; expand Equip; min-height |
| 3 | Accessibility | Focus trap in modals; focus-visible; ARIA |

Run `npm run test:visual` before and after changes and diff the `screenshots/` folder to catch regressions.
