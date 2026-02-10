import { ReactNode } from 'react';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';

interface RequireRoleProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export default function RequireRole({ children, allowedRoles }: RequireRoleProps) {
  const { data: role, isLoading } = useGetCallerUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <AccessDeniedScreen />;
  }

  return <>{children}</>;
}
