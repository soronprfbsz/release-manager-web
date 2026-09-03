import * as React from "react"

import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/shared/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

export interface ComboboxGroup {
  /** 그룹 헤딩. 생략 시 헤딩 없이 항목만 렌더 (예: "없음" 단독 항목) */
  heading?: string
  options: ComboboxOption[]
}

export interface ComboboxProps {
  /** 플랫 옵션 (하위호환). groups 를 주면 무시된다. */
  options?: ComboboxOption[]
  /** 그룹 옵션. 주어지면 헤딩별로 렌더된다. */
  groups?: ComboboxGroup[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

export function Combobox({
  options,
  groups,
  value,
  onValueChange,
  placeholder = "선택하세요...",
  searchPlaceholder = "검색...",
  emptyText = "결과가 없습니다.",
  disabled = false,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  // groups 우선, 없으면 flat options 를 단일 그룹으로 취급
  const resolvedGroups: ComboboxGroup[] = groups ?? [{ options: options ?? [] }]
  const selectedOption = resolvedGroups
    .flatMap((group) => group.options)
    .find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            !selectedOption && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate text-left overflow-hidden">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          {/* CommandList 기본 max-h 는 고정 300px 이라 창 높이가 낮으면 팝오버가
              화면 밖으로 넘친다. 사용 가능한 높이(검색 입력 + 테두리 몫 3.5rem 제외)와
              300px 중 작은 값으로 묶는다. var 미측정 시점 대비로 100vh 폴백을 둔다. */}
          <CommandList
            className="max-h-[min(300px,calc(var(--radix-popover-content-available-height,100vh)_-_3.5rem))]"
            onWheel={(e) => e.stopPropagation()}
          >
            <CommandEmpty>{emptyText}</CommandEmpty>
            {resolvedGroups.map((group, groupIndex) => (
              <CommandGroup key={group.heading ?? `__group_${groupIndex}`} heading={group.heading}>
                {group.options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      const newValue = option.value === value ? "" : option.value
                      onValueChange?.(newValue)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
