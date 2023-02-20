import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Avatar, CatchContainer, ErrorContainer, FlexList, Link } from "~/components";
import { requireAdminMember } from "~/session.server";
import { useBandIcon } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  return await requireAdminMember(request, bandId)
}

export default function AvatarBase() {
  const data = useBandIcon()
  return (
    <FlexList pad="md" items="center">
      <Avatar bandName={data?.bandName || ''} icon={data?.icon} size="xl" />
      <FlexList direction="row">
        <Link icon={faPencil} to="edit">Change</Link>
        {data?.icon.path ? <Link kind="error" icon={faTrash} to="delete">Remove</Link> : null}
      </FlexList>
    </FlexList>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}