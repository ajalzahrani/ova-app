import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value]
    );
  };

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className="w-full justify-between"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}>
        {selected.length > 0 ? `${selected.length} selected` : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {isOpen && (
        <div className="absolute mt-1 w-full z-10  bg-black/80 border rounded-md shadow-lg">
          <div className="p-2">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center p-2 cursor-pointer hover:bg-gray-600"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {option.label}
              </div>
            ))}
          </div>
          {selected.length > 0 && (
            <div className="p-2 flex flex-wrap gap-1 border-t">
              {selected.map((value) => {
                const option = options.find((o) => o.value === value);
                return option ? (
                  <Badge key={value} variant="secondary" className="mr-1 mb-1">
                    {option.label}
                    <button
                      type="button"
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(value);
                      }}>
                      ✕
                    </button>
                  </Badge>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
