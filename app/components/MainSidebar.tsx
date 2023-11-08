import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import {
  faCheck,
  faChevronLeft,
  faChevronRight,
  faListOl,
  faMusic,
  faPlus,
  faSignOut,
  faSort,
  faUser,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { BandIcon } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import {
  useLocation,
  Link as RemixLink,
  useParams,
  Form,
  useFetcher,
} from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useState } from "react";
import { Popover } from "react-tiny-popover";

import { useUser } from "~/utils";

import { AddBand } from "./AddBand";
import { Avatar } from "./Avatar";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Divider } from "./Divider";
import { FlexList } from "./FlexList";
import { Modal } from "./Modal";
import { TextOverflow } from "./TextOverflow";

interface MainSidebarProps {
  openState: string
  band: SerializeFrom<{
    name: string;
    icon: BandIcon | null;
  }> | null;
  memberRole: string;
  bands: SerializeFrom<{
    name: string;
    icon: BandIcon | null;
    id: string;
    members: {
      role: string;
    }[];
  }>[];
}

export const MainSidebar = ({ band, memberRole, bands, openState }: MainSidebarProps) => {
  const user = useUser();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const { pathname } = useLocation();

  const isActive = pathname.split("/")[2].includes("user");

  const fetcher = useFetcher()

  return (
    <AnimatePresence initial={false}>
      <motion.aside
        animate={openState}
        variants={{
          open: { width: "100%" },
          closed: { width: 80 },
        }}
        className="h-full bg-base-100 w-full max-w-xs flex flex-col shadow-lg z-10"
      >
        <div className="p-2">
          <Popover
            isOpen={isPopupOpen}
            positions={["right"]}
            padding={16}
            onClickOutside={() => setIsPopupOpen(false)}
            content={
              <div className="mt-2">
                <BandSelectPopup
                  bands={bands}
                  onSelect={() => setIsPopupOpen(false)}
                  onShowNew={() => {
                    setIsPopupOpen(false);
                    setShowCreateMenu(true);
                  }}
                />
              </div>
            }
          >
            <button
              className="btn btn-block btn-outline h-auto p-2 hover:btn-accent"
              onClick={() => setIsPopupOpen(!isPopupOpen)}
            >
              <BandOption
                band={band}
                isCollapsed={openState === 'closed'}
                memberRole={memberRole}
              >
                <FontAwesomeIcon icon={faSort} />
              </BandOption>
            </button>
          </Popover>
        </div>

        <div className="flex flex-col h-full p-2 gap-4">
          <fetcher.Form method="post" action="/resource/user-settings" className="relative h-4">
            <div className="absolute -right-6 z-20">
              <Button type="submit" name="sidebar-state" value={openState === 'open' ? 'closed' : 'open'} size="sm" isRounded kind="active" ariaLabel="Toggle sidebar">
                <FontAwesomeIcon icon={openState === 'open' ? faChevronLeft : faChevronRight} />
              </Button>
            </div>
          </fetcher.Form>
          <div className="flex gap-4 h-full justify-between flex-col">
            <ul className="menu p-2 rounded-box">
              <li>
                <SideBarLink
                  to="setlists"
                  isOpen={openState === 'open'}
                  label="Setlists"
                  icon={faListOl}
                />
              </li>
              <li>
                <SideBarLink
                  to="songs"
                  isOpen={openState === 'open'}
                  label="Songs"
                  icon={faMusic}
                />
              </li>
            </ul>
            <ul className="menu p-2 rounded-box">
              <li>
                <SideBarLink
                  to="band"
                  isOpen={openState === 'open'}
                  label="Band settings"
                  icon={faUsers}
                />
              </li>
            </ul>
          </div>
        </div>

        <Popover
          isOpen={isUserOpen}
          positions={["right"]}
          padding={8}
          onClickOutside={() => setIsUserOpen(false)}
          content={
            <ul className="menu bg-base-100 p-2 rounded shadow-xl mb-4">
              <div className="flex flex-col items-baseline p-2">
                <TextOverflow>{user.name}</TextOverflow>
                <TextOverflow>
                  <span className="text-sm text-slate-400">
                    {user.email}
                  </span>
                </TextOverflow>
              </div>
              <li>
                <RemixLink onClick={() => setIsUserOpen(false)} to="user">
                  <FontAwesomeIcon icon={faUser} />
                  User settings
                </RemixLink>
              </li>
              <Divider />
              <Form method="post" action="/logout" className="p-0">
                <FlexList>
                  <Button type="submit" icon={faSignOut}>
                    Sign out
                  </Button>
                </FlexList>
              </Form>
              <span className="text-xs text-slate-400 text-right pt-2">
                v0.1.0
              </span>
            </ul>
          }
        >
          <div className="p-2">
            <button
              className={`btn btn-block btn-outline h-auto p-4 ${isActive ? "active" : ""
                }`}
              onClick={() => setIsUserOpen(!isUserOpen)}
            >
              <div className="w-full">
                <FlexList
                  direction="row"
                  items="center"
                  justify={openState === 'open' ? "start" : "center"}
                >
                  <FontAwesomeIcon icon={faUser} />
                  {openState === 'open' ? (
                    <>
                      <div className="flex flex-col items-baseline">
                        <TextOverflow>{user.name}</TextOverflow>
                        <TextOverflow>
                          <span className="text-sm text-slate-400">
                            {user.email}
                          </span>
                        </TextOverflow>
                      </div>
                      <FontAwesomeIcon icon={faSort} />
                    </>
                  ) : null}
                </FlexList>
              </div>
            </button>
          </div>
        </Popover>
        <Modal
          open={showCreateMenu}
          onClose={() => setShowCreateMenu(false)}
          isPortal
        >
          <AddBand
            onSubmit={() => setShowCreateMenu(false)}
            onClose={() => setShowCreateMenu(false)}
          />
        </Modal>
      </motion.aside>
    </AnimatePresence >
  );
};

