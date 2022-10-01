import { Outlet, useLocation, useParams } from "@remix-run/react"
import { MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components"


const getHeader = (pathname: string, defaultTo: string) => {
  if (pathname.includes('manual')) {
    return {
      label: 'Manual',
    }
  }
  if (pathname.includes('auto')) {
    return {
      label: 'Auto-magical',
    }
  }
  return {
    label: 'New',
  }
}

export default function NewSetlist() {
  const { bandId } = useParams()
  const { pathname } = useLocation()

  const { label } = getHeader(pathname, `/${bandId}/setlists`)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label={label} />
        </RouteHeader>
      }
    >
      <Outlet />
    </MaxHeightContainer>
  )
}
