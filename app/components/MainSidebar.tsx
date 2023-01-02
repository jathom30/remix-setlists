import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { faCheck, faListOl, faMusic, faPlus, faSignOut, faSort, faUser, faUsers } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { BandIcon, Setlist, Song, SongsInSets } from "@prisma/client"
import { Popover } from 'react-tiny-popover'
import type { SerializeFrom } from "@remix-run/server-runtime"
import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useState } from "react"
import { useUser } from "~/utils"
import { Avatar } from "./Avatar"
import { Badge } from "./Badge"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { MaxHeightContainer } from "./MaxHeightContainer"
import { TextOverflow } from "./TextOverflow"
import { useLocation, Link as RemixLink, useParams, Form } from "@remix-run/react"
import { ItemBox } from "./ItemBox"

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
  const [isUserOpen, setIsUserOpen] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const state = isOpen ? 'open' : 'closed'
  const { pathname } = useLocation()

  useEffect(() => {
    const handleIsOpen = () => setIsOpen(window.innerWidth > 900)
    window.addEventListener('resize', handleIsOpen)
    handleIsOpen()
    return () => window.removeEventListener('resize', handleIsOpen)
  }, [])

  const isActive = pathname.includes('user')

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
                <button
                  className="w-full hover:bg-slate-100"
                  onClick={() => setIsPopupOpen(!isPopupOpen)}
                >
                  <BandOption band={band} isCollapsed={!isOpen} memberRole={memberRole}>
                    <FontAwesomeIcon icon={faSort} />
                  </BandOption>
                </button>
              </Popover>
            </div>
          }
          footer={
            <>
              <div className="border-t">
                <Popover
                  isOpen={isUserOpen}
                  positions={['right']}
                  padding={8}
                  onClickOutside={() => setIsUserOpen(false)}
                  content={
                    <ItemBox pad={2}>
                      <FlexList gap={2}>
                        <Link icon={faUser} onClick={() => setIsUserOpen(false)} kind="secondary" to="user">User settings</Link>
                        <Form method="post" action="/logout">
                          <FlexList>
                            <Button type="submit" icon={faSignOut}>Sign out</Button>
                          </FlexList>
                        </Form>
                        <span className="text-xs text-slate-400 text-right">v0.1.0</span>
                      </FlexList>
                    </ItemBox>
                  }
                >
                  <div className="p-2">
                    <button
                      className={`${isOpen ? '' : 'justify-center'} ${isActive ? 'text-slate-600 bg-blue-100' : 'text-slate-500'} px-4 py-2 w-full rounded hover:bg-slate-200`}
                      onClick={() => setIsUserOpen(!isUserOpen)}
                    >
                      <FlexList direction="row" items="center" justify={isOpen ? "start" : "center"}>
                        <FontAwesomeIcon icon={faUser} />
                        {isOpen ? (
                          <>
                            <div className="flex flex-col items-baseline">
                              <TextOverflow>{user.name}</TextOverflow>
                              <span className="text-sm text-slate-400">{user.email}</span>
                            </div>
                          </>
                        ) : null}
                      </FlexList>
                    </button>
                  </div>
                </Popover>
              </div>
            </>
          }
        >
          <div className="flex flex-col h-full p-4 gap-4 justify-between">
            <FlexList gap={2}>
              <SideBarLink to="setlists" isOpen={isOpen} label="Setlists" icon={faListOl} />
              <SideBarLink to="songs" isOpen={isOpen} label="Songs" icon={faMusic} />
            </FlexList>
            <FlexList>
              <SideBarLink to="band" isOpen={isOpen} label="Band settings" icon={faUsers} />
            </FlexList>
          </div>
        </MaxHeightContainer>
      </motion.div>
    </AnimatePresence>
  )
}

const SideBarLink = ({ to, isOpen, label, icon }: { to: string; isOpen: boolean; label: string; icon: IconDefinition }) => {
  const { pathname } = useLocation()
  // ex: setlists => setlist
  const singularTo = to[to.length - 1] === 's' ? to.substring(0, to.length - 1) : to
  const isActive = pathname.includes(singularTo)
  return (
    <RemixLink className={`${isActive ? 'text-slate-600 bg-blue-100' : 'text-slate-500'} px-4 py-2 flex items-center ${isOpen ? '' : 'justify-center'} rounded hover:bg-slate-200`} to={to}>
      <FlexList direction="row" items="center">
        <FontAwesomeIcon icon={icon} />
        {isOpen ? <span className='text-slate-700'>{label}</span> : null}
      </FlexList>
    </RemixLink>
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