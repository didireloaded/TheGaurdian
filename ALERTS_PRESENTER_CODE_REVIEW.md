# AlertsPresenter.tsx - Comprehensive Code Review

## Executive Summary
The AlertsPresenter component is well-structured with recent improvements including categorization, collapse functionality, and memoization. However, there are opportunities for further optimization, better component composition, and enhanced accessibility.

---

## ✅ What's Working Well

1. **Memoization**: Proper use of `useMemo` for expensive computations
2. **Configuration Pattern**: Single source of truth with `ALERT_CONFIG`
3. **Accessibility**: Good keyboard support and ARIA labels
4. **Type Safety**: Proper TypeScript interfaces
5. **Collapse Feature**: Well-implemented category expansion/collapse

---

## 🔴 Critical Issues

### 1. Hardcoded Distance Value
**Problem**: Distance shows "~2km away" for all alerts (line 237)

**Current Code**:
```typescript
<span className="text-gray-600 dark:text-gray-400">
  ~2km away
</span>
```

**Impact**: Misleading information, users can't make informed decisions

**Fix**: Calculate actual distance or remove if unavailable
```typescript
// Option 1: Calculate distance (requires user location)
const calculateDistance = (alertLat: number, alertLng: number, userLat: number, userLng: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (alertLat - userLat) * Math.PI / 180;
  const dLon = (alertLng - userLng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(alertLat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
};

// In component
const userLocation = useUserLocation(); // Custom hook

// In alert card
{userLocation && alert.latitude && alert.longitude && (
  <span className="text-gray-600 dark:text-gray-400">
    ~{calculateDistance(alert.latitude, alert.longitude, userLocation.lat, userLocation.lng)}km away
  </span>
)}

// Option 2: Remove if not available
{alert.distance_km !== undefined && (
  <span className="text-gray-600 dark:text-gray-400">
    ~{alert.distance_km}km away
  </span>
)}
```

---

## 🟡 Code Smells & Refactoring Opportunities

### 2. Large Component (300+ lines)
**Problem**: Component handles too many responsibilities:
- Data grouping
- Category rendering
- Alert card rendering
- Header/stats rendering
- Legend rendering

**Solution**: Extract sub-components

```typescript
// src/components/alerts/AlertCard.tsx
interface AlertCardProps {
  alert: Alert;
  onClick: (id: string) => void;
}

export const AlertCard = ({ alert, onClick }: AlertCardProps) => {
  const config = getAlertConfig(alert.alert_type);
  const Icon = config.Icon;

  return (
    <Card
      className={`p-4 hover:shadow-xl transition-all cursor-pointer border-2 ${config.bgColor}`}
      onClick={() => onClick(alert.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(alert.id);
        }
      }}
      aria-label={`${alert.alert_type.replace('_', ' ')} alert at ${alert.location_name || 'unknown location'}`}
    >
      <div className="flex flex-col h-full gap-3">
        <div className="flex justify-center">
          <Icon className={`h-8 w-8 ${config.iconColor}`} />
        </div>
        
        <h3 className="font-bold text-lg capitalize text-center text-gray-900 dark:text-white">
          {alert.alert_type.replace('_', ' ')}
        </h3>
        
        <div className="flex items-start gap-1 text-xs text-gray-700 dark:text-gray-300">
          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2 flex-1">
            {alert.location_name || 'Unknown location'}
          </p>
        </div>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          By: {alert.profiles?.full_name || 'User'}
        </p>
        
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="font-semibold text-gray-900 dark:text-white">
            {getTimeAgo(alert.created_at)}
          </span>
          {alert.distance_km !== undefined && (
            <span className="text-gray-600 dark:text-gray-400">
              ~{alert.distance_km}km away
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
```

