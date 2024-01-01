import { faPlus, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, useNavigation } from "@remix-run/react";
import { useSpinDelay } from "spin-delay";
import invariant from "tiny-invariant";

import { Button, FlexHeader, FlexList, Link } from "~/components";
import {
  getSetlist,
  overwriteSetlist,
  updateSetlist,
} from "~/models/setlist.server";
import { requireNonSubMember } from "~/session.server";
import { emitter } from "~/utils/emitter.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId, setlistId } = params;
  invariant(bandId, "bandId not found");
  invariant(setlistId, "setlistId not found");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  const clonedSetlist = await getSetlist(setlistId);
  if (!clonedSetlist?.editedFromId) {
    return null;
  }

  // on new, remove editedFromId and redirect to rename setlist page
  if (intent === "new") {
    await updateSetlist(setlistId, { editedFromId: null });
    emitter.emit(`setlists`);
    return redirect(`/${bandId}/setlist/${setlistId}/rename`);
  }

  // on overwrite, update OG setlist to match cloned setlist, then delete clone and redirect to OG
  if (intent === "overwrite") {
    const updatedSetlistId = await overwriteSetlist(clonedSetlist.id);
    emitter.emit(`setlist:${updatedSetlistId}`);
    emitter.emit(`setlists`);
    return redirect(`/${bandId}/setlist/${updatedSetlistId}`);
  }
  return null;
}

export default function SaveChanges() {
  const navigation = useNavigation();
  const intent = navigation.formData?.get("intent");
  const isSaving = useSpinDelay(
    navigation.state !== "idle" && intent === "overwrite",
  );
  const isCloning = useSpinDelay(
    navigation.state !== "idle" && intent === "new",
  );

  return (
    <Form method="put">
      <FlexList pad={4}>
        <FlexHeader>
          <h1 className="font-bold">Save these changes?</h1>
          <Link to=".." isRounded>
            <FontAwesomeIcon icon={faTimes} />
          </Link>
        </FlexHeader>
        <p className="text-slate-500">
          You can either save these changes to the exisiting setlist or create a
          new setlist based off these changes and keep the original setlist
          uneffected.
        </p>
        <Button
          name="intent"
          value="overwrite"
          kind="primary"
          type="submit"
          isSaving={isSaving}
          icon={faSave}
        >
          Save
        </Button>
        <Button
          name="intent"
          value="new"
          isSaving={isCloning}
          type="submit"
          icon={faPlus}
        >
          Save as new
        </Button>
      </FlexList>
    </Form>
  );
}
