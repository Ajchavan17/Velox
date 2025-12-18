import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, Check } from "lucide-react"

export interface SelectOption {
    label: string
    value: string
}

export interface SelectProps {
    options: SelectOption[]
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    disabled?: boolean
    id?: string
    align?: 'start' | 'end'
    variant?: 'default' | 'ghost'
}

export function Select({ options, value, onChange, placeholder = "Select...", className, disabled, id, align = 'start', variant = 'default' }: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        // ... existing useEffect ...
    }, []);

    const selectedOption = options.find(o => o.value === value)

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md text-sm transition-colors cursor-pointer",
                    variant === 'default' ? "border border-input bg-background px-3 py-2 shadow-sm ring-offset-background" : "hover:bg-accent hover:text-accent-foreground px-2 py-2",
                    isOpen && variant === 'default' ? "border-primary" : "",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                )}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                id={id}
            >
                <span className={!selectedOption ? "text-muted-foreground" : "truncate"}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
            </div>

            {isOpen && (
                <div className={cn(
                    "absolute top-full z-[100] mt-1 w-full min-w-[max-content] rounded-md border border-input bg-background text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 max-h-60 overflow-auto",
                    align === 'end' ? 'right-0' : 'left-0'
                )}>
                    <div className="p-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                    value === option.value ? "bg-accent text-accent-foreground" : ""
                                )}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="flex-1 truncate">{option.label}</span>
                                {value === option.value && (
                                    <Check className="ml-auto h-4 w-4" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