```typescript
// src/components/alerts/CategorySection.tsx
interface CategorySectionProps {
  category: {
    key: string;
    label: string;
    color: string;
    alerts: Alert[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  onAlertClick: (id: string) => void;
}

export const CategorySection = ({ 
  category, 
  isExpanded, 
  onToggle, 
  onAlertClick 
}: CategorySectionProps) => (
  <div>
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700 hover:bg-muted/50 transition-colors rounded-t-lg px-2 py-1"
      aria-expanded={isExpanded}
      aria-controls={`category-${category.key}`}
    >
      <div className="flex items-center gap-2">
        <h3 className={`text-lg font-bold ${category.color}`}>
          {category.label}
        </h3>
        <span className="px-2 py-0.5 text-xs font-semibold bg-muted rounded-full">
          {category.alerts.length}
        </span>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5 text-muted-foreground" />
      ) : (
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      )}
    </button>

    {isExpanded && (
      <div 
        id={`category-${category.key}`}
        className="grid grid-cols-2 gap-4 animate-fade-in"
      >
        {category.alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onClick={onAlertClick}
          />
        ))}
      </div>
    )}
  </div>
);
```

```typescript
// src/components/alerts/AlertsHeader.tsx
export const AlertsHeader = ({ alertCount }: { alertCount: number }) => (
  <header className="bg-card border-b border-border p-4">
    <div className="max-w-lg mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-emergency rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold">SafeGuard</h1>
          <p className="text-xs text-muted-foreground">Namibia</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="text-center">
          <div className="text-primary font-bold">{alertCount}</div>
          <div className="text-xs text-muted-foreground">Active Alerts</div>
        </div>
      </div>
    </div>
  </header>
);
```

```typescript
// Simplified AlertsPresenter.tsx
export const AlertsPresenter = ({ alerts, onAlertClick }: AlertsPresenterProps) => {
  const handleAlertClick = (alertId: string) => {
    if (onAlertClick) {
      onAlertClick(alertId);
    } else {
      console.log('Alert clicked:', alertId);
    }
  };

  const groupedAlerts = useMemo(() => groupAlertsByCategory(alerts), [alerts]);

  const categories = useMemo(() =>
    Object.values(CATEGORY_CONFIGS)
      .map(config => ({
        key: config.key,
        label: `${config.emoji} ${config.label}`,
        color: config.color,
        alerts: groupedAlerts[config.key]
      }))
      .filter(cat => cat.alerts.length > 0),
    [groupedAlerts]
  );

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map(c => c.key))
  );

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AlertsHeader alertCount={alerts.length} />

      <main className="max-w-lg mx-auto p-6">
        <AlertsIntro />
        <AlertsStats alertCount={alerts.length} />

        {alerts.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8 mb-6">
            {categories.map((category) => (
              <CategorySection
                key={category.key}
                category={category}
                isExpanded={expandedCategories.has(category.key)}
                onToggle={() => toggleCategory(category.key)}
                onAlertClick={handleAlertClick}
              />
            ))}
          </div>
        )}

        <SafetyTips />
        <AlertsLegend />
      </main>
    </div>
  );
};
```

**Benefits**:
- Each component has single responsibility
- Easier to test in isolation
- Better code reusability
- Improved maintainability

---

### 3. Duplicate Color Classes
**Problem**: Dark mode colors repeated throughout (e.g., `text-gray-900 dark:text-white`)

**Solution**: Use Tailwind's semantic color tokens
```typescript
// Instead of:
className="text-gray-900 dark:text-white"

// Use:
className="text-foreground"

// Instead of:
className="text-gray-600 dark:text-gray-400"

// Use:
className="text-muted-foreground"

// Instead of:
className="border-gray-200 dark:border-gray-700"

// Use:
className="border-border"
```

**Impact**: Reduces code duplication, easier theme management

---

### 4. Missing Distance Calculation Logic
**Problem**: No actual distance calculation despite showing distance

**Solution**: Create distance utility
```typescript
// src/lib/geolocation-utils.ts
export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.latitude)) *
    Math.cos(toRad(point2.latitude)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `~${km}km away`;
};
```

```typescript
// In AlertsPresenter.tsx
import { calculateDistance, formatDistance } from '@/lib/geolocation-utils';

// Add user location hook
const userLocation = useUserLocation(); // Custom hook to get user's location

// Calculate distances
const alertsWithDistance = useMemo(() => {
  if (!userLocation) return alerts;
  
  return alerts.map(alert => ({
    ...alert,
    distance_km: alert.latitude && alert.longitude
      ? calculateDistance(
          { latitude: userLocation.lat, longitude: userLocation.lng },
          { latitude: alert.latitude, longitude: alert.longitude }
        )
      : undefined
  }));
}, [alerts, userLocation]);
```

