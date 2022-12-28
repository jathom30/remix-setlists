import { Outlet, useLocation, useParams } from "@remix-run/react"
import { Breadcrumbs, MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components"


const getHeader = (pathname: string) => {
  if (pathname.includes('manual')) {
    return 'Manual'
  }
  if (pathname.includes('auto')) {
    return 'Auto-magical'
  }
  return 'New'
}

export default function NewSetlist() {
  const { bandId } = useParams()
  const { pathname } = useLocation()

  const label = getHeader(pathname)
  const isNewBase = getHeader(pathname) === 'New'
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={<RouteHeaderBackLink label={label} />}
          desktopChildren={<Breadcrumbs breadcrumbs={[
            { label: 'Setlists', to: `/${bandId}/setlists` },
            { label: 'New', to: isNewBase ? '.' : `/${bandId}/setlist/new` },
            ...(!isNewBase ? [{ label: getHeader(pathname), to: '.' }] : [])
          ]} />}
        />
      }
    >
      <Outlet />
    </MaxHeightContainer>
  )
}
