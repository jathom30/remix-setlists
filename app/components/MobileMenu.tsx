import { faBars, faHouse, faList, faMusic, faUsers, faCog } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useLocation, useNavigation, useParams } from "@remix-run/react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "./Button"
import { Drawer } from "./Drawer"
import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { Loader } from "./Loader"

const routes = [
  {
    icon: faHouse,
    label: 'Band select',
    to: 'home'
  },
  {
    icon: faList,
    label: 'Setlists',
    to: 'setlists'
  },
  {
    icon: faMusic,
    label: 'Songs',
    to: 'songs'
  },
  {
    icon: faUsers,
    label: 'Band settings',
    to: 'band'
  },
  {
    icon: faCog,
    label: 'User settings',
    to: 'user'
  },
]

export const MobileMenu = () => {
  const navigation = useNavigation()
  const [showMenu, setShowMenu] = useState(false)
  const [menuContainer, setMenuContainer] = useState<HTMLElement | null>(null)
  const { bandId } = useParams()

  const { pathname } = useLocation()
  const isActive = (to: string) => {
    const singularTo = to[to.length - 1] === 's' ? to.substring(0, to.length - 1) : to
    return pathname.split('/')[2].includes(singularTo.toLowerCase())
  }
  const isNavigatingTo = (to: string) => {
    const singularTo = to[to.length - 1] === 's' ? to.substring(0, to.length - 1) : to
    return navigation.location?.pathname.split('/')[2]?.includes(singularTo.toLowerCase())
  }

  useEffect(() => {
    if (typeof document === 'undefined') return
    setMenuContainer(document.getElementById('menu-portal'))
  }, []);

  if (!menuContainer) {
    return (
      // TODO skeleton UI
      <Loader />
    )
  }
  return (
    <div className="sm:hidden">
      <Button size="md" kind="ghost" isRounded onClick={() => setShowMenu(true)}>
        <FontAwesomeIcon icon={faBars} />
      </Button>
      {createPortal(
        <Drawer open={showMenu} onClose={() => setShowMenu(false)}>
          <FlexList pad={4}>
            {routes.map(route => (
              <Link size="md" key={route.to} to={`/${bandId}/${route.to}`} kind={isActive(route.to) ? 'primary' : undefined} isOutline={!isActive(route.to)} isSaving={isNavigatingTo(route.to)} icon={route.icon}>{route.label}</Link>
            ))}
          </FlexList>
        </Drawer>,
        menuContainer
      )}
    </div>
  )
}