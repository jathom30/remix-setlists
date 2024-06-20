import {
  faBars,
  faHome,
  faList,
  faMusic,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useParams } from "@remix-run/react";
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
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <FontAwesomeIcon icon={faBars} />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Setlists.pro</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <FlexList gap={0}>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/home">
              <FontAwesomeIcon icon={faHome} className="pr-2" /> Home
            </Link>
          </Button>
          {bandId ? (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link to={`/${bandId}/setlists`} onClick={() => setOpen(false)}>
                  <FontAwesomeIcon icon={faList} className="pr-2" /> Setlists
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link to={`/${bandId}/songs`} onClick={() => setOpen(false)}>
                  <FontAwesomeIcon icon={faMusic} className="pr-2" /> Songs
                </Link>
              </Button>
              <Button size="sm" variant="ghost" asChild>
                <Link
                  to={`/${bandId}/band-settings`}
                  onClick={() => setOpen(false)}
                >
                  <FontAwesomeIcon icon={faUsers} className="pr-2" /> Band
                  Settings
                </Link>
              </Button>
            </>
          ) : null}
        </FlexList>
      </SheetContent>
    </Sheet>
  );
};
