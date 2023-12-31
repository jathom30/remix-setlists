import {
  faExpand,
  faInfoCircle,
  faTimes,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type {
  Feel,
  Song,
  Link as LinkType,
  SongsInSets,
  Setlist,
} from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { Link as RemixLink } from "@remix-run/react";
import pluralize from "pluralize";
import { useState } from "react";

import { useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { RoleEnum, setlistAutoGenImportanceEnums } from "~/utils/enums";

import { Button } from "./Button";
import { Divider } from "./Divider";
import { FeelTag } from "./FeelTag";
import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList";
import { ItemBox } from "./ItemBox";
import { Label } from "./Label";
import { Link } from "./Link";
import { Modal } from "./Modal";
import { Navbar } from "./Navbar";
import { SongSettingsInfo } from "./SongSettingsInfo";
import { TempoIcons } from "./TempoIcons";

export const SongDetails = ({
  song,
  setlists,
}: {
  song: SerializeFrom<
    Song & { feels: Feel[]; sets: SongsInSets[]; links: LinkType[] }
  >;
  setlists: Pick<Setlist, "id" | "name" | "editedFromId">[] | undefined;
}) => {
  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;
  const [showSettingsInfo, setShowSettingsInfo] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);

  const visibleSetlists = setlists?.filter((setlist) => !setlist.editedFromId);
  return (
    <>
      <FlexList pad={4}>
        <FlexList gap={2}>
          <Label>Details</Label>
          <ItemBox>
            <div className="grid grid-cols-[max-content_1fr] items-center gap-2">
              <Label align="right">Name</Label>
              <span>{song.name}</span>

              <Label align="right">Artist</Label>
              <span>{song.author || "--"}</span>

              <Label align="right">Key</Label>
              {song.keyLetter ? (
                <span>
                  {song.keyLetter} {song.isMinor ? "Minor" : "Major"}
                </span>
              ) : (
                <span>--</span>
              )}

              <Label align="right">Tempo</Label>
              <TempoIcons tempo={song.tempo} />

              <Label align="right">Length</Label>
              <span>{pluralize("Minutes", song.length, true)}</span>

              <Label align="right">Feels</Label>
              <FlexList direction="row" gap={2} wrap>
                {song.feels.map((feel) => (
                  <FeelTag key={feel.id} feel={feel} />
                ))}
                {song.feels.length === 0 ? "--" : null}
              </FlexList>

              <Label align="right">Found in</Label>
              {visibleSetlists?.length ? (
                <RemixLink className="link link-accent" to="setlists">
                  {pluralize("setlist", visibleSetlists.length, true)}
                </RemixLink>
              ) : (
                <span>0 setlists</span>
              )}
            </div>
          </ItemBox>
        </FlexList>

        <Divider />

        <FlexList gap={2}>
          <FlexHeader>
            <Label>Notes/Lyrics</Label>
            {song.note?.length ? (
              <Button onClick={() => setShowNotesModal(true)}>
                <FontAwesomeIcon icon={faExpand} />
              </Button>
            ) : null}
          </FlexHeader>
          <ItemBox>
            <FlexList gap={2}>
              {!song.note ? (
                <span>--</span>
              ) : (
                song.note
                  ?.split("\n")
                  .map((section, i) => <p key={i}>{section}</p>)
              )}
            </FlexList>
          </ItemBox>
        </FlexList>

        <Divider />

        {song.links.length ? (
          <>
            <FlexList gap={2}>
              <Label>Links</Label>
              <ItemBox>
                <FlexList gap={2}>
                  {song.links.map((link) => (
                    <a
                      className="link link-accent"
                      key={link.id}
                      href={"https://" + link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.href}
                    </a>
                  ))}
                </FlexList>
              </ItemBox>
            </FlexList>

            <Divider />
          </>
        ) : null}

        <FlexList gap={2}>
          <FlexList direction="row" gap={2} items="center">
            <Label>Auto-magical setlist creation options</Label>
            <Button
              onClick={() => setShowSettingsInfo(true)}
              kind="ghost"
              isRounded
            >
              <FontAwesomeIcon icon={faInfoCircle} />
            </Button>
          </FlexList>
          <ItemBox>
            <FlexList gap={2} direction="row" items="center">
              <Label>Position</Label>
              <span>{capitalizeFirstLetter(song.position) || "Other"}</span>
            </FlexList>
            <FlexList gap={2} direction="row" items="center">
              <Label>Importance</Label>
              <span>
                {
                  setlistAutoGenImportanceEnums[
                    song.rank as keyof typeof setlistAutoGenImportanceEnums
                  ]
                }
              </span>
            </FlexList>
          </ItemBox>
        </FlexList>

        <Divider />

        {!isSub ? (
          <FlexList gap={2}>
            <Label isDanger>Danger zone</Label>
            <ItemBox>
              <FlexList>
                <FlexList>
                  <span className="font-bold">Delete this song</span>
                  <p className="text-sm text-text-subdued">
                    Once you delete this song, it will be removed from this band
                    and any setlists it was used in.
                  </p>
                </FlexList>
                <Link to="delete" kind="error" type="submit" icon={faTrash}>
                  Delete
                </Link>
              </FlexList>
            </ItemBox>
          </FlexList>
        ) : null}
      </FlexList>
      <Modal
        isPortal
        open={showSettingsInfo}
        onClose={() => setShowSettingsInfo(false)}
      >
        <SongSettingsInfo onClose={() => setShowSettingsInfo(false)} />
      </Modal>
      <Modal
        isPortal
        onClose={() => setShowNotesModal(false)}
        open={showNotesModal}
      >
        <Navbar>
          <FlexHeader>
            <Label>{song.name}</Label>
            <Button
              isRounded
              kind="ghost"
              onClick={() => setShowNotesModal(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </FlexHeader>
        </Navbar>
        <FlexList pad={4}>
          {song.note?.split("\n").map((section, i) => <p key={i}>{section}</p>)}
        </FlexList>
      </Modal>
    </>
  );
};
