import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { monitoring } from "@/lib/monitoring/monitoring-service";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Map from "./pages/Map";
import Alerts from "./pages/Alerts";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LookAfterMe from "./pages/LookAfterMe";
import StartSession from "./pages/StartSession";
import Authorities from "./pages/Authorities";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        try {
          monitoring.trackError(error as Error, {
            componentName: 'QueryClient',
            additionalContext: { failureCount },
          });
        } catch (err) {
          console.warn('Failed to track query error:', err);
        }
        return failureCount < 3;
      },
    },
  },
});

// Navigation tracking component
const NavigationTracker = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    monitoring.trackEvent({
      eventName: 'navigation',
      properties: {
        path: location.pathname,
        navigationType,
      },
    });
  }, [location, navigationType]);

  return null;
};

// Route wrapper with error boundary
const RouteWithErrorBoundary = ({
  element,
  componentName
}: {
  element: React.ReactNode;
  componentName: string;
}) => (
  <ErrorBoundary componentName={componentName}>
    {element}
  </ErrorBoundary>
);

const App = () => {
  useEffect(() => {
    // Initial health check
    const checkServices = async () => {
      try {
        await monitoring.checkHealth('supabase');
      } catch (error) {
        console.warn('Health check failed:', error);
      }
    };
    checkServices();

    // Regular health checks
    const healthCheckInterval = setInterval(checkServices, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(healthCheckInterval);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NavigationTracker />
            <Routes>
              {/* Public Routes - redirect to home if authenticated */}
              <Route
                path="/auth"
                element={
                  <PublicRoute>
                    <RouteWithErrorBoundary element={<Auth />} componentName="Auth" />
                  </PublicRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Onboarding />} componentName="Onboarding" />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes - require authentication */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Index />} componentName="Index" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Map />} componentName="Map" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/alerts"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Alerts />} componentName="Alerts" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Chat />} componentName="Chat" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Profile />} componentName="Profile" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Settings />} componentName="Settings" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/look-after-me"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<LookAfterMe />} componentName="LookAfterMe" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/start-session"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<StartSession />} componentName="StartSession" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/authorities"
                element={
                  <ProtectedRoute>
                    <RouteWithErrorBoundary element={<Authorities />} componentName="Authorities" />
                  </ProtectedRoute>
                }
              />

              {/* 404 - No auth required */}
              <Route path="*" element={<RouteWithErrorBoundary element={<NotFound />} componentName="NotFound" />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
