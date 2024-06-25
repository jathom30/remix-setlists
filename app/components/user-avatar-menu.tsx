import { Link } from "@remix-run/react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "~/utils";

import { FlexList } from "./FlexList";

export const UserAvatarMenu = () => {
  const user = useUser();
  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              {user.name
                ?.split(" ")
                .map((n) => n[0].toUpperCase())
                .join(" ")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/user-settings">User Settings</Link>
            </DropdownMenuItem>
            <form method="post" action="/logout">
              <DropdownMenuItem asChild className="w-full">
                <button type="submit">Logout</button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              {user.name
                ?.split(" ")
                .map((n) => n[0].toUpperCase())
                .join(" ")}
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <FlexList gap={2}>
              <SheetTitle>{user.name}</SheetTitle>
              <Separator />
              <SheetClose asChild>
                <Button variant="outline" asChild>
                  <Link to="/user-settings">User Settings</Link>
                </Button>
              </SheetClose>
              <form method="post" action="/logout">
                <Button variant="ghost" type="submit" className="w-full">
                  Logout
                </Button>
              </form>
            </FlexList>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
