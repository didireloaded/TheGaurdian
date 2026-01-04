import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { createComponent, createCompoundComponent } from '@/lib/component-factory';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const dialogVariants = {
  default: 'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
  alert: 'bg-red-50 dark:bg-red-900 rounded-lg shadow-lg',
  form: 'bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-lg w-full',
};

const dialogSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const DialogRoot = createComponent({
  component: DialogPrimitive.Root,
});

const DialogTrigger = createComponent({
  component: DialogPrimitive.Trigger,
  defaultClassName: 'inline-flex items-center justify-center',
});

const DialogContent = createComponent({
  component: React.forwardRef(({ children, ...props }: DialogPrimitive.DialogContentProps, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <DialogPrimitive.Content ref={ref as any} {...props}>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )),
  defaultClassName: cn(
    'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
    'w-full p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]'
  ),
  variants: dialogVariants,
  sizes: dialogSizes,
});

const DialogHeader = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
  ),
});

const DialogFooter = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
  ),
});

const DialogTitle = createComponent({
  component: DialogPrimitive.Title,
  defaultClassName: 'text-lg font-semibold leading-none tracking-tight',
});

const DialogDescription = createComponent({
  component: DialogPrimitive.Description,
  defaultClassName: 'text-sm text-gray-500 dark:text-gray-400',
});

const Dialog = createCompoundComponent(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Footer: DialogFooter,
  Title: DialogTitle,
  Description: DialogDescription,
});

export {
  Dialog,
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
};
