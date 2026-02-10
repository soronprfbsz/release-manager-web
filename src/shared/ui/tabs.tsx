import * as React from "react"

import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/shared/lib/utils"

const Tabs = TabsPrimitive.Root

/**
 * TabsList variants:
 * - default: 기본 pill 스타일 (bg-muted, rounded)
 * - line: 언더라인 스타일 (border-b, transparent bg)
 */
interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
    variant?: 'default' | 'line'
}

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    TabsListProps
>(({ className, variant = 'default', ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex items-center text-muted-foreground",
            variant === 'default' && "h-10 justify-center rounded-md bg-muted p-1",
            variant === 'line' && "w-full justify-start rounded-none bg-transparent h-auto p-0 py-2",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger variants:
 * - default: 기본 pill 스타일
 * - line: 언더라인 스타일 (border-b-2, 탭 활성 시 primary 색상)
 */
interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
    variant?: 'default' | 'line'
}

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    TabsTriggerProps
>(({ className, variant = 'default', ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            variant === 'default' && "rounded-sm px-3 py-1.5 border-b-2 border-transparent hover:border-primary/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow data-[state=active]:border-primary",
            variant === 'line' && "rounded-none px-6 py-3 border-b-2 border-transparent hover:border-primary/60 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-foreground",
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "pt-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
