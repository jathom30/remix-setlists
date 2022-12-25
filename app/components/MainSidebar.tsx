import { faCaretLeft, faCaretRight, faCheck, faCog, faList, faMusic, faPlus, faSort, faUser } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { BandIcon, Setlist, Song, SongsInSets } from "@prisma/client"
import { Popover } from 'react-tiny-popover'
import type { SerializeFrom } from "@remix-run/server-runtime"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react";
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
import { useLocation, Link as RemixLink, useParams } from "@remix-run/react"

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
  })[]>;
  bands: SerializeFrom<{
    name: string;
    icon: BandIcon | null;
    id: string;
    members: {
      role: string;
    }[];
  }>[]
}

export const MainSidebar = ({ band, memberRole, songs, setlists, bands }: MainSidebarProps) => {
  const user = useUser()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
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
            <div className="bg-white border-b flex items-center justify-center">
              <Popover
                isOpen={isPopupOpen}
                positions={['right']}
                padding={8}
                onClickOutside={() => setIsPopupOpen(false)}
                content={<BandSelectPopup bands={bands} />}
              >
                <button className="w-full hover:bg-slate-100" onClick={() => setIsPopupOpen(!isPopupOpen)}>
                  <BandOption band={band} isCollapsed={!isOpen} memberRole={memberRole}>
                    <FontAwesomeIcon icon={faSort} />
                  </BandOption>
                </button>
              </Popover>
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
                    {setlists.length ? (
                      setlists.map(setlist => (
                        <div key={setlist.id} className="rounded overflow-hidden">
                          <SetlistLink setlist={setlist} />
                        </div>
                      ))
                    ) : (
                      <span>No recent setlists</span>
                    )}
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
                    {songs.length ? (
                      songs.map(song => (
                        <div key={song.id} className="rounded overflow-hidden">
                          <SongLink song={song} />
                        </div>
                      ))
                    ) : (
                      <span>No recent songs</span>
                    )}
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

const BandSelectPopup = ({ bands }: { bands: MainSidebarProps['bands'] }) => {
  const { bandId } = useParams()
  const { pathname } = useLocation()
  const isSelected = (bandId: MainSidebarProps['bands'][number]['id']) => pathname.includes(bandId)
  return (
    <div className="bg-white rounded shadow-md">
      <FlexList pad={2} gap={2}>
        {bands.map(band => (
          <RemixLink
            key={band.id}
            to={`/${band.id}`}
            className={`rounded hover:bg-slate-200 ${isSelected(band.id) ? 'bg-slate-100' : ''}`}
          >
            <BandOption isCollapsed={false} band={band} memberRole={band.members[0].role}>
              {isSelected(band.id) ? <FontAwesomeIcon icon={faCheck} /> : null}
            </BandOption>
          </RemixLink>
        ))}
        <Link kind="secondary" to={`/${bandId}/home/newBand`} icon={faPlus}>New band</Link>
      </FlexList>
    </div>
  )
}

const BandOption = ({ band, memberRole, isCollapsed = false, children }: { band: MainSidebarProps['band'] | MainSidebarProps['bands'][number]; memberRole: string; isCollapsed?: boolean; children?: ReactNode }) => {
  return (
    <FlexList direction="row" justify={isCollapsed ? 'center' : 'between'} items="center" pad={isCollapsed ? 2 : 4}>
      <FlexList direction="row" gap={2} items="center">
        <Avatar icon={band?.icon} bandName={band?.name || ''} size="md" />
        {!isCollapsed ? (
          <>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .1 }} className="flex flex-col">
              <TextOverflow className="font-bold text-lg">{band?.name}</TextOverflow>
              <Badge size="md">{memberRole}</Badge>
            </motion.div>
          </>
        ) : null}
      </FlexList>
      {!isCollapsed ? children : null}
    </FlexList>
  )
}