---

### 5. Inconsistent Alert Type Formatting
**Problem**: `alert.alert_type.replace('_', ' ')` only replaces first underscore

**Current Code**:
```typescript
{alert.alert_type.replace('_', ' ')}
```

**Issue**: "house_breaking" becomes "house breaking" (correct), but if there were multiple underscores, only first is replaced

**Fix**: Use global replace or utility function
```typescript
// src/lib/alert-utils.ts
export const formatAlertType = (type: string): string => {
  return type
    .replace(/_/g, ' ') // Replace all underscores
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Usage
{formatAlertType(alert.alert_type)}
// "house_breaking" → "House Breaking"
// "panic" → "Panic"
```

---

## 🟢 Best Practices Improvements

### 6. Extract Configuration to Separate File
**Problem**: `ALERT_CONFIG` is defined in component file

**Solution**: Move to shared configuration
```typescript
// src/config/alert-config.ts
import { Shield, AlertTriangle, MapPin, Flame, Car, Users, Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AlertConfig {
  Icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  label?: string;
}

export const ALERT_CONFIG: Record<string, AlertConfig> = {
  panic: {
    Icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-white dark:bg-card border-red-500 border-l-4',
    label: 'Panic'
  },
  // ... rest of config
} as const;

export const getAlertConfig = (type: string): AlertConfig => {
  return ALERT_CONFIG[type] || ALERT_CONFIG.default;
};
```

**Benefits**:
- Reusable across Map.tsx, Dashboard, etc.
- Easier to maintain
- Single source of truth

---

### 7. Add Loading and Error States
**Problem**: No loading or error handling

**Solution**: Add proper states
```typescript
interface AlertsPresenterProps {
  alerts: Alert[];
  onAlertClick?: (alertId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const AlertsPresenter = ({ 
  alerts, 
  onAlertClick,
  isLoading = false,
  error = null
}: AlertsPresenterProps) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AlertsHeader alertCount={0} />
        <main className="max-w-lg mx-auto p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AlertsHeader alertCount={0} />
        <main className="max-w-lg mx-auto p-6">
          <Card className="p-8 text-center border-destructive">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className="text-xl font-semibold mb-2">Failed to Load Alerts</h3>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  // ... rest of component
};
```

---

### 8. Improve Collapse State Management
**Problem**: Collapse state not persisted, resets on re-render

**Solution**: Persist to localStorage
```typescript
// Custom hook for persisted collapse state
const usePersistedCollapseState = (categories: string[]) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('alerts-expanded-categories');
      if (saved) {
        return new Set(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('Failed to load collapse state:', err);
    }
    return new Set(categories); // All expanded by default
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        'alerts-expanded-categories',
        JSON.stringify(Array.from(expandedCategories))
      );
    } catch (err) {
      console.warn('Failed to save collapse state:', err);
    }
  }, [expandedCategories]);

  return [expandedCategories, setExpandedCategories] as const;
};

// Usage
const [expandedCategories, setExpandedCategories] = usePersistedCollapseState(
  categories.map(c => c.key)
);
```

---

### 9. Add Sorting Options
**Problem**: Alerts not sorted, appear in random order

**Solution**: Add sorting logic
```typescript
type SortOption = 'time' | 'distance' | 'severity';

const sortAlerts = (alerts: Alert[], sortBy: SortOption): Alert[] => {
  const sorted = [...alerts];
  
  switch (sortBy) {
    case 'time':
      return sorted.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    
    case 'distance':
      return sorted.sort((a, b) => 
        (a.distance_km || Infinity) - (b.distance_km || Infinity)
      );
    
    case 'severity':
      const severityOrder = ['panic', 'amber', 'assault', 'kidnapping', 'fire', 'robbery'];
      return sorted.sort((a, b) => {
        const aIndex = severityOrder.indexOf(a.alert_type);
        const bIndex = severityOrder.indexOf(b.alert_type);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
    
    default:
      return sorted;
  }
};

// In component
const [sortBy, setSortBy] = useState<SortOption>('time');

const sortedAlerts = useMemo(() => 
  sortAlerts(alertsWithDistance, sortBy),
  [alertsWithDistance, sortBy]
);
```

