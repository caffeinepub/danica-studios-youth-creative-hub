import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import ReceptionVisitFormPage from './pages/reception/ReceptionVisitFormPage';
import ReceptionVisitsListPage from './pages/reception/ReceptionVisitsListPage';
import VisitDetailsPage from './pages/reception/VisitDetailsPage';
import RecordingDetailsPage from './pages/services/RecordingDetailsPage';
import PhotoVideoDetailsPage from './pages/services/PhotoVideoDetailsPage';
import PodcastDetailsPage from './pages/services/PodcastDetailsPage';
import IntakeCompletePage from './pages/reception/IntakeCompletePage';
import MonthlyReportsPage from './pages/reports/MonthlyReportsPage';
import RoleManagementPage from './pages/admin/RoleManagementPage';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

function RootComponent() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      {showProfileSetup && <ProfileSetupModal />}
      <AppLayout>
        <Outlet />
      </AppLayout>
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootComponent,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ReceptionVisitFormPage,
});

const visitsListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visits',
  component: ReceptionVisitsListPage,
});

const visitDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/visits/$visitId',
  component: VisitDetailsPage,
});

const recordingDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/recording/$visitId',
  component: RecordingDetailsPage,
});

const photoVideoDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/photo-video/$visitId',
  component: PhotoVideoDetailsPage,
});

const podcastDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/services/podcast/$visitId',
  component: PodcastDetailsPage,
});

const intakeCompleteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intake-complete',
  component: IntakeCompletePage,
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: MonthlyReportsPage,
});

const roleManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/roles',
  component: RoleManagementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  visitsListRoute,
  visitDetailsRoute,
  recordingDetailsRoute,
  photoVideoDetailsRoute,
  podcastDetailsRoute,
  intakeCompleteRoute,
  reportsRoute,
  roleManagementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
