import React from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { clearSelectedRoleLabel } from '../../utils/roleLabels';
import { clearPendingRoleRequest, clearRoleClaimError } from '../../utils/pendingRoleRequest';

export default function LoginButton() {
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    clearSelectedRoleLabel();
    clearPendingRoleRequest();
    clearRoleClaimError();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      size="sm"
    >
      Logout
    </Button>
  );
}
