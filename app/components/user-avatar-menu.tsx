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
import { useUser } from "~/utils";

export const UserAvatarMenu = () => {
  const user = useUser();
  return (
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
  );
};
