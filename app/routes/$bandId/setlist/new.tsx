import { Outlet, useLocation, useParams } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/server-runtime";
import { AvatarTitle, Breadcrumbs, FlexHeader, MaxHeightContainer, MobileMenu, Navbar } from "~/components"

export const meta: MetaFunction = () => ({
  title: 'New setlist'
});

const getHeader = (pathname: string) => {
  if (pathname.includes('fresh')) {
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
        <>
          <Navbar>
            <FlexHeader>
              <AvatarTitle title="New setlist" />
              <MobileMenu />
            </FlexHeader>
          </Navbar>
          <Navbar shrink>
            <Breadcrumbs breadcrumbs={[
              { label: 'Setlists', to: `/${bandId}/setlists` },
              { label: 'New', to: isNewBase ? '.' : `/${bandId}/setlist/new` },
              ...(!isNewBase ? [{ label: getHeader(pathname), to: '.' }] : [])
            ]} />
          </Navbar>
        </>
      }
    >
      <Outlet />
    </MaxHeightContainer>
  )
}
