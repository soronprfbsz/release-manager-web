import * as React from "react"

import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/shared/lib/utils"

const Tabs = TabsPrimitive.Root

/**
 * TabsList — Backstage 언더라인 스타일 (rm-tabs).
 *  - default: 자체 border-b 포함
 *  - line: TabsBar wrapper 가 border-b 책임 — 중복 방지
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
            "flex w-full h-[60px] items-center justify-start gap-2 px-2 text-muted-foreground",
            variant === 'default' && "border-b border-border",
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

/**
 * TabsTrigger — Backstage 언더라인 active state.
 *   active: border-primary, text-foreground, font-semibold
 *   inactive: border-transparent, muted-foreground
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
            "inline-flex h-full items-center justify-center gap-1.5 whitespace-nowrap border-b-2 border-transparent -mb-px text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            "hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:font-semibold",
            variant === 'default' && "px-3",
            variant === 'line' && "px-5 py-4",
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

/**
 * TabsBar — `variant="line"` 탭을 감싸는 헤더 바.
 *  - 카드 전체 너비 border-b 구분선
 *  - 좌측 미세 padding (pl-2) + 우측 padding (pr-8)
 *  - 우측에 검색·필터 함께 배치 가능 (flex justify-between)
 */
const TabsBar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex items-center justify-between gap-4 w-full border-b border-border pl-2 pr-8",
            className
        )}
        {...props}
    />
))
TabsBar.displayName = 'TabsBar'

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsBar }
