# CODE ARCHIVE 1: CORE APPLICATION FILES

## 📁 Root Configuration Files

### index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SafeGuard Namibia - Community Emergency Safety App</title>
    <meta name="description" content="Community-driven emergency safety app for Namibia. One-tap panic button, real-time alerts, live location sharing, and neighborhood safety network." />
    <meta name="author" content="SafeGuard Namibia" />

    <meta property="og:title" content="SafeGuard Namibia - Stay Safe Together" />
    <meta property="og:description" content="Instantly alert your community during emergencies. Share your location, report incidents, and build a safer Namibia." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@lovable_dev" />
    <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### vite.config.ts
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      backgroundImage: {
        'gradient-emergency': 'var(--gradient-emergency)',
        'gradient-safe': 'var(--gradient-safe)',
        'gradient-warning': 'var(--gradient-warning)',
      },
      boxShadow: {
        'glow': 'var(--shadow-glow)',
        'glow-intense': 'var(--shadow-glow-intense)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
            transform: "scale(1)",
          },
          "50%": { 
            boxShadow: "0 0 40px hsl(var(--primary) / 0.6)",
            transform: "scale(1.02)",
          },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### tsconfig.json
```json
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

### components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### eslint.config.js
```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
```

---

## 📁 src/ - Entry Files

### src/main.tsx
```typescript
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### src/App.tsx
```typescript
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
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Definition of the design system. All colors, gradients, fonts, etc should be defined here. 
All colors MUST be HSL.
*/

@layer base {
  :root {
    --background: 0 0% 7%;
    --foreground: 0 0% 98%;

    --card: 0 0% 10%;
    --card-foreground: 0 0% 98%;

    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 98%;

    --primary: 0 84% 55%;
    --primary-foreground: 0 0% 100%;
    --primary-glow: 0 84% 65%;

    --secondary: 14 88% 58%;
    --secondary-foreground: 0 0% 100%;

    --muted: 0 0% 20%;
    --muted-foreground: 0 0% 60%;

    --accent: 42 100% 55%;
    --accent-foreground: 0 0% 10%;

    --destructive: 0 84% 55%;
    --destructive-foreground: 0 0% 100%;

    --success: 142 71% 45%;
    --success-foreground: 0 0% 100%;

    --border: 0 0% 20%;
    --input: 0 0% 20%;
    --ring: 0 84% 55%;

    --radius: 0.75rem;

    --gradient-emergency: linear-gradient(135deg, hsl(0 84% 55%), hsl(14 88% 58%));
    --gradient-safe: linear-gradient(135deg, hsl(142 71% 45%), hsl(178 84% 40%));
    --gradient-warning: linear-gradient(135deg, hsl(42 100% 55%), hsl(30 100% 60%));
    
    --shadow-glow: 0 0 20px hsl(0 84% 55% / 0.3);
    --shadow-glow-intense: 0 0 40px hsl(0 84% 55% / 0.5);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
  }
}
```

### src/App.css
```css
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.react:hover {
  filter: drop-shadow(0 0 2em #61dafbaa);
}

@keyframes logo-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: no-preference) {
  a:nth-of-type(2) .logo {
    animation: logo-spin infinite 20s linear;
  }
}

.card {
  padding: 2em;
}

.read-the-docs {
  color: #888;
}
```

### src/vite-env.d.ts
```typescript
/// <reference types="vite/client" />
```
