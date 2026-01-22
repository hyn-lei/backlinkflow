# Projects & Project Tracking Design

**Goal:** Add project-level tracking (projects + project_tracking) in Directus, moving status tracking from user->platform to project->platform.

**Context:** Directus collections only. Uniqueness for project name is enforced in the application layer, not via Directus constraints or flows.

## Data Model

### `projects`
Represents a user's project.

**Fields**
- `id` (uuid, primary key)
- `user_id` (m2o -> directus_users) Owner
- `name` (string) Project name, unique per user (app-level validation)
- `website_url` (string, nullable)
- `tags` (m2m -> categories)
- `date_created` (timestamp, special: date-created)
- `date_updated` (timestamp, special: date-updated)

### `project_tracking`
Tracks a project's status on a platform.

**Fields**
- `id` (uuid, primary key)
- `project_id` (m2o -> projects)
- `platform_id` (m2o -> platforms)
- `status` (string dropdown) `todo`, `in_progress`, `submitted`, `live`
- `notes` (text, nullable)
- `live_backlink_url` (string, nullable)

## Validation & Data Flow

- **Project name uniqueness:** Enforced in the application layer by querying `projects` with `user_id + name` before create/update. Directus does not add a unique index or flow hook.
- **Tracking lifecycle:** Application updates `project_tracking.status` along the allowed states. Directus stores and validates relations.
- **Relationship integrity:** Invalid `project_id`/`platform_id` is rejected by Directus relation constraints.

## Error Handling

- Duplicate project name per user returns a clear application-layer error.
- Invalid platform/project references surface as Directus relation errors.

## Testing Strategy

Application-layer tests only:
- Same user + same name => rejected
- Same user + different name => allowed
- project_tracking with invalid platform_id => rejected
- status accepts only `todo`/`in_progress`/`submitted`/`live`

## Non-Goals

- No data migration from `user_tracking`
- No Directus Flow or DB constraint for uniqueness (can be added later)
