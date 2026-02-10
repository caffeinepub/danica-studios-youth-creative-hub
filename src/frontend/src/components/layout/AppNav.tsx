import { Link, useNavigate } from '@tanstack/react-router';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { UserRole } from '../../backend';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { Menu, Home, Users, BarChart3, Settings } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { getRoleDisplayLabel } from '../../utils/roleLabels';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AppNav() {
  const { data: role } = useGetCallerUserRole();
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const canAccessReports = role === UserRole.admin || role === UserRole.user;
  const canAccessRoleManagement = role === UserRole.admin;

  const isAuthenticated = !!identity;
  const displayLabel = isAuthenticated && role ? getRoleDisplayLabel(role) : null;

  const NavLinks = () => (
    <>
      <Button
        variant="ghost"
        onClick={() => {
          navigate({ to: '/' });
          setOpen(false);
        }}
        className="justify-start gap-2"
      >
        <Home className="h-4 w-4" />
        Reception
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          navigate({ to: '/visits' });
          setOpen(false);
        }}
        className="justify-start gap-2"
      >
        <Users className="h-4 w-4" />
        All Visits
      </Button>
      {canAccessReports && (
        <Button
          variant="ghost"
          onClick={() => {
            navigate({ to: '/reports' });
            setOpen(false);
          }}
          className="justify-start gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Reports
        </Button>
      )}
      {canAccessRoleManagement && (
        <Button
          variant="ghost"
          onClick={() => {
            navigate({ to: '/admin/roles' });
            setOpen(false);
          }}
          className="justify-start gap-2"
        >
          <Settings className="h-4 w-4" />
          Role Management
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/assets/Danica Studios-1.png" 
              alt="Danica Studios logo" 
              className="h-10 w-10 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg leading-tight">Danica Studios</h1>
              <p className="text-xs text-muted-foreground">Youth Creative Hub</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-2">
            <NavLinks />
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated && displayLabel && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 text-sm font-medium">
              <span className="text-muted-foreground">Logged in as</span>
              <span className="text-foreground">{displayLabel}</span>
            </div>
          )}
          <LoginButton />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              {isAuthenticated && displayLabel && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/50 text-sm font-medium mb-4">
                  <span className="text-muted-foreground">Logged in as</span>
                  <span className="text-foreground">{displayLabel}</span>
                </div>
              )}
              <nav className="flex flex-col gap-2 mt-4">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
