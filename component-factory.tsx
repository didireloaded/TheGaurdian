import * as React from 'react';
import { cn } from '@/lib/utils';

type BaseProps = {
  className?: string;
  children?: React.ReactNode;
};

type VariantProps<V> = {
  variant?: V;
  size?: 'sm' | 'md' | 'lg';
};

export type ComponentFactory = <
  P extends BaseProps,
  V extends string = never
>(options: {
  component: React.ForwardRefRenderFunction<any, P>;
  defaultClassName?: string;
  variants?: Record<V, string>;
  sizes?: Record<'sm' | 'md' | 'lg', string>;
}) => React.ForwardRefExoticComponent<P & VariantProps<V>>;

export const createComponent: ComponentFactory = ({
  component,
  defaultClassName = '',
  variants = {},
  sizes = {},
}) => {
  return React.forwardRef((props: any, ref) => {
    const { className, variant, size, ...rest } = props;
    
    const variantClassName = variant ? variants[variant] : '';
    const sizeClassName = size ? sizes[size] : '';
    
    const mergedClassName = cn(
      defaultClassName,
      variantClassName,
      sizeClassName,
      className
    );

    return component({ ...rest, className: mergedClassName, ref }, ref);
  });
};

export const createCompoundComponent = <P extends BaseProps>(
  component: React.ComponentType<P>,
  subComponents: Record<string, React.FC<any>>
) => {
  const MainComponent = component as any;

  Object.entries(subComponents).forEach(([key, Component]) => {
    (MainComponent as any)[key] = Component;
  });

  return MainComponent as typeof MainComponent & Record<string, React.FC<any>>;
};

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback: React.ReactNode
) => {
  return class ErrorBoundary extends React.Component<P, { hasError: boolean }> {
    constructor(props: P) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Component Error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return fallback;
      }

      return <Component {...this.props} />;
    }
  };
};