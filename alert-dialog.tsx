import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { createComponent, createCompoundComponent } from '@/lib/component-factory';
import { cn } from '@/lib/utils';

const alertDialogVariants = {
  default: 'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
  danger: 'bg-red-50 dark:bg-red-900 rounded-lg shadow-lg',
  warning: 'bg-yellow-50 dark:bg-yellow-900 rounded-lg shadow-lg',
};

const alertDialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const AlertDialogRoot = createComponent({
  component: AlertDialogPrimitive.Root,
});

const AlertDialogTrigger = createComponent({
  component: AlertDialogPrimitive.Trigger,
  defaultClassName: 'inline-flex items-center justify-center',
});

const AlertDialogContent = createComponent({
  component: React.forwardRef(({ children, ...props }: AlertDialogPrimitive.AlertDialogContentProps, ref) => (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <AlertDialogPrimitive.Content ref={ref as any} {...props}>
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  )),
  defaultClassName: cn(
    'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
    'w-full p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
  ),
  variants: alertDialogVariants,
  sizes: alertDialogSizes,
});

const AlertDialogHeader = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
  ),
});

const AlertDialogFooter = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  ),
});

const AlertDialogTitle = createComponent({
  component: AlertDialogPrimitive.Title,
  defaultClassName: 'text-lg font-semibold',
});

const AlertDialogDescription = createComponent({
  component: AlertDialogPrimitive.Description,
  defaultClassName: 'text-sm text-gray-500 dark:text-gray-400',
});

const AlertDialogAction = createComponent({
  component: AlertDialogPrimitive.Action,
  defaultClassName: cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'bg-primary text-primary-foreground hover:bg-primary/90',
    'h-10 py-2 px-4'
  ),
});

const AlertDialogCancel = createComponent({
  component: AlertDialogPrimitive.Cancel,
  defaultClassName: cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:pointer-events-none',
    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    'h-10 py-2 px-4'
  ),
});

const AlertDialog = createCompoundComponent(AlertDialogRoot, {
  Trigger: AlertDialogTrigger,
  Content: AlertDialogContent,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Title: AlertDialogTitle,
  Description: AlertDialogDescription,
  Action: AlertDialogAction,
  Cancel: AlertDialogCancel,
});

export { AlertDialog };
