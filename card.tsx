import * as React from 'react';
import { createComponent, createCompoundComponent } from '@/lib/component-factory';
import { cn } from '@/lib/utils';

const cardVariants = {
  default: 'bg-card text-card-foreground shadow-sm',
  destructive: 'bg-destructive text-destructive-foreground',
  outline: 'border border-input bg-background',
};

const cardSizes = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
};

const CardRoot = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...props} />
  ),
  variants: cardVariants,
  sizes: cardSizes,
});

const CardHeader = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  ),
});

const CardTitle = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  ),
});

const CardDescription = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  ),
});

const CardContent = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 pt-0', className)} {...props} />
  ),
});

const CardFooter = createComponent({
  component: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
  ),
});

const Card = createCompoundComponent(CardRoot, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
});

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
