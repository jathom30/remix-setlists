import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FlexList } from "./FlexList";

const sortOptions = [
  {
    label: "Updated: Newest first",
    value: "updatedAt:desc",
    Icon: ArrowDown01,
  },
  {
    label: "Updated: Oldest first",
    value: "updatedAt:asc",
    Icon: ArrowUp01,
  },
  { label: "Name: A-Z", value: "name:asc", Icon: ArrowDownAZ },
  { label: "Name: Z-A", value: "name:desc", Icon: ArrowUpAZ },
];

export const SortItems = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options?: { label: string; value: string; Icon: React.FC }[];
  onChange: (val: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Setlist Sort</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
                {sortOptions.map(({ label, value: val, Icon }) => (
                  <DropdownMenuRadioItem key={val} value={val}>
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Setlist Sort</SheetTitle>
              <SheetDescription>
                <RadioGroup
                  value={value}
                  onValueChange={(val) => {
                    onChange(val);
                    setOpen(false);
                  }}
                >
                  <FlexList gap={0}>
                    {(options || sortOptions).map(
                      ({ label, value: val, Icon }) => (
                        <div
                          key={val}
                          className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
                        >
                          <FlexList direction="row" items="center" gap={2}>
                            <RadioGroupItem value={val} id={val} />
                            <Label
                              className="w-full text-start flex"
                              htmlFor={val}
                            >
                              <Icon className="w-4 h-4 mr-2" />
                              {label}
                            </Label>
                          </FlexList>
                        </div>
                      ),
                    )}
                  </FlexList>
                </RadioGroup>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
