import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { isRouteErrorResponse, useLoaderData, useParams, useRouteError, useSubmit } from "@remix-run/react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import { AvatarTitle, Breadcrumbs, CatchContainer, ErrorContainer, FlexHeader, FlexList, MaxHeightContainer, MaxWidth, Navbar, Spinner, Title } from "~/components";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const url = new URL(request.url)
  const setlistId = url.searchParams.get('setlistId')
  invariant(setlistId, 'setlistId not found')
  await requireNonSubMember(request, bandId)

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const url = new URL(request.url)
  const setlistId = url.searchParams.get('setlistId')
  invariant(setlistId, 'setlistId not found')

  await requireNonSubMember(request, bandId)

  return redirect(`/${bandId}/setlist/${setlistId}/rename`)
}

export default function CreatingSetlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { bandId } = useParams()
  const submit = useSubmit()

  useEffect(() => {
    submit({}, { method: 'put' })
  }, [submit])

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <FlexList gap={2}>
              <AvatarTitle title={`Loading ${setlist.name}`} />
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: 'Creating...', to: '.' },
              ]} />
            </FlexList>
          </FlexHeader>
        </Navbar>
      }
    >
      <MaxWidth>
        <div className="relative">
          <div className="animate-pulse">
            <FlexList items="center" pad={4}>
              {/* skeleton UI */}
              <FlexHeader>
                <FlexList direction="row" gap={4}>
                  <motion.div className="bg-base-100 w-12 h-12 rounded" />
                  <motion.div className="bg-base-100 w-48 h-12 rounded" />
                </FlexList>
                <motion.div className="bg-base-100 w-48 h-12 rounded" />
              </FlexHeader>
              <motion.div className="h-4" />
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div key={i} className="bg-base-100 w-full h-12 rounded" />
              ))}
            </FlexList>
          </div>
          <div className="absolute inset-0 flex flex-col gap-4 items-center justify-center">
            <Title>Creating your setlist...</Title>
            <Spinner size="3x" />
          </div>
        </div>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return (
      <ErrorContainer error={error as Error} />
    )
  }
  return <CatchContainer status={error.status} data={error.data} />
}