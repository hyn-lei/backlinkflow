# Discovery Recommendation Logic Design

**Goal:** Define Discovery page recommendation logic and user flow for project-based platform suggestions.

**Context:** Platforms are tagged via M2M categories. Project tags drive recommendation. `project_tracking.status` includes `rejected` to optionally exclude rejected platforms.

## Recommendation Logic (Discovery)

**Inputs**
- Current project (e.g., "My AI Bot")
- Project tags: ["AI", "SaaS"]
- Platforms with categories (M2M → categories)

**Rule A — Precise match**
- Return platforms whose categories include ANY of the project tags.

**Rule B — General must-show**
- Return platforms whose categories include "General" (e.g., Product Hunt).

**Ranking**
- Higher priority for platforms matching AI (and other project tags).
- Secondary priority for General-tagged platforms.

**Exclusion (optional)**
- Exclude platforms where `project_tracking.status == "rejected"` for the current project.

## Example Query Intent (pseudocode)

1) Get project tags.
2) Query platforms where categories contain ANY tag.
3) Query platforms where categories contain General.
4) Merge and rank:
   - score += high for tag match
   - score += medium for General
5) Optionally filter out rejected platforms for this project.

## User Flow

**Step 1 — Create project**
- UI: “Add New Project” modal
- Inputs: name, URL, tags

**Step 2 — Generate recommendations**
- System fetches platforms by tags
- UI: “Recommended for {ProjectName}”
- Example results: Yelp (Local Business), App Store (Mobile), Product Hunt (General)
- Hidden: GitHub, ArtStation (no tag match)

**Step 3 — Add to board**
- User clicks “+” on a platform card
- Backend creates `project_tracking` record with status `todo`

**Step 4 — Switch project**
- User selects a different project
- UI refreshes recommendations accordingly
