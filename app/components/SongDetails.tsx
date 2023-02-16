import { faTrash } from "@fortawesome/free-solid-svg-icons"
import type { Feel, Song, Link as LinkType, SongsInSets } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node"
import pluralize from "pluralize"
import { useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted"
import { RoleEnum, setlistAutoGenImportanceEnums } from "~/utils/enums"
import { Divider } from "./Divider"
import { FeelTag } from "./FeelTag"
import { FlexList } from "./FlexList"
import { ItemBox } from "./ItemBox"
import { Label } from "./Label"
import { Link } from "./Link"
import { TempoIcons } from "./TempoIcons"
import { Link as RemixLink } from '@remix-run/react'

export const SongDetails = ({ song }: { song: SerializeFrom<Song & { feels: Feel[], sets: SongsInSets[], links: LinkType[] }> }) => {
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB

  return (
    <FlexList pad={4}>
      <FlexList gap={2}>
        <Label>Details</Label>
        <ItemBox>
          <div className="grid grid-cols-[max-content_1fr] items-center gap-2">
            <Label align="right">Name</Label>
            <span>{song.name}</span>

            <Label align="right">Artist</Label>
            <span>{song.author || '--'}</span>

            <Label align="right">Key</Label>
            {song.keyLetter ? <span>{song.keyLetter} {song.isMinor ? 'Minor' : 'Major'}</span> : <span>--</span>}

            <Label align="right">Tempo</Label>
            <TempoIcons tempo={song.tempo} />

            <Label align="right">Length</Label>
            <span>{pluralize('Minutes', song.length, true)}</span>

            <Label align="right">Feels</Label>
            <FlexList direction="row" gap={2} wrap>
              {song.feels.map(feel => (
                <FeelTag key={feel.id} feel={feel} />
              ))}
              {song.feels.length === 0 ? "--" : null}
            </FlexList>

            <Label align="right">Found in</Label>
            {song.sets.length > 0 ? (
              <RemixLink className="link link-accent" to="setlists">{pluralize('setlist', song.sets.length, true)}</RemixLink>
            ) : (
              <span>0 setlists</span>
            )}
          </div>
        </ItemBox>
      </FlexList>

      <Divider />

      <FlexList gap={2}>
        <Label>Notes/Lyrics</Label>
        <ItemBox>
          <FlexList gap={2}>
            {!song.note ? (
              <span>--</span>
            ) : (
              song.note?.split('\n').map((section, i) => (
                <p key={i}>{section}</p>
              ))
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
                {song.links.map(link => (
                  <a
                    className="link link-accent"
                    key={link.id}
                    href={'https://' + link.href}
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
        <Label>Settings</Label>
        <ItemBox>
          <FlexList gap={2} direction="row" items="center">
            <Label>Position</Label>
            <span>{capitalizeFirstLetter(song.position) || 'Other'}</span>
          </FlexList>
          <FlexList gap={2} direction="row" items="center">
            <Label>Setlist auto-generation importance</Label>
            <span>{setlistAutoGenImportanceEnums[song.rank as keyof typeof setlistAutoGenImportanceEnums]}</span>
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
                <p className="text-sm text-text-subdued">Once you delete this song, it will be removed from this band and any setlists it was used in.</p>
              </FlexList>
              <Link to="delete" kind="error" type="submit" icon={faTrash}>Delete</Link>
            </FlexList>
          </ItemBox>
        </FlexList>
      ) : null}
    </FlexList >
  )
}