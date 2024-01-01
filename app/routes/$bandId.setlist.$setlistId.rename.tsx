import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { FlexList, Input, Label, SaveButtons } from "~/components";
import { ErrorMessage } from "~/components/ErrorMessage";
import { getSetlist, updateSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { emitter } from "~/utils/emitter.server";
import { getFields } from "~/utils/form";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId not found");
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);

  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }

  return json({ setlist });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId, setlistId } = params;
  invariant(bandId, "bandId not found");
  invariant(setlistId, "setlistId not found");
  await requireNonSubMember(request, bandId);
  const formData = await request.formData();

  const { fields, errors } = getFields<{ name: string }>(formData, [
    {
      name: "name",
      type: "string",
      isRequired: true,
    },
  ]);

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 });
  }

  await updateSetlist(setlistId, fields);
  emitter.emit("setlists");
  return redirect(`/${bandId}/setlist/${setlistId}`);
}

export default function RenameSetlist() {
  const { setlist } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <Form method="put">
      <FlexList>
        <FlexList gap={2} pad={4}>
          <Label required>Setlist name</Label>
          <Input name="name" defaultValue={setlist.name} />
          {data?.errors.name ? (
            <ErrorMessage message="A setlist name is required" />
          ) : null}
        </FlexList>
        <SaveButtons saveLabel="Update name" cancelTo=".." />
      </FlexList>
    </Form>
  );
}
