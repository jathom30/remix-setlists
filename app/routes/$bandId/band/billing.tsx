import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { FlexHeader, FlexList, Link, MaxHeightContainer, Navbar, RadioGroup, SaveButtons, Title } from "~/components";
import { getBand, updateBand } from "~/models/band.server";
import { requireAdminMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const band = await getBand(bandId)
  if (!band) {
    throw new Response('Band not found', { status: 404 })
  }
  return json({ band })
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const formData = await request.formData()
  const subscription = formData.get('subscription')

  await updateBand(bandId, { isUnlimited: subscription === 'unlimited' })
  return redirect(`/${bandId}/band`)
}

export default function BandBilling() {
  const { band } = useLoaderData<typeof loader>()
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>Subscriptions</Title>
            <Link to=".." isRounded kind="ghost"><FontAwesomeIcon icon={faTimes} /></Link>
          </FlexHeader>
        </Navbar>
      }
    >
      <Form method="put" className="bg-base-300">
        <FlexList pad={4}>
          <RadioGroup
            name="subscription"
            options={[
              { label: 'Unlimited', value: 'unlimited' },
              { label: 'Free', value: 'free' },
            ]}
            isChecked={(val) => band.isUnlimited ? val === 'unlimited' : val === 'free'}
          />
        </FlexList>
        <SaveButtons
          saveLabel="Update subscription"
        />
      </Form>
    </MaxHeightContainer>
  )
}