import { Outlet } from "@remix-run/react";
import { CatchContainer, ErrorContainer, FlexList, Title } from "~/components";

export default function NewBand() {
  return (
    <FlexList>
      <FlexList pad={4} gap={0}>
        <Title>New band</Title>
        <p>Either create a new band or, if you've received an invite code, add yourself to an existing one.</p>
      </FlexList>
      <Outlet />
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}