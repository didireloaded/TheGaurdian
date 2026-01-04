import * as React from 'react';
import * as MenubarPrimitive from '@radix-ui/react-menubar';
import { createComponent, createCompoundComponent } from '@/lib/component-factory';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, Circle } from 'lucide-react';

const menubarVariants = {
  default: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
  transparent: 'bg-transparent',
};

const menubarSizes = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
};

const MenubarRoot = createComponent({
  component: MenubarPrimitive.Root,
  defaultClassName: 'flex h-10 items-center space-x-1 rounded-md p-1',
  variants: menubarVariants,
  sizes: menubarSizes,
});

const MenubarMenu = createComponent({
  component: MenubarPrimitive.Menu,
});

const MenubarTrigger = createComponent({
  component: MenubarPrimitive.Trigger,
  defaultClassName: cn(
    'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none',
    'focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
  ),
});

const MenubarContent = createComponent({
  component: React.forwardRef(({ children, ...props }: MenubarPrimitive.MenubarContentProps, ref) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref as any}
        align="start"
        alignOffset={-4}
        className={cn(
          'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
          'data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2'
        )}
        {...props}
      >
        {children}
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  )),
});

const MenubarItem = createComponent({
  component: React.forwardRef(({ children, ...props }: MenubarPrimitive.MenubarItemProps, ref) => (
    <MenubarPrimitive.Item
      ref={ref as any}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
      )}
      {...props}
    >
      {children}
    </MenubarPrimitive.Item>
  )),
});

const MenubarCheckboxItem = createComponent({
  component: React.forwardRef(({ children, checked, ...props }: MenubarPrimitive.MenubarCheckboxItemProps, ref) => (
    <MenubarPrimitive.CheckboxItem
      ref={ref as any}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
      )}
      checked={checked}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Check className="h-4 w-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )),
});

const MenubarRadioItem = createComponent({
  component: React.forwardRef(({ children, ...props }: MenubarPrimitive.MenubarRadioItemProps, ref) => (
    <MenubarPrimitive.RadioItem
      ref={ref as any}
      className={cn(
        'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  )),
});

const MenubarLabel = createComponent({
  component: React.forwardRef(({ className, ...props }: MenubarPrimitive.MenubarLabelProps, ref) => (
    <MenubarPrimitive.Label
      ref={ref as any}
      className={cn('px-2 py-1.5 text-sm font-semibold', className)}
      {...props}
    />
  )),
});

const MenubarSeparator = createComponent({
  component: MenubarPrimitive.Separator,
  defaultClassName: '-mx-1 my-1 h-px bg-muted',
});

const MenubarShortcut = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />
  ),
});

const Menubar = createCompoundComponent(MenubarRoot, {
  Menu: MenubarMenu,
  Trigger: MenubarTrigger,
  Content: MenubarContent,
  Item: MenubarItem,
  Separator: MenubarSeparator,
  Label: MenubarLabel,
  CheckboxItem: MenubarCheckboxItem,
  RadioItem: MenubarRadioItem,
  Shortcut: MenubarShortcut,
});

export { Menubar };
