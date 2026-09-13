# Feature Specification: UI/UX Redesign

**Feature Branch**: `001-ui-ux-redesign`

**Created**: 2026-09-13

**Status**: Draft

**Input**: User description: "Redesign the UI/UX of this existing React application using the Fintrack Personal Finance Dashboard (Dribbble) as visual inspiration, without changing business functionality; deliver coherent desktop and intentional mobile/PWA experiences with a shared design system and accessibility."

**Inspiration reference**: [Fintrack — Personal Finance Dashboard (Dribbble)](https://dribbble.com/shots/27554203-Fintrack-Personal-Finance-Dashboard) — visual direction and UX quality only; do not reproduce pixel-for-pixel or copy proprietary assets.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Coherent visual system across the app (Priority: P1)

As a signed-in vehicle owner, I experience one consistent visual language (color, type, spacing, cards, controls, feedback states) on every screen so the product feels intentional and premium rather than a collection of differently styled pages.

**Why this priority**: Without a shared system, screen-by-screen restyles will diverge and fail the core objective.

**Independent Test**: Review Login plus any two authenticated screens side by side; tokens, controls, and elevation patterns match; light and dark themes both remain usable.

**Acceptance Scenarios**:

1. **Given** the redesigned app, **When** I visit Login, Records, Vehicles, and Settings, **Then** shared surfaces, typography hierarchy, buttons, inputs, and status feedback follow one visual system.
2. **Given** light and dark (or system) theme preferences, **When** I toggle theme, **Then** every redesigned screen remains legible and on-brand without broken contrast or leftover one-off styles.
3. **Given** loading, empty, and error conditions on a list screen, **When** those states appear, **Then** they use the shared feedback patterns (not ad-hoc text-only placeholders).

---

### User Story 2 - Desktop shell and dense, scannable Records (Priority: P1)

As a user on a large screen, I get a persistent, efficient navigation shell and a Records experience that surfaces totals, filters, and the fuel history with finance-dashboard clarity—without changing how records are created, edited, filtered, paginated, or deleted.

**Why this priority**: Records is the primary daily workflow and the closest analogue to a finance “transactions + summary” dashboard.

**Independent Test**: On desktop width, complete view → filter → add → edit → delete on Records using existing behaviors; layout uses multi-column/summary + table density appropriate to wide viewports.

**Acceptance Scenarios**:

1. **Given** I am authenticated on a desktop-sized viewport, **When** I use the app, **Then** primary navigation remains persistently available and I can reach Records, Analytics views, Vehicles, Categories, Service Records, Settings, and Profile without hunting.
2. **Given** I am on Records with existing data, **When** the page loads, **Then** I can scan period summaries including at least total cost and total volume, plus any additional client-derived KPIs from the same filtered set, along with date range and the record list with clear hierarchy inspired by personal-finance dashboards.
3. **Given** existing filter, pagination, edit, and delete behaviors, **When** I perform those actions, **Then** outcomes match today’s product behavior (same data, same validations, same persistence) even though presentation has changed.
4. **Given** the add-fuel action on Records, **When** I create a record, **Then** the same fields, defaults from Settings, and save/refresh behavior still work.

---

### User Story 3 - Intentional mobile / PWA experience (Priority: P1)

As a user on a phone (browser or installed PWA), I get a touch-first layout: reachable primary navigation, comfortable targets, stacked content, and mobile-friendly lists/charts—not a shrunk desktop UI—and system safe areas never cover controls.

**Why this priority**: The product is a PWA used on phones; the request explicitly requires a distinct mobile experience.

**Independent Test**: On a narrow viewport / device, complete sign-in → browse Records → open filters → add a record; navigation and FABs clear the status bar and home indicator; primary destinations are reachable with one thumb-friendly pattern.

**Acceptance Scenarios**:

1. **Given** a mobile viewport, **When** I navigate primary destinations, **Then** I can use the bottom destination bar for Records, Analytics, Vehicles, Categories, and Settings, and I can still open the header drawer for remaining destinations, with touch targets that are easy to hit.
2. **Given** Records on mobile, **When** I review history, **Then** I see a stacked card (or equivalent) presentation prioritizing date, amount, vehicle, and fuel type over dense multi-column tables.
3. **Given** filters and forms on mobile, **When** I open them, **Then** they use mobile-friendly overlays (full-width dialog / sheet-like presentation) that are scrollable and dismissible without trapping the user.
4. **Given** a notched device or installed PWA where content can draw edge-to-edge, **When** I use header, navigation, and primary actions, **Then** interactive controls sit within safe areas.

---

### User Story 4 - Fleet, categories, settings, and profile restyle (Priority: P2)

As a user managing vehicles and preferences, I see Vehicles, Categories, Settings, and Profile restyled to the same system, with unchanged CRUD and preference-save behavior.

**Why this priority**: Secondary but frequent setup flows; must match the redesign for coherence.

**Independent Test**: Create/edit/delete a vehicle and category; change Settings defaults; open Profile—behavior unchanged, visuals aligned.

**Acceptance Scenarios**:

1. **Given** Vehicles or Categories, **When** I add, edit, or delete, **Then** success/error and list refresh behave as today; only presentation changes.
2. **Given** Settings, **When** I change default vehicle, fuel type, or payment type, **Then** values still save immediately (with revert on failure) as today.
3. **Given** Profile, **When** I view it, **Then** the same identity fields from the signed-in user are shown with improved layout hierarchy.

---

### User Story 5 - Analytics presentation upgrade (Priority: P2)

As a user reviewing spend insights, I see Vehicle Category, Fuel Price, and Fuel Type analytics with clearer chart presentation and page chrome, using the same underlying data windows and series the product already shows.

**Why this priority**: Charts are central to a “finance dashboard” feel but are secondary to logging fuel.

**Independent Test**: Open each analytics view; charts render with redesigned framing; data still reflects the existing six-month analytics behavior.

**Acceptance Scenarios**:

1. **Given** each existing analytics view, **When** I open it, **Then** charts remain readable on desktop and mobile (legends, labels, or accessible summaries are not lost).
2. **Given** the analytics hub stub, **When** I land on it, **Then** I get a clear redesigned guide to available views rather than a barren placeholder.
3. **Given** existing analytics date/series behavior, **When** I compare before/after redesign, **Then** no new analytics metrics or API-driven filters were required for the redesign to succeed.

---

### User Story 6 - Auth and install surfaces (Priority: P3)

As a signed-out user (or a user eligible to install the PWA), I see Login and the install prompt styled to the new system without changing Google sign-in or install/dismiss behavior.

**Why this priority**: First impression matters, but volume of use is lower than authenticated flows.

**Independent Test**: Sign in with Google; dismiss or accept install prompt; flows succeed as today with updated visuals.

**Acceptance Scenarios**:

1. **Given** I am signed out, **When** I open Login, **Then** I can complete Google sign-in as today and land in the authenticated app.
2. **Given** the install prompt conditions are met, **When** it appears, **Then** I can install or dismiss with the same persistence rules as today.

---

### Edge Cases

- Very long vehicle names, category names, or amounts: text truncates or wraps without breaking card/table layout.
- Empty fleets (no vehicles/categories) and empty fuel history: redesigned empty states explain next action without implying broken APIs.
- Large fuel history within the selected range: list remains usable (existing client pagination still available); layout does not become unusable on mobile.
- Theme set to system while OS theme changes: surfaces update without unstyled flashes of the wrong theme on redesigned chrome.
- Offline / failed API responses: error presentation is visible and non-destructive; user can retry via existing refresh patterns.
- Stub Service Records route: redesign does not pretend full CRUD exists; empty/coming-soon treatment is honest.
- Reduced motion preference: decorative motion is minimized; essential feedback remains.
- Keyboard-only use on desktop: focus order through nav, filters, tables/actions, and dialogs remains operable; focus is visible.

## Requirements *(mandatory)*

### Functional Requirements

#### Scope & non-goals

- **FR-001**: The redesign MUST be limited to presentation, layout, navigation chrome, interaction affordances, and design-system consistency. It MUST NOT change APIs, API contracts, authentication/authorization behavior, calculations, data models, or business rules.
- **FR-002**: Existing user workflows MUST remain available: sign in; view/filter/paginate fuel records; create/edit/delete fuel records; manage vehicles and categories; change Settings defaults; view Profile; open existing analytics views; log out; respond to the PWA install prompt.
- **FR-003**: The redesign MUST NOT implement missing backend-backed features (for example full Service Records CRUD) solely to fill visual gaps. Genuine functional gaps MUST be called out as gaps, not silently invented.

#### Visual system

- **FR-004**: The product MUST define and apply a coherent design system covering color tokens, typography, spacing, radius, elevation/shadows, iconography usage, buttons, inputs, cards, navigation, tabs/segmented controls (where used), badges/chips, tables, chart framing, modals/dialogs, loading, empty, and error states.
- **FR-005**: The visual direction MUST be a fuller overhaul inspired by the Fintrack personal-finance dashboard reference (soft premium surfaces, clear KPI hierarchy, calm mint/teal finance accents, scannable lists, generous but disciplined spacing) without copying proprietary artwork, illustration, or pixel layout.
- **FR-005a**: Design tokens MUST evolve the accent system from the current blue-forward refresh to a mint/teal finance accent family suitable for both light and dark appearances; neutrals, elevation, and typography MUST be retuned to match that premium finance aesthetic.
- **FR-006**: The redesign MUST prefer evolving the existing shared component set and styling approach rather than introducing a second parallel UI kit.
- **FR-007**: Light and dark appearances MUST both be first-class; theme switching behavior users already have MUST keep working.

#### Responsive experiences

- **FR-008**: Desktop experiences MUST use available width for persistent navigation (where appropriate), summary/KPI regions, multi-column card layouts, tables, and charts.
- **FR-009**: Tablet experiences MUST adapt navigation and content density between desktop and mobile patterns without requiring a third product.
- **FR-010**: Mobile experiences MUST be intentionally designed for touch: stacked single-column content, comfortable targets, mobile-friendly lists, and chart/filter/form presentations that do not assume a pointer and wide viewport.
- **FR-011**: Components SHOULD adapt responsively; separate mobile-only implementations are allowed only where the interaction pattern genuinely differs (for example bottom navigation vs persistent side navigation, table vs card list, centered modal vs sheet-like overlay).
- **FR-011a**: Mobile primary navigation MUST remain a **hybrid**: a bottom destination bar for Records, Analytics, Vehicles, Categories, and Settings, plus a drawer/sidebar reachable from the header for the full information architecture (including Service Records, Profile, Analytics children, and Logout). FAB and page content MUST clear the bottom bar and safe areas.
- **FR-012**: Fixed and sticky chrome (headers, navigation, primary action buttons, install banner) MUST respect device safe areas on notched devices and installed app displays.

#### Screen mapping (existing → redesigned)

- **FR-013**: **Login** — restyle brand, surface, and hierarchy; preserve Google sign-in and post-login destination behavior.
- **FR-014**: **App shell (header/sidebar/outlet/footer/FAB/bottom nav)** — restyle chrome while preserving hybrid mobile navigation (bottom bar + drawer) and desktop persistent sidebar; preserve FAB availability on Records-only routes and fuel-form hosting in the shell.
- **FR-015**: **Records (Dashboard)** — restyle summary/KPI region, filters entry, list/table, pagination, and delete confirmation presentation; preserve date-range fetch, client filters, pagination sizes, edit-via-shared-form, and delete semantics.
- **FR-015a**: Records MAY show additional summary metrics derived only from the already-loaded, currently filtered record set (examples: record count, average cost per litre). These MUST NOT require new API fields or change persisted payloads. Existing total cost and total volume MUST remain available.
- **FR-016**: **Vehicles / Categories** — restyle list/table/cards, FABs, and form dialogs; preserve CRUD behavior.
- **FR-017**: **Settings / Profile** — restyle forms and identity display; preserve auto-save preferences and local profile data sources.
- **FR-018**: **Analytics hub + Vehicle Category + Fuel Price + Fuel Type** — restyle hub guidance and chart pages for clarity on desktop and mobile; preserve existing analytics data windows and series meaning.
- **FR-019**: **Service Records** — keep reachable from the full navigation drawer (not the mobile bottom bar); restyle as an honest empty/coming-soon state within the new system; MUST NOT imply editable service history exists until a later functional feature delivers it.
- **FR-019a**: Filters and modal forms on small screens MUST continue to use the shared dialog overlay evolved toward sheet-like presentation (as today), not a separate competing sheet component library.
- **FR-020**: **Install prompt** — restyle to match the system; preserve show/dismiss/install behavior.
- **FR-020a**: App branding marks MUST be refreshed for the mint/teal overhaul: favicon and generated install/home-screen icons MUST match the new accent system (no proprietary Fintrack artwork).

#### Functional preservation risks (UI work MUST NOT break)

- **FR-028**: Shell-owned fuel create/edit (shared form + refresh signal to Records) MUST remain the single create/edit path — pages MUST NOT mount a second competing fuel form.
- **FR-029**: Session access checks, stored session credentials, and sign-out clearing behavior MUST remain behaviorally equivalent for users (presentation of chrome may change).
- **FR-030**: Client-calculated unit cost for fuel entries, existing validation rules, preference defaults on create, date-range fetch semantics, client-side filters/pagination sizes, and analytics series meanings MUST remain unchanged. Optional Records summary KPIs added under FR-015a MUST be display-only aggregates of the filtered in-memory list.
- **FR-031**: List identity handling for edit/delete MUST continue to tolerate existing record identity aliases so rows do not become undeletable after restyle.

#### Accessibility

- **FR-021**: Interactive controls MUST expose accessible names; form fields MUST have labels; focus states MUST be visible.
- **FR-022**: Color MUST NOT be the only means of conveying meaning (badges/charts need text or icons as well).
- **FR-023**: Touch targets on mobile primary actions and navigation MUST be large enough for reliable tapping.
- **FR-024**: Charts MUST provide a text alternative or summary sufficient to understand the main insight without relying solely on color vision.
- **FR-025**: The experience MUST respect reduced-motion preferences for non-essential animation.

#### Quality bars

- **FR-026**: Information density MUST feel data-rich without clutter: clear primary metrics, secondary detail, and progressive disclosure for filters/actions.
- **FR-027**: Navigation information architecture MUST continue to expose all current destinations unless a clarified decision demotes a stub; users MUST NOT lose access to an existing route as a silent side effect of the redesign.

### Key Entities

- **Fuel record**: A fill-up entry with date, vehicle, fuel type, payment type, volume, amount, and derived unit cost — displayed in lists/summaries; unchanged meaning.
- **Vehicle**: Named asset optionally linked to a category and registration — managed in Vehicles; unchanged meaning.
- **Vehicle category**: Grouping label used in fleet and analytics — unchanged meaning.
- **User preferences**: Default vehicle, fuel type, and payment type applied when creating fuel records — unchanged meaning.
- **Analytics snapshot**: Existing category, fuel-price, and fuel-type insights over the product’s current analytics window — presentation only.
- **Design tokens**: Shared visual decisions (color, type, space, radius, elevation) consumed by all redesigned surfaces.
- **App shell**: Authenticated chrome that frames pages (navigation, header actions, theme control, profile entry, primary add action where applicable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a structured walkthrough, reviewers can identify a single visual system (shared tokens and control styles) across Login, shell, Records, Vehicles, and Settings with no more than one intentional exception documented.
- **SC-002**: On a desktop-sized viewport, a returning user can locate Records summaries (including total cost and total volume), open filters, and reach edit/delete for a visible row in under 1 minute without training beyond the current product knowledge.
- **SC-002a**: When Records has at least two fill-ups in the filtered set, any additional average cost-per-litre summary shown matches amount÷volume arithmetic over that same filtered set within normal display rounding.
- **SC-003**: On a mobile-sized viewport, a returning user can move between Records, Analytics, and Vehicles, and open add-fuel, using only the redesigned mobile navigation and primary actions, in under 1 minute.
- **SC-004**: 100% of pre-redesign core workflows listed in FR-002 remain completable after redesign (verified by checklist pass/fail), with no change to persisted data shapes observed by the user.
- **SC-005**: On a representative notched mobile viewport, primary header controls, navigation, and the Records add action remain fully tappable (not obscured by system status or home indicator areas).
- **SC-006**: Keyboard-only desktop users can open a dialog (filter or form), move through its fields, and close it without focus loss traps, in a manual accessibility check.
- **SC-007**: At least 90% of pages in the authenticated IA show dedicated loading and empty presentations consistent with the design system (not raw unstyled text) when those states are triggered.
- **SC-008**: Side-by-side comparison with the Fintrack reference shows aligned UX qualities (hierarchy, soft premium surfaces, mint/teal finance accents, scannable transactions/metrics) without claiming pixel parity; stakeholder review rates the direction as “on-target” or better on a simple accept/revise scale.
- **SC-009**: In both light and dark appearances, primary actions and key accents read as the mint/teal finance family (not the prior blue-forward refresh), verified by a visual pass of shell, Records, and Login.
- **SC-010**: After install or a browser tab check, the visible app icon matches the redesigned mint/teal brand mark (not the pre-overhaul icon).

## Assumptions

- Inspiration is directional: soft premium finance-dashboard aesthetics, KPI-forward Records, mint/teal accents, card-based summaries, and clearer chart framing—not a clone of Fintrack’s exact layout, illustration, or brand.
- Existing authentication (Google sign-in + stored session), routing destinations, and client-side calculations remain the behavioral baseline.
- Existing shared UI primitives and styling tokens will be evolved in place toward the mint/teal overhaul; a second component library will not be introduced for this feature.
- Currency remains INR presentation; enum labels remain humanized as today.
- Analytics keep their current fixed insight window and series definitions; adding user-controlled analytics date ranges is out of scope unless later specified.
- Service Records remains a non-functional placeholder from a data perspective; redesign only improves honesty and visual consistency of that gap.
- Dual Records routes may continue to exist behaviorally; navigation may favor a single primary label (“Records”) without removing compatibility destinations.
- The live Dribbble page may not be fully retrievable in every tooling environment; implementers SHOULD consult the linked shot directly when polishing visuals.
- Tablet uses fluid adaptation between desktop and mobile patterns rather than a separate product definition; the established mobile/desktop switch remains the existing small-screen breakpoint used by the app shell and list pages.
- PWA install and service-worker behavior stay as-is aside from prompt chrome styling, safe-area-aware placement, and refreshed brand icons aligned to the new accent system.
- A prior visual/responsive refresh already exists in the codebase (page heroes, section panels, bottom nav, sheet-like dialogs, blue accent tokens). This feature treats that as the functional/layout baseline to visually overhaul (including accent shift), not as the final brand.

## Clarifications

### Session 2026-09-13

- Q: What mobile navigation pattern should the redesign use? → A: Preserve/evolve the existing hybrid — bottom bar (Records, Analytics, Vehicles, Categories, Settings) plus hamburger drawer for the full IA (including Service Records, Profile, Analytics children, Logout). Do not revert to drawer-only as the primary mobile pattern.
- Q: How should incomplete destinations appear in navigation? → A: Keep Service Records out of the bottom bar but reachable from the drawer, with an honest Coming soon empty state. Keep the Analytics hub as a primary mobile destination that guides users to existing chart views.
- Q: How should mobile filters/forms be presented? → A: Evolve the existing dialog pattern, which already behaves sheet-like on small screens; do not introduce a second overlay/sheet system.
- Q: Which lists need distinct mobile presentation? → A: Records, Vehicles, and Categories already switch table ↔ cards below 768px — redesign continues that split rather than inventing a third list paradigm.
- Q: How are errors/notifications shown today? → A: Per-screen Alert / inline error strings only — no toast system; redesign must not require a new notification platform.
- Q: Relative to the visual refresh already in the app, how far should this Fintrack-inspired redesign go? → A: Fuller visual overhaul, including shifting accents toward a mint/teal finance palette, while keeping light and dark appearances.
- Q: On Records, may the redesign add extra summary metrics computed only from the already-loaded filtered list? → A: Yes — allow additional client-derived KPIs from the current filtered Records set (for example average cost per litre and record count), with no new API fields.
- Q: Should the mint/teal overhaul also refresh the app icon and install icons? → A: Yes — refresh favicon and install icons to match the mint/teal overhaul.

## Out of Scope

- Backend or API changes of any kind
- New API-backed metrics, new charts requiring new server data, or server-side pagination
- Implementing Service Records CRUD
- Changing auth providers or session storage model
- Introducing a second styling system or heavy UI framework
- Marketing site / landing page redesign outside the app
- Pixel-perfect reproduction of the Dribbble shot or use of its proprietary assets
