# Projects & Project Tracking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Directus collections `projects` and `project_tracking` with required fields and relationships.

**Architecture:** Create new Directus collections with UUID primary keys, add fields/relations to `directus_users`, `categories`, and `platforms`, and configure status dropdown. Uniqueness for project names is app-level only (no DB constraint).

**Tech Stack:** Directus CMS, Directus API tools, Node.js project

### Task 1: Inspect existing schema for related collections

**Files:**
- Modify: none
- Test: none

**Step 1: Read schema overview**

Run: `directus schema()` via MCP tool `mcp__directus-backlinkflow__schema`.
Expected: collections list includes `categories`, `platforms`, `directus_users`.

**Step 2: Read detailed schema**

Run: `directus schema(keys: ["categories", "platforms"])`.
Expected: fields and relation info used to confirm naming and relationship targets.

**Step 3: Commit**

No commit (read-only).

### Task 2: Create `projects` collection

**Files:**
- Create: Directus collection `projects`
- Test: none

**Step 1: Create collection with fields**

Use MCP `collections.create` with:
- `id` (uuid primary key)
- `user_id` (uuid, m2o, select-dropdown-m2o)
- `name` (string, required)
- `website_url` (string, nullable)
- `tags` (alias, m2m)
- `date_created` (timestamp, special: date-created)
- `date_updated` (timestamp, special: date-updated)

Expected: collection created with fields.

**Step 2: Create relations**

Use MCP `relations.create` for:
- `projects.user_id` -> `directus_users` (SET NULL)
- `projects.tags` -> `categories` via junction table (see Task 3)

Expected: relation entries created.

**Step 3: Commit**

No commit (Directus schema change only).

### Task 3: Create M2M junction for `projects` ↔ `categories`

**Files:**
- Create: `projects_categories` junction (or follow existing naming convention)
- Test: none

**Step 1: Decide naming**

Inspect existing M2M naming conventions in schema. If `platforms_categories` exists, mirror its pattern for `projects_categories` with fields `projects_id` and `categories_id`.

**Step 2: Create junction collection**

Use MCP `collections.create` to add junction with:
- `id` (uuid primary key)
- `projects_id` (uuid)
- `categories_id` (uuid)

**Step 3: Add relations**

Use MCP `relations.create` to wire:
- `projects_categories.projects_id` -> `projects` (CASCADE)
- `projects_categories.categories_id` -> `categories` (CASCADE)

**Step 4: Update `projects.tags` alias field**

Ensure `projects.tags` is configured as `m2m` with proper junction field mapping.

**Step 5: Commit**

No commit (Directus schema change only).

### Task 4: Create `project_tracking` collection

**Files:**
- Create: Directus collection `project_tracking`
- Test: none

**Step 1: Create collection with fields**

Use MCP `collections.create` with:
- `id` (uuid primary key)
- `project_id` (uuid, m2o -> projects)
- `platform_id` (uuid, m2o -> platforms)
- `status` (string dropdown: todo, in_progress, submitted, live; default: todo)
- `notes` (text, nullable)
- `live_backlink_url` (string, nullable)

**Step 2: Create relations**

Use MCP `relations.create` for:
- `project_tracking.project_id` -> `projects` (SET NULL)
- `project_tracking.platform_id` -> `platforms` (SET NULL)

**Step 3: Commit**

No commit (Directus schema change only).

### Task 5: Verify schema changes

**Files:**
- Modify: none
- Test: none

**Step 1: Read schema for new collections**

Use MCP `schema(keys: ["projects", "project_tracking"])` to verify fields, relations, and status choices.

**Step 2: Manual smoke test (optional)**

Create a `projects` item and a `project_tracking` item via MCP `items.create` to ensure relations work.

**Step 3: Commit**

No commit (Directus data changes optional).
