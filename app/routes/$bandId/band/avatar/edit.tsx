import { Outlet, useLocation, useNavigate } from "@remix-run/react";
import { CatchContainer, ErrorContainer, FlexList, Tabs } from "~/components";

export default function EditBandAvatar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <FlexList pad={2}>
      <Tabs tabs={[
        { label: 'Color', isActive: !pathname.includes('image'), onClick: () => navigate('.') },
        { label: 'Image', isActive: pathname.includes('image'), onClick: () => navigate('image') },
      ]}>
        <Outlet />
      </Tabs>
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}