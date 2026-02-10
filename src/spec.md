# Specification

## Summary
**Goal:** Remove the post-login “Welcome Back” role selection and passcode step so users can log in directly with Internet Identity.

**Planned changes:**
- Remove the Management/Reception role selection UI and passcode field (and related validation/messages) from the logged-out login screen.
- Update the login click flow to initiate Internet Identity login without storing any pending role request or selected role label in sessionStorage.
- Update the navbar “Logged in as” label to be derived from the backend role mapping (via `getRoleDisplayLabel`) instead of any sessionStorage-selected role label.

**User-visible outcome:** When logged out, users see a simple login page with a working “Login with Internet Identity” button (with loading state), and after login the navbar displays the correct role based on the backend user role.
