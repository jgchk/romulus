## 1. Backend: Authorization Service

- [x] 1.1 Add new permission constant `ManageGenreEditors: 'authorization:manage-genre-editors'` in `services/authorization/src/domain/permissions.ts`
- [x] 1.2 Register the new permission in `apps/backend/src/main.ts` during startup
- [x] 1.3 Create new `genre-editor-manager` role with the `manage-genre-editors` permission in `apps/backend/src/main.ts`

## 2. Backend: Authentication Service - User Listing API

- [x] 2.1 Add repository method to list all accounts (paginated) in `services/authentication/`
- [x] 2.2 Add application layer command/query for listing users
- [x] 2.3 Add API endpoint `GET /accounts/list` to list users (requires `manage-genre-editors` permission)
- [x] 2.4 Add filtering by username query parameter

## 3. Backend: Authorization Service - Role Assignment Enhancement

- [x] 3.1 Add API endpoint to get users with a specific role `GET /roles/{roleName}/users`
- [x] 3.2 Ensure existing `PUT /users/{id}/roles` endpoint works for assigning `genre-editor` role
- [x] 3.3 Add API endpoint to remove a role from a user `DELETE /users/{id}/roles/{roleName}`

## 4. Frontend: Genre Editor Management Page

- [x] 4.1 Create route at `apps/frontend/src/routes/genre-editors/`
- [x] 4.2 Add `+page.server.ts` with load function to fetch users and their genre-editor status
- [x] 4.3 Add `+page.svelte` with user list table showing:
  - Username
  - Genre editor status (has role or not)
  - Action button to grant/revoke role
- [x] 4.4 Add search/filter input for filtering users by username
- [x] 4.5 Add pagination controls if user list is large
- [x] 4.6 Add form actions for granting and revoking the role
- [x] 4.7 Add navigation link to the page (accessible only to users with permission)

## 5. Testing

- [x] 5.1 Add unit tests for new authentication service user listing
- [x] 5.2 Add unit tests for authorization service role listing endpoints
- [x] 5.3 Test permission checks on all new endpoints

## 6. Validation

- [x] 6.1 Run `pnpm lint` and fix any issues
- [x] 6.2 Run `pnpm test:unit` for affected files
