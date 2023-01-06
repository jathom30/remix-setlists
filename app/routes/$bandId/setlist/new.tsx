import { Outlet, useLocation, useParams } from "@remix-run/react"
import { Breadcrumbs, FlexHeader, MaxHeightContainer, MaxWidth, Navbar, Title } from "~/components"


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

  const isNewBase = getHeader(pathname) === 'New'
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <div>
              <Title>New setlist</Title>
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: 'New', to: isNewBase ? '.' : `/${bandId}/setlist/new` },
                ...(!isNewBase ? [{ label: getHeader(pathname), to: '.' }] : [])
              ]} />
            </div>
          </FlexHeader>
        </Navbar>
      }
    >
      <MaxWidth>
        <Outlet />
      </MaxWidth>
    </MaxHeightContainer>
  )
}
