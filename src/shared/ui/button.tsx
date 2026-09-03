import * as React from "react"

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/shared/lib/utils"

/**
 * Nintendo-2001-style button — Elevation 2 "raised chip".
 *  - Radius: rounded-md (6px, --radius 파생)
 *  - Default: amber utility chip + 베벨 상단 하이라이트 (.plate-chip)
 *  - Outline: hairline bordered surface (neutral), not brand-tinted
 *  - Sizes: h-9 default, h-8 sm, h-10 lg + icon variants
 *  hover 는 산문의 button-primary-pressed(amber → nav-gold) 규칙 파생 —
 *  warm 계열은 한 단계 어둡게.
 *
 *  중립 변형(outline / secondary / ghost / ghost-icon)의 hover 는 primary
 *  gold 를 25% 틴트로 깐다. 선택 상태 틴트(bg-primary/20)보다 한 단계만
 *  위 — rest < hover < selected 위계를 크게 뒤집지 않는 선.
 *  텍스트까지 primary 로 바꾸지 않는 이유는 라이트에서
 *  --primary(48 100% 50%) 가 그 틴트 위에서 AA 미달이기 때문 —
 *  배경만 브랜드색을 쓰고 전경은 --foreground 를 유지해 대비를 지킨다.
 *  destructive 는 파괴적 동작을 알리는 의미색이라 amber 로 바꾸지 않는다.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground plate-chip hover:bg-primary/70",
        destructive:
          "bg-destructive text-destructive-foreground plate-chip hover:bg-destructive/70",
        outline:
          "border border-input bg-background text-foreground hover:bg-primary/25 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground border border-border plate-chip hover:bg-primary/25",
        ghost: "hover:bg-primary/25 hover:text-foreground",
        "ghost-icon": "text-muted-foreground hover:bg-primary/25 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-10 px-5",
        icon: "h-10 w-10 [&_svg]:size-5",
        "icon-sm": "h-9 w-9",
        "icon-xs": "h-8 w-8 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
