"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ModelInputProps {
  value: string
  suggestions: string[]
  placeholder?: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function ModelInput({
  value,
  suggestions,
  placeholder = "Select or type model name...",
  onChange,
  disabled = false,
}: ModelInputProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(value)

  // Sync external value changes
  React.useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selectedValue: string): void => {
    setInputValue(selectedValue)
    onChange(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string): void => {
    setInputValue(newValue)
    onChange(newValue)
  }

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.toLowerCase().includes(inputValue.toLowerCase())
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {inputValue !== "" ? inputValue : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type model name..."
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">No matching suggestions</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You can still use:{" "}
                  <span className="font-mono">{inputValue}</span>
                </p>
              </div>
            </CommandEmpty>
            <CommandGroup heading="Suggested Models">
              {filteredSuggestions.map((suggestion) => (
                <CommandItem
                  key={suggestion}
                  value={suggestion}
                  onSelect={() => {
                    handleSelect(suggestion)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      inputValue === suggestion ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-mono text-sm">{suggestion}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
