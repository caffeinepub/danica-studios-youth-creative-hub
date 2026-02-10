import { AppRole } from '../backend';

export interface PendingRoleRequest {
  requestedRole: AppRole;
  passcode?: string;
}

const PENDING_ROLE_KEY = 'pendingRoleRequest';
const ROLE_CLAIM_ERROR_KEY = 'roleClaimError';

/**
 * Stores a pending role request (selected role + optional passcode) in sessionStorage.
 */
export function storePendingRoleRequest(request: PendingRoleRequest): void {
  sessionStorage.setItem(PENDING_ROLE_KEY, JSON.stringify(request));
}

/**
 * Retrieves the pending role request from sessionStorage.
 */
export function getPendingRoleRequest(): PendingRoleRequest | null {
  const stored = sessionStorage.getItem(PENDING_ROLE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as PendingRoleRequest;
  } catch {
    return null;
  }
}

/**
 * Clears the pending role request from sessionStorage.
 */
export function clearPendingRoleRequest(): void {
  sessionStorage.removeItem(PENDING_ROLE_KEY);
}

/**
 * Stores a role claim error message in sessionStorage.
 */
export function storeRoleClaimError(message: string): void {
  sessionStorage.setItem(ROLE_CLAIM_ERROR_KEY, message);
}

/**
 * Retrieves the role claim error message from sessionStorage.
 */
export function getRoleClaimError(): string | null {
  return sessionStorage.getItem(ROLE_CLAIM_ERROR_KEY);
}

/**
 * Clears the role claim error message from sessionStorage.
 */
export function clearRoleClaimError(): void {
  sessionStorage.removeItem(ROLE_CLAIM_ERROR_KEY);
}
