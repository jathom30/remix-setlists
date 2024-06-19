import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Feel } from "@prisma/client";
import { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const MultiSelectFeel = ({
  feels,
  values,
  onChange,
}: {
  feels: Jsonify<Feel>[];
  values: string[];
  onChange: (value: string[]) => void;
}) => {
  const [query, setQuery] = useState("");

  const displayValue = values.length
    ? values
        .map((val) => feels.find((feel) => feel.id === val)?.label)
        .join(", ")
    : "Select feel...";

  const filteredFeels = feels.filter((feel) =>
    feel.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`justify-between font-normal ${
            values.length ? "" : "text-muted-foreground"
          }`}
        >
          {displayValue}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-3 w-3 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feels..."
            className=" focus-visible:ring-inset focus-visible:ring-0"
          />
          <CommandList>
            <CommandEmpty>No feels found.</CommandEmpty>
            <CommandGroup>
              {filteredFeels.map((feel) => (
                <CommandItem
                  key={feel.id}
                  value={feel.id}
                  onSelect={(currentValue) => {
                    const newValues = values.includes(currentValue)
                      ? values.filter((val) => val !== currentValue)
                      : [...values, currentValue];
                    onChange(newValues);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(feel.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {feel.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
