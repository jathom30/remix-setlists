import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs, UploadHandler } from "@remix-run/server-runtime";
import { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler, unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { HexColorPicker } from "react-colorful"
import { Avatar, CatchContainer, ErrorContainer, ErrorMessage, FlexList, Input, Label, SaveButtons } from "~/components";
import { getBand, updateBand } from "~/models/band.server";
import { getFields } from "~/utils/form";
import { useState } from "react";
import { contrastColor } from "~/utils/assorted";
import { requireAdminMember } from "~/session.server";
import { uploadImage } from "~/models/cloudinary.server";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

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

  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({ name, data }) => {
      if (name !== "path") {
        return undefined;
      }
      const uploadedImage = await uploadImage(data);
      return uploadedImage.secure_url;
    },
    unstable_createMemoryUploadHandler()
  );

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const { fields, errors } = getFields<{ name: string; backgroundColor: string; path?: string }>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'backgroundColor', type: 'string', isRequired: true },
    { name: 'path', type: 'string', isRequired: false }
  ])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  await updateBand(bandId, fields)

  return redirect(`/${bandId}/band`)
}

export default function EditBand() {
  const { band } = useLoaderData<typeof loader>()
  const actionData = useActionData<typeof action>()

  const [color, setColor] = useState(band.icon?.backgroundColor || '');

  return (
    <Form method="put" encType="multipart/form-data">
      <FlexList pad={4}>
        <FlexList gap={0}>
          <Label required>Band name</Label>
          <Input name="name" placeholder="Band name..." defaultValue={band.name} />
          {actionData?.errors.name ? <ErrorMessage message="Band name required" /> : null}
        </FlexList>
        {band.icon?.path ? (
          <div className="indicator">
            <div className="indicator-item">
              <Link to="upload" className="btn btn-circle btn-xs">
                <FontAwesomeIcon icon={faCamera} />
              </Link>
            </div>
            <Avatar bandName={band.name} icon={band.icon} />

            <input type="file" name="path" accept="image/*" />
          </div>
        ) : (
          <FlexList gap={0}>
            <Label>Icon</Label>
            <FlexList direction="row" justify="center">
              <div
                className="flex items-center justify-center aspect-square h-20 text-3xl font-bold rounded"
                style={{
                  backgroundColor: color,
                  color: contrastColor(color),
                }}
              >
                {band.name[0]}
              </div>
              <HexColorPicker color={color} onChange={setColor} />
            </FlexList>
            <input hidden name="backgroundColor" defaultValue={color} />
          </FlexList>
        )}
      </FlexList>
      <SaveButtons
        saveLabel="Save"
        cancelTo=".."
      />
    </Form>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}