## ADDED Requirements

### Requirement: Genre Editor Manager Role

The system SHALL provide a `genre-editor-manager` role that grants permission to manage genre editor assignments.

#### Scenario: User with genre-editor-manager role can access management UI

- **WHEN** a user with the `genre-editor-manager` role navigates to `/genre-editors`
- **THEN** they see the genre editor management interface

#### Scenario: User without genre-editor-manager role cannot access management UI

- **WHEN** a user without the `genre-editor-manager` role navigates to `/genre-editors`
- **THEN** they receive a 403 Forbidden error or are redirected

### Requirement: User Listing for Genre Editor Management

The system SHALL provide an API to list all registered users with their genre-editor role status for users with the `manage-genre-editors` permission.

#### Scenario: List all users with genre-editor status

- **WHEN** an authorized user requests the user list
- **THEN** they receive a paginated list of users including username and whether they have the `genre-editor` role

#### Scenario: Filter users by username

- **WHEN** an authorized user searches for users with a username filter
- **THEN** they receive only users whose username contains the search term

#### Scenario: Unauthorized user cannot list users

- **WHEN** a user without `manage-genre-editors` permission requests the user list
- **THEN** they receive a 403 Forbidden error

### Requirement: Grant Genre Editor Role

The system SHALL allow users with the `manage-genre-editors` permission to grant the `genre-editor` role to other users.

#### Scenario: Successfully grant genre-editor role

- **WHEN** an authorized user grants the `genre-editor` role to a user who does not have it
- **THEN** the target user receives the `genre-editor` role
- **AND** they can now create, edit, and delete genres

#### Scenario: Grant role to user who already has it

- **WHEN** an authorized user grants the `genre-editor` role to a user who already has it
- **THEN** the operation succeeds without error (idempotent)

### Requirement: Revoke Genre Editor Role

The system SHALL allow users with the `manage-genre-editors` permission to revoke the `genre-editor` role from other users.

#### Scenario: Successfully revoke genre-editor role

- **WHEN** an authorized user revokes the `genre-editor` role from a user who has it
- **THEN** the target user no longer has the `genre-editor` role
- **AND** they can no longer create, edit, or delete genres

#### Scenario: Revoke role from user who does not have it

- **WHEN** an authorized user revokes the `genre-editor` role from a user who does not have it
- **THEN** the operation succeeds without error (idempotent)

### Requirement: Genre Editor Management UI

The system SHALL provide a web interface at `/genre-editors` for managing genre editor role assignments.

#### Scenario: View user list with role status

- **WHEN** an authorized user views the genre editor management page
- **THEN** they see a table of users showing username and genre-editor role status
- **AND** each row has an action to grant or revoke the role based on current status

#### Scenario: Search for specific user

- **WHEN** an authorized user enters a search term in the filter input
- **THEN** the user list updates to show only users matching the search term

#### Scenario: Grant role from UI

- **WHEN** an authorized user clicks the grant action for a user without the role
- **THEN** the role is granted and the UI updates to reflect the new status

#### Scenario: Revoke role from UI

- **WHEN** an authorized user clicks the revoke action for a user with the role
- **THEN** the role is revoked and the UI updates to reflect the new status
