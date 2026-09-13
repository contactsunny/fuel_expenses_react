# Contract: Behavioral Preservation

**Feature**: `001-ui-ux-redesign`  
**Type**: UI application preservation contract (not a backend OpenAPI change)

## Purpose

Guarantee the redesign does not alter product behavior observable through workflows and network payloads.

## MUST remain unchanged

| Area | Contract |
|------|----------|
| Auth | Google sign-in success path; session storage keys; authenticated gate on `/live/*`; logout clears client storage and returns to Login |
| HTTP | Authenticated calls continue to use existing client + `token` header semantics; endpoint paths and methods unchanged |
| Fuel CRUD | Create/update payload fields and validation rules unchanged; unit cost remains client-calculated string semantics as today |
| Records query | Date-range encoding and client-side filter/pagination behavior unchanged |
| Vehicles / Categories | CRUD payloads and refresh-after-save behavior unchanged |
| Preferences | Immediate save-on-change with revert-on-failure unchanged |
| Analytics | Same six-month windows and series meanings; no new analytics endpoints required |
| Routing | Existing destinations remain reachable; dual Records routes may both work |
| Fuel form ownership | Single shell-hosted form + refresh signal to Records |

## MAY change

| Area | Allowed change |
|------|----------------|
| Layout / CSS / tokens | Visual presentation |
| Component classNames / composition | As long as behavior contracts hold |
| Records summary UI | Additional **display-only** KPIs from filtered list |
| Brand icons / theme-color | Mint/teal refresh |
| Copy / empty-state wording | Clarity improvements without implying new features exist |

## MUST NOT

- Call new backend endpoints for this feature
- Change auth header name or login success status check
- Mount a second fuel form on Records
- Persist newly invented KPI fields to the API
- Hide Service Records without drawer access (unless a later IA decision revises FR-019)

## Verification

Follow [quickstart.md](../quickstart.md) scenarios Q1–Q8; spot-check network payloads for create fuel / save preferences before vs after.
