import { useEffect, useRef } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useRequestRole } from '../../hooks/useQueries';
import { getPendingRoleRequest, clearPendingRoleRequest, storeRoleClaimError } from '../../utils/pendingRoleRequest';
import { useQueryClient } from '@tanstack/react-query';

/**
 * PostLoginRoleClaimGate runs immediately after Internet Identity authentication.
 * It reads the pending role request from sessionStorage and attempts to claim that role.
 * On success, it clears the pending state and refreshes role queries.
 * On failure, it stores an error message and logs out to prevent incorrect role state.
 */
export default function PostLoginRoleClaimGate() {
  const { identity, clear } = useInternetIdentity();
  const requestRoleMutation = useRequestRole();
  const queryClient = useQueryClient();
  const hasAttemptedClaim = useRef(false);

  useEffect(() => {
    if (!identity || hasAttemptedClaim.current) return;

    const pendingRequest = getPendingRoleRequest();
    if (!pendingRequest) return;

    hasAttemptedClaim.current = true;

    // Attempt to claim the requested role
    requestRoleMutation.mutate(
      {
        requestedRole: pendingRequest.requestedRole,
        passcode: pendingRequest.passcode,
      },
      {
        onSuccess: () => {
          // Clear pending request on success
          clearPendingRoleRequest();
          // Refresh role queries to update UI
          queryClient.invalidateQueries({ queryKey: ['callerUserRole'] });
          queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
        },
        onError: (error: any) => {
          // Parse backend error message
          let errorMessage = 'Access denied. Please try again.';
          
          if (error?.message) {
            const msg = error.message.toLowerCase();
            
            if (msg.includes('director') && msg.includes('maximum')) {
              errorMessage = 'Access denied: The Director role is limited to two accounts only. Please log in as Management or Reception if you are not a Director.';
            } else if (msg.includes('incorrect passcode')) {
              errorMessage = 'Access denied: Incorrect passcode. Please try again.';
            } else if (msg.includes('passcode is required')) {
              errorMessage = 'Access denied: A passcode is required for this role.';
            } else if (msg.includes('access denied')) {
              errorMessage = error.message;
            }
          }

          // Store error for display on LoginPage
          storeRoleClaimError(errorMessage);
          
          // Clear pending request
          clearPendingRoleRequest();
          
          // Log out to prevent incorrect role state
          clear();
        },
      }
    );
  }, [identity, requestRoleMutation, queryClient, clear]);

  return null;
}
