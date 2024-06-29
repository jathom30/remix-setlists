import { Link, useLoaderData } from "@remix-run/react";
import {
  AreaChart,
  AudioLines,
  Copy,
  EllipsisVertical,
  ExternalLink,
  LinkIcon,
  Pencil,
  Shrink,
  Trash,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FlexList } from "../FlexList";

import { CloneSetlistForm } from "./clone-setlist-form";
import { DeleteSetlistForm } from "./delete-setlist-form";
import { EditNameForm } from "./edit-name-form";
import { setlistLoader } from "./loader.server";
import { PublicLink } from "./public-link";

export const SetlistActions = ({
  showAvailableSongs,
  onShowAvailableSongChange,
  isDesktop = false,
}: {
  showAvailableSongs: boolean;
  onShowAvailableSongChange: (show: boolean) => void;
  isDesktop?: boolean;
}) => {
  const { setlist, setlistLink } = useLoaderData<typeof setlistLoader>();
  const [showEditName, setShowEditName] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy);

  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Setlist Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {!isDesktop ? (
                <DropdownMenuItem
                  onClick={() => onShowAvailableSongChange(!showAvailableSongs)}
                >
                  <AudioLines className="h-4 w-4 mr-2" />
                  {showAvailableSongs
                    ? "Hide Available Song Panel"
                    : "Add Songs"}
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => setShowEditName(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="metrics">
                  <AreaChart className="h-4 w-4 mr-2" />
                  Metrics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(setlistLink)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPublicLink(true)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {setlist.isPublic ? "View Public Link" : "Create Public Link"}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="condensed">
                  <Shrink className="h-4 w-4 mr-2" />
                  Condensed View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowClone(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Clone Setlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDelete(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Setlist
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Setlist Actions</SheetTitle>
            </SheetHeader>
            <FlexList gap={0}>
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  onClick={() => onShowAvailableSongChange(!showAvailableSongs)}
                >
                  <AudioLines className="h-4 w-4 mr-2" />
                  {showAvailableSongs
                    ? "Hide Available Song Panel"
                    : "Add Songs"}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={() => setShowEditName(true)} variant="ghost">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Name
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link to="metrics">
                    <AreaChart className="h-4 w-4 mr-2" />
                    Metrics
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => onCopy(setlistLink)}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowPublicLink(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {setlist.isPublic ? "View Public Link" : "Create Public Link"}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" asChild>
                  <Link to="condensed">
                    <Shrink className="h-4 w-4 mr-2" />
                    Condensed View
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowClone(true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Setlist
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowDelete(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Setlist
                </Button>
              </SheetClose>
            </FlexList>
          </SheetContent>
        </Sheet>
      </div>
      <Dialog open={showEditName} onOpenChange={setShowEditName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>Edit the name of the setlist</DialogDescription>
          </DialogHeader>
          <EditNameForm name={setlist.name}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowEditName(false)}>
                Save
              </Button>
            </DialogFooter>
          </EditNameForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Setlist?</DialogTitle>
            <DialogDescription>
              This is a perminent action and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DeleteSetlistForm>
            <DialogFooter>
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </DeleteSetlistForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showClone} onOpenChange={setShowClone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Setlist</DialogTitle>
            <DialogDescription>
              Clone this setlist to create a new identical one.
            </DialogDescription>
          </DialogHeader>
          <CloneSetlistForm>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowClone(false)}>
                Clone
              </Button>
            </DialogFooter>
          </CloneSetlistForm>
        </DialogContent>
      </Dialog>

      <PublicLink open={showPublicLink} onOpenChange={setShowPublicLink} />
    </div>
  );
};
