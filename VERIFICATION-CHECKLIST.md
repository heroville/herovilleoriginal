# Manual verification checklist (maincontroller split)

Use after each phase of the maincontroller split. Run `npm run dev`, open the app, then tick off as you go.

- [ ] **Resources** – Click to gain resources; cap is respected
- [ ] **Buildings** – Buy first building (Tent); cost deducted, count increases
- [ ] **Save** – Save game; see “Game has saved” (or equivalent)
- [ ] **Reload** – Refresh page; game loads or shows load prompt
- [ ] **Load** – Load save; state matches (resources, gold, buildings, heroes)
- [ ] **Heroes** – Add a hero; appears in list; can assign job/class
- [ ] **Dungeon** – Send hero to dungeon; journey starts; no console errors
- [ ] **Battle** – Complete a battle; win/loss and loot applied
- [ ] **Production** – Create potion / buy weapon / buy upgrade; costs and counts correct
- [ ] **Theme** – Change theme (if applicable); no errors
- [ ] **Tutorial** – Skip or step through tutorial; panels advance; no errors

**Tests:** `npm run test` must pass after every phase. **E2E:** Run `npm run test:e2e` (after `npx playwright install` once) to run browser smoke tests.

See **MAINCONTROLLER-SPLIT.md** for full phase order and per-phase verification.