---

### 10. Accessibility Improvements
**Problem**: Missing some ARIA attributes

**Enhancements**:
```typescript
// Add live region for alert count updates
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {alerts.length} active alerts in your area
</div>

// Add landmark roles
<main role="main" className="max-w-lg mx-auto p-6">

// Improve category button
<button
  onClick={() => toggleCategory(category.key)}
  aria-expanded={isExpanded}
  aria-controls={`category-${category.key}-content`}
  aria-label={`${category.label}: ${category.alerts.length} alerts. Click to ${isExpanded ? 'collapse' : 'expand'}`}
>

// Add ID to collapsible content
<div 
  id={`category-${category.key}-content`}
  role="region"
  aria-labelledby={`category-${category.key}-header`}
>
```

---

## 📊 Performance Optimizations

### 11. Virtualize Long Lists
**Problem**: With 100+ alerts, rendering all cards impacts performance

**Solution**: Use react-window for virtualization
```typescript
import { FixedSizeGrid } from 'react-window';

// For large alert lists
{category.alerts.length > 20 ? (
  <FixedSizeGrid
    columnCount={2}
    columnWidth={200}
    height={600}
    rowCount={Math.ceil(category.alerts.length / 2)}
    rowHeight={200}
    width={400}
  >
    {({ columnIndex, rowIndex, style }) => {
      const index = rowIndex * 2 + columnIndex;
      const alert = category.alerts[index];
      if (!alert) return null;
      
      return (
        <div style={style}>
          <AlertCard alert={alert} onClick={handleAlertClick} />
        </div>
      );
    }}
  </FixedSizeGrid>
) : (
  <div className="grid grid-cols-2 gap-4">
    {category.alerts.map(alert => (
      <AlertCard key={alert.id} alert={alert} onClick={handleAlertClick} />
    ))}
  </div>
)}
```

---

### 12. Memoize Alert Cards
**Problem**: Alert cards re-render unnecessarily

**Solution**: Use React.memo
```typescript
export const AlertCard = React.memo(({ alert, onClick }: AlertCardProps) => {
  // ... component code
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.alert.id === nextProps.alert.id &&
    prevProps.alert.created_at === nextProps.alert.created_at &&
    prevProps.onClick === nextProps.onClick
  );
});
```

---

## 🎯 Priority Action Items

### Immediate (Fix Now)
- [ ] Fix hardcoded distance value (critical UX issue)
- [ ] Replace color classes with semantic tokens
- [ ] Add loading and error states

### Short Term (This Week)
- [ ] Extract sub-components (AlertCard, CategorySection, etc.)
- [ ] Implement actual distance calculation
- [ ] Add alert sorting options
- [ ] Persist collapse state to localStorage

### Medium Term (Next Sprint)
- [ ] Move ALERT_CONFIG to shared config file
- [ ] Add virtualization for large lists
- [ ] Improve accessibility with ARIA attributes
- [ ] Add unit tests for utility functions

### Long Term (Future)
- [ ] Add filter options (by type, distance, time)
- [ ] Implement real-time alert animations
- [ ] Add alert detail modal/page
- [ ] Performance monitoring and optimization

---

## 📈 Metrics

### Current State
- Lines of Code: ~300
- Components: 1 (monolithic)
- Cyclomatic Complexity: 8
- Reusability: Low
- Test Coverage: 0%

### Target State
- Lines of Code: ~100 (main component)
- Components: 6+ (modular)
- Cyclomatic Complexity: 3
- Reusability: High
- Test Coverage: 80%+

---

## 💡 Key Takeaways

1. **Component Composition**: Break down into smaller, focused components
2. **Distance Calculation**: Critical for emergency app - must be accurate
3. **Performance**: Virtualization needed for large alert lists
4. **Accessibility**: Add proper ARIA attributes for screen readers
5. **State Management**: Persist user preferences (collapse state, sort order)
6. **Error Handling**: Always handle loading and error states
7. **Type Safety**: Use proper TypeScript types throughout
8. **Reusability**: Extract utilities and configs for use across app

The component is functional but needs refactoring for better maintainability, performance, and user experience. Priority should be fixing the hardcoded distance and extracting sub-components.
