import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import pluralize from "pluralize";
import invariant from "tiny-invariant";
import { FeelTag, FlexHeader, FlexList, Link, MaxHeightContainer } from "~/components";
import { getFeels } from "~/models/feel.server";
import { requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const feels = await getFeels(bandId)

  return json({ feels })
}

export default function FeelsList() {
  const { feels } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  return (
    <MaxHeightContainer
      fullHeight
      footer={
        <div className="bg-base-100 shadow-xl">
          <FlexList pad="md">
            <Link to="new" kind="primary">Add new feel</Link>
          </FlexList>
        </div>
      }
    >
      <FlexList pad="sm" gap="none">
        {feels?.map(feel => (
          <FlexHeader key={feel.id}>
            <RemixLink to={`${feel.id}/edit`} className="btn btn-ghost h-auto flex-grow justify-start p-2 normal-case font-normal">
              <FlexList direction="row" items="center" gap="md">
                {!isSub ? <FontAwesomeIcon icon={faPencil} /> : null}
                <FlexList gap={1}>
                  <FeelTag feel={feel} />
                  <span className="text-xs">Found in {pluralize('song', feel.songs.length, true)}</span>
                </FlexList>
              </FlexList>
            </RemixLink>
            {!isSub ? <Link to={`${feel.id}/delete`} kind="error" isRounded>
              <FontAwesomeIcon icon={faTrash} />
            </Link> : null}
          </FlexHeader>
        ))}
      </FlexList>
    </MaxHeightContainer>
  )
}