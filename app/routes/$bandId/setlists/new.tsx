import { Outlet, useLocation, useParams } from "@remix-run/react"
import { MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components"


const getHeader = (pathname: string, defaultTo: string) => {
  const backToSelect = `${defaultTo}/new`
  if (pathname.includes('manual')) {
    return {
      label: 'Manual',
      to: backToSelect
    }
  }
  if (pathname.includes('auto')) {
    return {
      label: 'Auto-magical',
      to: backToSelect
    }
  }
  return {
    label: 'New',
    to: defaultTo
  }
}

export default function NewSetlist() {
  const { bandId } = useParams()
  const { pathname } = useLocation()

  const { label, to } = getHeader(pathname, `/${bandId}/setlists`)

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label={label} to={to} />
        </RouteHeader>
      }
    >
      <Outlet />
    </MaxHeightContainer>
  )
}
