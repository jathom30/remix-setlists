import { Link, useParams } from "@remix-run/react";
import {
  CircleMinus,
  EllipsisVertical,
  MicVocal,
  Pencil,
  Replace,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemberRole } from "~/utils";
import { TSong } from "~/utils/dnd";
import { RoleEnum } from "~/utils/enums";

import { SongDetailsSheet } from "./song-details-sheet";

export const SongActions = ({
  song,
  onRemove,
  onSwap,
}: {
  song: TSong;
  onRemove: () => void;
  onSwap: () => void;
}) => {
  const { setlistId } = useParams();
  const [showDetails, setShowDetails] = useState(false);
  const isSub = useMemberRole() === RoleEnum.SUB;

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Song Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => setShowDetails(true)}>
              <MicVocal className="h-4 w-4 mr-2" />
              Details
            </DropdownMenuItem>
            {!isSub ? (
              <>
                {" "}
                <DropdownMenuItem asChild>
                  <Link
                    to={{
                      pathname: `/${song.bandId}/songs/${song.id}/edit`,
                      search: `?redirectTo=${`/${song.bandId}/setlists/${setlistId}`}`,
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSwap}>
                  <Replace className="h-4 w-4 mr-2" />
                  Swap
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove}>
                  <CircleMinus className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <SongDetailsSheet
        song={song}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </div>
  );
};
