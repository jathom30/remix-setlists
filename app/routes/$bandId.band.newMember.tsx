import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Button, CatchContainer, Collapsible, CopyClick, ErrorContainer, FlexList, Label } from "~/components";
import { requireAdminMember } from "~/session.server";
import invariant from "tiny-invariant";
import { getBand, updateBandCode } from "~/models/band.server";
import { isRouteErrorResponse, useFetcher, useLoaderData, useRouteError } from "@remix-run/react";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { QRCode } from 'react-qrcode-logo';
import { getDomainUrl } from "~/utils/assorted";
import { useThemeColor } from "~/hooks";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const band = await getBand(bandId)

  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }
  const domainUrl = getDomainUrl(request)
  const qrCodeAddress = `${domainUrl}/home/existing?code=${band.code}`

  return json({ band, qrCodeAddress })
}

export async function action({ request, params }: ActionFunctionArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  await updateBandCode(bandId)

  return redirect('.')
}

export default function NewMember() {
  const { band, qrCodeAddress } = useLoaderData<typeof loader>()
  const fetcher = useFetcher()
  const [showQr, setShowQr] = useState(false)

  const background = useThemeColor('base-100')
  const accent = useThemeColor('accent')

  return (
    <FlexList pad={4}>
      <FlexList gap={0}>
        <h5 className="text-xl font-bold">Invite new member</h5>
        <span className="text-text-subdued text-sm">Invite new members with the band code below.</span>
      </FlexList>

      <FlexList gap={0}>
        <Label>Band code</Label>
        <CopyClick textToCopy={band.code} copyMessage={band.code} successMessage="Band code copied!" />
      </FlexList>

      <FlexList gap={2}>
        <Collapsible isOpen={showQr}>
          <FlexList items="center">
            <QRCode
              bgColor={background}
              fgColor={accent}
              value={qrCodeAddress}
              qrStyle="dots"
              eyeRadius={10}
            />
          </FlexList>
        </Collapsible>

        <Button onClick={() => setShowQr(!showQr)} isOutline icon={faQrcode}>{showQr ? 'Hide' : 'Show'} QR code</Button>
      </FlexList>

      <fetcher.Form method="put" action=".">
        <FlexList>
          <Button type="submit" kind="secondary" isSaving={fetcher.state !== 'idle'}>Generate new code</Button>
        </FlexList>
      </fetcher.Form>

      <div>
        <Label>NOTE:</Label>
        <FlexList>
          <p className="text-sm">All invited members will automatically be added as <b>SUB</b>s. They will be able to see your setlists and songs, but will not be able to make any changes.</p>
          <p className="text-sm">If you wish to upgrade their role, you can do so by clicking on their name in the members list after they join this band.</p>
        </FlexList>
      </div>
    </FlexList>
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