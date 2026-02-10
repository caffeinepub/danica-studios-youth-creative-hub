import { UserRole } from '../backend';

/**
 * Maps backend UserRole to display labels for UI presentation.
 * This is display-only and does not affect authorization logic.
 */
export function getRoleDisplayLabel(role: UserRole | undefined): string {
  if (!role) return 'Reception';
  
  switch (role) {
    case UserRole.admin:
      return 'Director';
    case UserRole.user:
      return 'Management';
    case UserRole.guest:
      return 'Reception';
    default:
      return 'Reception';
  }
}

/**
 * Stores the selected login role label in sessionStorage for display purposes.
 */
export function storeSelectedRoleLabel(label: string): void {
  sessionStorage.setItem('selectedRoleLabel', label);
}

/**
 * Retrieves the selected login role label from sessionStorage.
 */
export function getSelectedRoleLabel(): string | null {
  return sessionStorage.getItem('selectedRoleLabel');
}

/**
 * Clears the selected login role label from sessionStorage.
 */
export function clearSelectedRoleLabel(): void {
  sessionStorage.removeItem('selectedRoleLabel');
}
