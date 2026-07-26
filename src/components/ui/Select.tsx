import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

interface SelectOption<T extends string> {
  value: T
  label: string
}

interface SelectProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SelectOption<T>[]
  label: string
}

/** Keyboard- and screen-reader-accessible dropdown, styled to match our tokens. */
export function Select<T extends string>({ value, onChange, options, label }: SelectProps<T>) {
  return (
    <RadixSelect.Root value={value} onValueChange={(v) => onChange(v as T)}>
      <RadixSelect.Trigger
        aria-label={label}
        className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
      >
        <RadixSelect.Value />
        <RadixSelect.Icon>
          <ChevronDown size={14} className="text-gray-500" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={4}
          className="z-[60] max-h-64 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-300 outline-none data-[highlighted]:bg-white/10 data-[highlighted]:text-white data-[state=checked]:text-purple-300"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
                  <Check size={13} />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
