import { Outlet, useLocation, useParams } from "@remix-run/react"
import type { MetaFunction } from "@remix-run/server-runtime";
import { AvatarTitle, Breadcrumbs, FlexHeader, FlexList, MaxHeightContainer, MaxWidth, Navbar } from "~/components"

export const meta: MetaFunction = () => ({
  title: 'New setlist'
});

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
            <FlexList gap={2}>
              <AvatarTitle title="New setlist" />
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: 'New', to: isNewBase ? '.' : `/${bandId}/setlist/new` },
                ...(!isNewBase ? [{ label: getHeader(pathname), to: '.' }] : [])
              ]} />
            </FlexList>
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
