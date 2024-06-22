import { Link, useLocation, useParams } from "@remix-run/react";
import {
  AudioLines,
  Boxes,
  LayoutDashboard,
  List,
  Menu,
  Settings,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FlexList } from "./FlexList";

export const MainNavSheet = () => {
  const { bandId } = useParams();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    pathname.includes(path) ? "secondary" : "ghost";

  const isDashboardRoute =
    bandId &&
    ["setlists", "songs", "band-settings"].every(
      (route) => !pathname.includes(route),
    );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Setlists.pro</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <FlexList gap={0}>
          <Button size="sm" variant={isActive("home")} asChild>
            <Link to="/home">
              <Boxes className="pr-2" /> Bands
            </Link>
          </Button>
          {bandId ? (
            <>
              <Button
                size="sm"
                variant={isDashboardRoute ? "secondary" : "ghost"}
                asChild
              >
                <Link to={`/${bandId}`} onClick={() => setOpen(false)}>
                  <LayoutDashboard className="pr-2" />
                  Dashboard
                </Link>
              </Button>
              <Button size="sm" variant={isActive("setlists")} asChild>
                <Link to={`/${bandId}/setlists`} onClick={() => setOpen(false)}>
                  <List className="pr-2" />
                  Setlists
                </Link>
              </Button>
              <Button size="sm" variant={isActive("songs")} asChild>
                <Link to={`/${bandId}/songs`} onClick={() => setOpen(false)}>
                  <AudioLines className="pr-2" /> Songs
                </Link>
              </Button>
              <Button size="sm" variant={isActive("band-settings")} asChild>
                <Link
                  to={`/${bandId}/band-settings`}
                  onClick={() => setOpen(false)}
                >
                  <Settings className="pr-2" /> Band Settings
                </Link>
              </Button>
            </>
          ) : null}
        </FlexList>
      </SheetContent>
    </Sheet>
  );
};
