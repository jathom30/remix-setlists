import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Form, Outlet, useLocation, useNavigate, useTransition } from "@remix-run/react";
import type { ActionArgs, UploadHandler } from "@remix-run/server-runtime";
import { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button, CatchContainer, ErrorContainer, FlexList, MaxHeightContainer, Tabs } from "~/components";
import { updateBandIcon } from "~/models/bandIcon.server";
import { uploadImage } from "~/models/cloudinary.server";
import { requireAdminMember } from "~/session.server";

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "path") {
        return undefined;
      }
      const uploadedImage = await uploadImage(data, bandId);
      return uploadedImage.secure_url;
    },
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  const intent = formData.get('intent')

  if (typeof intent !== 'string') {
    throw new Response('Unwanted intent', { status: 401 })
  }

  if (intent === 'color') {
    const color = formData.get('color')

    if (typeof color !== 'string') {
      throw new Response('Unknown color', { status: 401 })
    }
    await updateBandIcon(bandId, { backgroundColor: color, path: null })
  }

  if (intent === 'image') {
    const path = formData.get('path')
    if (!path || typeof path !== 'string') {
      throw new Response('Unwanted file', { status: 401 })
    }
    await updateBandIcon(bandId, { path })
  }

  return redirect(`/${bandId}/band`)
}

export default function EditBandAvatar() {
  const transition = useTransition()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <Form method="put" encType="multipart/form-data">
      <MaxHeightContainer fullHeight header={
        <div className="bg-base-100 p-2">
          <Tabs tabs={[
            { label: 'Color', isActive: !pathname.includes('image'), onClick: () => navigate('.') },
            { label: 'Image', isActive: pathname.includes('image'), onClick: () => navigate('image') },
          ]} />
        </div>
      } footer={
        <div className="bg-base-100">
          <FlexList pad={4}>
            <Button type="submit" kind="primary" icon={faSave} isSaving={transition.state !== 'idle'}>Save</Button>
          </FlexList>
        </div>
      }>
        <Outlet />
      </MaxHeightContainer>
    </Form>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}