const SideBarLink = ({
  to,
  isOpen,
  label,
  icon,
}: {
  to: string;
  isOpen: boolean;
  label: string;
  icon: IconDefinition;
}) => {
  const { pathname } = useLocation();
  const singularTo =
    to[to.length - 1] === "s" ? to.substring(0, to.length - 1) : to;
  const isActive = pathname.split("/")[2].includes(singularTo);
  return (
    <RemixLink className={isActive ? "active" : ""} to={to}>
      <FlexList direction="row" items="center">
        <FontAwesomeIcon icon={icon} />
        {isOpen ? <span>{label}</span> : null}
      </FlexList>
    </RemixLink>
  );
};

const BandSelectPopup = ({
  bands,
  onSelect,
  onShowNew,
}: {
  bands: MainSidebarProps["bands"];
  onSelect: () => void;
  onShowNew: () => void;
}) => {
  const { bandId } = useParams();
  const { pathname } = useLocation();
  const redirectPath = pathname
    .split("/")
    .filter((path) => path !== bandId && path.length)[0];
  const isSelected = (bandId: MainSidebarProps["bands"][number]["id"]) =>
    pathname.includes(bandId);

  return (
    <ul className="menu bg-base-100 p-2 rounded shadow-xl">
      <li>
        {bands.map((band) => (
          <RemixLink
            key={band.id}
            to={`/${band.id}/${redirectPath}`}
            onClick={onSelect}
            className={isSelected(band.id) ? "active" : ""}
          >
            <BandOption
              isCollapsed={false}
              band={band}
              memberRole={band.members[0].role}
            >
              {isSelected(band.id) ? <FontAwesomeIcon icon={faCheck} /> : null}
            </BandOption>
          </RemixLink>
        ))}
      </li>
      <Divider />
      <li>
        <Button isOutline onClick={onShowNew} icon={faPlus}>
          New band
        </Button>
      </li>
    </ul>
  );
};

const BandOption = ({
  band,
  memberRole,
  isCollapsed = false,
  children,
}: {
  band: MainSidebarProps["band"] | MainSidebarProps["bands"][number];
  memberRole: string;
  isCollapsed?: boolean;
  children?: ReactNode;
}) => {
  return (
    <div className="w-full">
      <FlexList
        direction="row"
        justify={isCollapsed ? "center" : "between"}
        items="center"
      >
        <FlexList direction="row" gap={2} items="center">
          <Avatar icon={band?.icon} bandName={band?.name || ""} size="md" />
          {!isCollapsed ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col"
              >
                <TextOverflow className="font-bold text-lg">
                  {band?.name}
                </TextOverflow>
                <Badge size="md">{memberRole}</Badge>
              </motion.div>
            </>
          ) : null}
        </FlexList>
        {!isCollapsed ? children : null}
      </FlexList>
    </div>
  );
};
