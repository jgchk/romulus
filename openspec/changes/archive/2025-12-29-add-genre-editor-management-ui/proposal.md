# Change: Add Genre Editor Role Management UI

## Why

Currently, when new users join the site and want to edit the genre tree, they must message the site owner on Discord, who then manually connects to the production database to add the `genre-editor` role. This creates a bottleneck and is not scalable. A dedicated UI will allow trusted users to grant or revoke the `genre-editor` role without requiring direct database access.

## What Changes

- Add a new `genre-editor-manager` role with permission to manage the `genre-editor` role assignment
- Add a new permission `authorization:manage-genre-editors` for this specific capability
- Create a new frontend page at `/genre-editors` to manage genre editor assignments
- Add API endpoint(s) to list users and their `genre-editor` role status
- The UI will allow:
  - Viewing all registered users with their `genre-editor` role status
  - Filtering/searching users by username
  - Assigning the `genre-editor` role to users
  - Removing the `genre-editor` role from users

## Impact

- Affected specs: New `genre-editor-management` capability
- Affected code:
  - `services/authorization/` - New permission and role setup
  - `services/authentication/` - API to list users (if not already available)
  - `apps/frontend/src/routes/genre-editors/` - New UI page
  - `apps/backend/src/main.ts` - Register new permission and role on startup
