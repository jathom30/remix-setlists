import { faSignOut, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { json } from "@remix-run/node"
import { Form, useLoaderData, useParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { Badge, Button, FlexHeader, FlexList, Label, MaxHeightContainer, RouteHeader, RouteHeaderBackLink } from "~/components";
import { getUserWithBands } from "~/models/user.server";

export async function loader({ request, params }: LoaderArgs) {
  const user = await getUserWithBands(request)

  if (!user) {
    throw new Response("User not found", { status: 404 })
  }
  return json({ user })
}

export default function UserRoute() {
  const { user } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <FlexHeader>
            <RouteHeaderBackLink label="User" to={`/${bandId}/home`} />
            <Form action="/logout" method="post">
              <Button type="submit" kind="invert" isCollapsing icon={faSignOut}>Sign out</Button>
            </Form>
          </FlexHeader>
        </RouteHeader>
      }
    >
      <FlexList pad={4}>
        <FlexList gap={0}>
          <Label>Name</Label>
          <span>{user.name}</span>
        </FlexList>
        <FlexList gap={0}>
          <Label>Update password</Label>
          <span>**********</span>
        </FlexList>
        <FlexList gap={0}>
          <Label>Associated bands</Label>
          {user.bands.map(band => (
            <button key={band.bandId} className="p-4 py-2 rounded">
              <FlexHeader>
                <FlexList direction="row" items="center">
                  <FontAwesomeIcon icon={faTrash} />
                  <span>{band.bandName}</span>
                </FlexList>
                <Badge>{band.role}</Badge>
              </FlexHeader>
            </button>
          ))}
        </FlexList>
      </FlexList>
    </MaxHeightContainer>
  )
}