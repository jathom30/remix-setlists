import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Form, useTransition } from "@remix-run/react";
import type { ActionArgs, UploadHandler } from "@remix-run/server-runtime";
import { json, redirect, unstable_parseMultipartFormData } from "@remix-run/server-runtime";
import { unstable_composeUploadHandlers, unstable_createMemoryUploadHandler } from "@remix-run/server-runtime";
import type { ChangeEvent } from "react";
import { useRef } from "react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { Button, CatchContainer, ErrorContainer, FlexList } from "~/components";
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

  const path = formData.get('path')
  if (!path || typeof path !== 'string') {
    return json({
      error: { path: 'Could not process file' },
    })
  }
  await updateBandIcon(bandId, { path })
  return redirect(`/${bandId}/band`)
}

export default function EditBandAvatarImage() {
  const transition = useTransition()
  const [image, setImage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) { return }
    setImage(URL.createObjectURL(e.target.files[0]))
  }
  return (
    <Form method="put" encType="multipart/form-data">
      <FlexList pad={4}>
        {image ? (
          <>
            <div className="aspect-square rounded overflow-hidden flex flex-col items-center justify-center">
              <img className="max-w-48 w-full h-full object-cover" src={image} alt="band logo" />
            </div>
            <Button kind="primary" type="submit" isSaving={transition.state !== 'idle'} icon={faSave}>Use image</Button>
            <Button kind="ghost" onClick={() => fileInputRef.current?.click()}>Replace image</Button>
          </>
        ) : null}
        <input ref={fileInputRef} className="file-input file-input-bordered" hidden={!!image} type="file" name="path" accept="image/*" onChange={onImageChange} />
      </FlexList>
    </Form>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}