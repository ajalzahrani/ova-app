import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { debounce } from "lodash";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface SearchInputProps<T> {
  options: T[];
  onSelect: (option: T | null) => void;
  renderOption: (option: T) => React.ReactNode;
  filterOption: (option: T, searchTerm: string) => boolean;
  getOptionLabel: (option: T) => string;
  icon?: ReactNode;
  clear?: boolean;
  initialValue?: T;
  name?: string;
  onChange?: (e: { target: { name?: string; value: string } }) => void;
  value?: string;
}

// Define the ref type with a reset method
export interface SearchInputRef {
  reset: () => void;
  setSearchTerm: (value: string) => void;
}

// Convert to forwardRef to allow parent components to access internal methods
const SearchInput = forwardRef<SearchInputRef, SearchInputProps<any>>(
  function SearchInput<T>(
    {
      options,
      onSelect,
      renderOption,
      filterOption,
      getOptionLabel,
      icon,
      clear,
      initialValue,
      name,
      onChange,
      value: externalValue,
    }: SearchInputProps<T>,
    ref: React.Ref<SearchInputRef>
  ) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredOptions, setFilteredOptions] = useState<T[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedOption, setSelectedOption] = useState<T | null>(
      initialValue || null
    );
    const [hiddenInputValue, setHiddenInputValue] = useState("");

    // Expose the reset method to parent components
    useImperativeHandle(ref, () => ({
      reset: () => {
        setSearchTerm("");
        setFilteredOptions([]);
        setSelectedOption(null);
        setHiddenInputValue("");
        // Inform parent component that selection has been cleared
        onSelect(null as any);

        // Trigger onChange for React Hook Form
        if (onChange && name) {
          onChange({ target: { name, value: "" } });
        }
      },
      setSearchTerm: (value: string) => {
        setSearchTerm(value);
      },
    }));

    const debouncedSearch = useMemo(
      () =>
        debounce((value: string) => {
          setSearchTerm(value);
        }, 70),
      []
    );

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      debouncedSearch(e.target.value);
    };

    const handleOptionClick = useCallback(
      (option: T) => {
        const optionId = (option as any).id || "";

        setSearchTerm(getOptionLabel(option));
        setFilteredOptions([]);
        setSelectedOption(option);
        setHiddenInputValue(optionId);
        onSelect(option);

        // Trigger onChange for React Hook Form
        if (onChange && name) {
          onChange({ target: { name, value: optionId } });
        }
      },
      [getOptionLabel, onSelect, onChange, name]
    );

    const clearInput = () => {
      setSearchTerm("");
      setFilteredOptions([]);
      setSelectedOption(null);
      setHiddenInputValue("");

      // Notify parent that selection was cleared
      onSelect(null);

      // Trigger onChange for React Hook Form
      if (onChange && name) {
        onChange({ target: { name, value: "" } });
      }
    };

    useEffect(() => {
      const isExactMatch = options.some(
        (option) => getOptionLabel(option) === searchTerm
      );

      if (isExactMatch) {
        setFilteredOptions([]);
      } else if (searchTerm.length >= 3 || searchTerm === "%%%") {
        let filtered = options.filter((option) =>
          filterOption(option, searchTerm)
        );
        if (searchTerm === "%%%") {
          filtered = options;
        }

        setFilteredOptions(filtered.slice(0, 10));
      } else {
        setFilteredOptions([]);
      }
    }, [searchTerm, options, filterOption, getOptionLabel]);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsFocused(false);
          setFilteredOptions([]);
        }
      };

      const handleClickOutside = (e: MouseEvent) => {
        if (
          e.target instanceof Node &&
          !containerRef.current?.contains(e.target)
        ) {
          setIsFocused(false);
          setFilteredOptions([]);
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleFocus = () => {
      setIsFocused(true);
      setFilteredOptions(options.slice(0, 10)); // Show initial options
    };

    return (
      <div className="relative" ref={containerRef}>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className="w-full pl-10 pr-10"
          />
          {/* Hidden input to store the actual value for form submission */}
          <input
            type="hidden"
            name={name}
            value={hiddenInputValue}
            onChange={() => {}}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {(isFocused || filteredOptions.length > 0) && (
          <ul className="absolute z-10 w-full max-h-40 overflow-y-auto border border-gray-900 rounded-md mt-1 bg-gray-900 shadow-lg">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-800 cursor-pointer"
                onClick={() => handleOptionClick(option)}>
                {renderOption(option)}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

export default SearchInput;
