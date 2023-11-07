import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button, FlexList, Link } from "~/components";
import { deleteSetlist } from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId, setlistId } = params;
  invariant(bandId, "bandId not found");
  invariant(setlistId, "setlistId not found");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  // if confirms cancel, delete cloned setlist and route to OG setlist
  if (intent === "submit") {
    const setlist = await deleteSetlist(setlistId);
    return redirect(`/${bandId}/setlist/${setlist.editedFromId}`);
  }

  // if user wants to continue editing, redirect to edit route
  if (intent === "cancel") {
    return redirect(`/${bandId}/setlist/edit/${setlistId}`);
  }
}

export default function ConfirmCancel() {
  return (
    <Form method="put">
      <FlexList pad={4}>
        <h1 className="font-bold">Cancel changes?</h1>
        <p className="text-slate-500">
          You will lose all changes made to this setlist.
        </p>
        <Link to="..">Continue editing</Link>
        <Button name="intent" value="submit" kind="primary" type="submit">
          Confirm cancel
        </Button>
      </FlexList>
    </Form>
  );
}
