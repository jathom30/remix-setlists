import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Form, useTransition } from "@remix-run/react";
import type { ActionArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import invariant from "tiny-invariant";
import { Button, FlexList } from "~/components";
import { updateBandIcon } from "~/models/bandIcon.server";
import { requireAdminMember } from "~/session.server";
import { useBandIcon } from "~/utils";
import { contrastColor } from "~/utils/assorted";

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireAdminMember(request, bandId)

  const formData = await request.formData()
  const color = formData.get('color')

  if (typeof color !== 'string') {
    throw new Response('Unknown color', { status: 401 })
  }
  await updateBandIcon(bandId, { backgroundColor: color, path: null })
  return redirect(`/${bandId}/band`)
}

export default function ColorSelect() {
  const transition = useTransition()
  const bandIcon = useBandIcon()
  const [color, setColor] = useState(bandIcon?.icon.backgroundColor || '');

  return (
    <Form method="put">
      <FlexList>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <HexColorPicker color={color} onChange={setColor} />
          <div
            className={`h-full aspect-square flex items-center justify-center bg-primary w-48 text-5xl rounded font-bold`}
            style={{ backgroundColor: color, color: contrastColor(color) }}
          >
            <span>{bandIcon?.bandName[0].toUpperCase()}</span>
          </div>
        </div>
        <Button type="submit" kind="primary" icon={faSave} isSaving={transition.state !== 'idle'}>Save color</Button>
        <input hidden type="hidden" name="color" defaultValue={color} />
      </FlexList>
    </Form>
  )
}