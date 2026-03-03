"use client"

import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option))
    } else {
      onChange([...selected, option])
    }
  }

  const handleRemove = (option: string) => {
    onChange(selected.filter((s) => s !== option))
  }

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      // If all selected, deselect all
      onChange([])
    } else {
      // Otherwise, select all
      onChange([...options])
    }
  }

  const allSelected = selected.length === options.length && options.length > 0

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-transparent"
          >
            <span className="text-muted-foreground">
              {selected.length === 0
                ? "Select keywords..."
                : `${selected.length} keyword${selected.length !== 1 ? "s" : ""} selected`}
            </span>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder="Search keywords..." />
            <CommandList>
              <CommandEmpty>No keywords found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                <CommandItem onSelect={handleSelectAll} className="font-semibold">
                  <Check className={cn("mr-2 size-4", allSelected ? "opacity-100" : "opacity-0")} />
                  <span>Select All</span>
                </CommandItem>
                <CommandSeparator className="my-1" />
                {options.map((option) => (
                  <CommandItem key={option} value={option} onSelect={() => handleSelect(option)}>
                    <Check className={cn("mr-2 size-4", selected.includes(option) ? "opacity-100" : "opacity-0")} />
                    <span className="font-mono text-sm">{option}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((option) => (
            <Badge key={option} variant="secondary" className="flex items-center gap-1.5 font-mono">
              {option}
              <button type="button" onClick={() => handleRemove(option)} className="ml-1 rounded-full hover:bg-muted">
                <X className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
