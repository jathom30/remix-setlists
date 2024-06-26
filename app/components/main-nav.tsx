import { Link, useLocation, useParams } from "@remix-run/react";
import {
  AudioLines,
  Boxes,
  Dna,
  LayoutDashboard,
  List,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { FlexList } from "./FlexList";

export const MainNav = () => {
  const { bandId } = useParams();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    pathname.includes(path) ? "secondary" : "ghost";

  const isDashboardRoute =
    bandId &&
    ["setlists", "songs", "band-settings", "feels"].every(
      (route) => !pathname.includes(route),
      ``,
    );
  return (
    <FlexList direction="row" gap={2}>
      <Button size="sm" variant="ghost" asChild>
        <Link to="/home">
          <Boxes className="pr-2" /> Bands
        </Link>
      </Button>
      <Button
        size="sm"
        variant={isDashboardRoute ? "secondary" : "ghost"}
        asChild
      >
        <Link to={`/${bandId}`}>
          <LayoutDashboard className="pr-2" />
          Dashboard
        </Link>
      </Button>
      <Button size="sm" variant={isActive("setlists")} asChild>
        <Link to={`/${bandId}/setlists`}>
          <List className="pr-2" />
          Setlists
        </Link>
      </Button>
      <Button size="sm" variant={isActive("songs")} asChild>
        <Link to={`/${bandId}/songs`}>
          <AudioLines className="pr-2" />
          Songs
        </Link>
      </Button>
      <Button size="sm" variant={isActive("feels")} asChild>
        <Link to={`/${bandId}/feels`}>
          <Dna className="pr-2" />
          Feels
        </Link>
      </Button>
      <Button size="sm" variant={isActive("band-settings")} asChild>
        <Link to={`/${bandId}/band-settings`}>
          <Settings className="pr-2" />
          Settings
        </Link>
      </Button>
    </FlexList>
  );
};
