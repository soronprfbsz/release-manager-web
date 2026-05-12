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
            // line variant 는 자체 width / border 안 가짐 — TabsBar wrapper 가 책임
            variant === 'line' && "justify-start rounded-none bg-transparent h-auto p-0",
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
            // active 시 텍스트 색상 / 볼드는 두 variant 공통 — 페이지별 중복 정의 제거 목적
            "data-[state=active]:text-primary data-[state=active]:font-bold",
            variant === 'default' && "rounded-sm px-3 py-1.5 border-b-2 border-transparent hover:border-primary/60 data-[state=active]:bg-background data-[state=active]:shadow data-[state=active]:border-primary",
            variant === 'line' && "rounded-none px-5 py-4 border-b-2 border-transparent hover:border-primary/60 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
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
 * TabsBar — `variant="line"` 탭을 감싸는 표준 헤더 바.
 *  - 카드 전체 너비 border-b 구분선
 *  - 좌측 미세 padding (pl-2) + 우측 padding (pr-8)
 *  - 우측에 검색·필터 컴포넌트 함께 배치 가능 (flex justify-between)
 *
 * 사용 예:
 *   <TabsBar>
 *     <TabsList variant="line">...</TabsList>
 *     <Filters />
 *   </TabsBar>
 */
const TabsBar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex items-center justify-between gap-4 w-full border-b pl-2 pr-8",
            className
        )}
        {...props}
    />
))
TabsBar.displayName = 'TabsBar'

export { Tabs, TabsList, TabsTrigger, TabsContent, TabsBar }
