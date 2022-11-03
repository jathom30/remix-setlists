import { faCaretLeft, faCaretRight, faChevronLeft, faCog, faList, faMusic, faPlus, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { BandIcon, Setlist, Song, SongsInSets } from "@prisma/client"
import { Link as RemixLink } from "@remix-run/react"
import type { SerializeFrom } from "@remix-run/server-runtime"
import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"
import { useUser } from "~/utils"
import { Avatar } from "./Avatar"
import { Badge } from "./Badge"
import { Button } from "./Button"
import { FlexHeader } from "./FlexHeader"
import { FlexList } from "./FlexList"
import { Label } from "./Label"
import { Link } from "./Link"
import { MaxHeightContainer } from "./MaxHeightContainer"
import { SetlistLink } from "./SetlistLink"
import { SongLink } from "./SongLink"
import { TextOverflow } from "./TextOverflow"

type MainSidebarProps = {
  band: SerializeFrom<{
    name: string;
    icon: BandIcon | null;
  }> | null;
  memberRole: string;
  songs: SerializeFrom<Song>[]
  setlists: SerializeFrom<(Setlist & {
    sets: {
      songs: (SongsInSets & {
        song: {
          length: number;
        } | null;
      })[];
    }[];
  })[]>
}

export const MainSidebar = ({ band, memberRole, songs, setlists }: MainSidebarProps) => {
  const user = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const state = isOpen ? 'open' : 'closed'

  return (
    <AnimatePresence initial={false}>
      <motion.div
        animate={state}
        variants={{
          open: { width: '100%' },
          closed: { width: 72 },
        }}
        className="border-r h-full bg-white w-full max-w-xs flex shadow-md z-10 overflow-hidden"
      >
        <MaxHeightContainer
          header={
            <div className="bg-white border-b flex flex-col">
              <RemixLink className="hover:bg-slate-200" to="/bandSelect">
                <FlexList direction="row" gap={2} pad={4} items="center">
                  {isOpen ? <FontAwesomeIcon icon={faChevronLeft} /> : null}
                  <Avatar icon={band?.icon} bandName={band?.name || ''} size="md" />
                  {isOpen ? (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 }} className="flex flex-col">
                      <TextOverflow className="font-bold text-lg">{band?.name}</TextOverflow>
                      <Badge size="md">{memberRole}</Badge>
                    </motion.div>
                  ) : null}
                </FlexList>
              </RemixLink>
            </div>
          }
          footer={
            <>
              <FlexList pad={4}>
                <Button kind="secondary" onClick={() => setIsOpen(!isOpen)} icon={isOpen ? faCaretLeft : undefined}>
                  {isOpen ? 'Collapse menu' : <FontAwesomeIcon icon={faCaretRight} />}
                </Button>
              </FlexList>
              <div className="border-t p-4">
                <Link to="user" kind="secondary" icon={isOpen ? faUser : undefined}>{isOpen ? user.name : <FontAwesomeIcon icon={faUser} />}</Link>
              </div>
            </>
          }
        >
          <div className="flex flex-col h-full p-4 gap-4 justify-between">
            <FlexList>
              <Link to="band" icon={isOpen ? faCog : undefined} kind="secondary">
                {isOpen ? 'Band Settings' : <FontAwesomeIcon icon={faCog} />}
              </Link>
              {isOpen ? (
                <FlexList gap={2}>
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>
                    <FlexHeader>
                      <Label>Setlists</Label>
                      <Link to="setlists/new" isRounded kind="text"><FontAwesomeIcon icon={faPlus} /></Link>
                    </FlexHeader>
                  </motion.div>
                  <FlexList gap={0}>
                    {setlists.map(setlist => (
                      <div key={setlist.id} className="rounded overflow-hidden">
                        <SetlistLink setlist={setlist} />
                      </div>
                    ))}
                  </FlexList>
                  <Link className="grow" to="setlists">All setlists</Link>
                </FlexList>
              ) : (
                <Link to="setlists">
                  <FontAwesomeIcon icon={faList} />
                </Link>
              )}
              {isOpen ? (
                <FlexList gap={2}>
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>
                    <FlexHeader>
                      <Label>Songs</Label>
                      <Link to="songs/new" isRounded kind="text"><FontAwesomeIcon icon={faPlus} /></Link>
                    </FlexHeader>
                  </motion.div>
                  <FlexList gap={0}>
                    {songs.map(song => (
                      <div key={song.id} className="rounded overflow-hidden">
                        <SongLink song={song} />
                      </div>
                    ))}
                  </FlexList>
                  <Link className="grow" to="songs">All songs</Link>
                </FlexList>
              ) : (
                <Link to="songs">
                  <FontAwesomeIcon icon={faMusic} />
                </Link>
              )}

            </FlexList>

          </div>
        </MaxHeightContainer>
      </motion.div>
    </AnimatePresence>
  )
}