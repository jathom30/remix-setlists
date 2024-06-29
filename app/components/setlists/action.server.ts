import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import {
  copySetlist,
  deleteSetlist,
  updateMultiSetSetlist,
  updateSetlist,
  updateSetlistName,
} from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";

import {
  ActionSetSchema,
  CloneSetlistSchema,
  CreatePublicLinkSchema,
  DeleteSetlistSchema,
  FormSchema,
  IntentSchema,
  RemovePublicLinkSchema,
  SetlistNameSchema,
} from "./form-schemas";

export async function setlistAction({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["update-setlist"]) {
    const submission = parseWithZod(formData, { schema: FormSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const parsedSets = ActionSetSchema.parse(JSON.parse(submission.value.sets));
    const sets = Object.values(parsedSets);
    const updatedSetlist = await updateMultiSetSetlist(setlistId, sets);
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["update-name"]) {
    const submission = parseWithZod(formData, { schema: SetlistNameSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }

    const updatedSetlist = await updateSetlistName(
      setlistId,
      submission.value.setlist_name,
    );
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["delete-setlist"]) {
    const submission = parseWithZod(formData, { schema: DeleteSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // delete setlist
    await deleteSetlist(setlistId);
    return redirect(`/${bandId}/setlists`);
  }

  if (intent === IntentSchema.Enum["clone-setlist"]) {
    const submission = parseWithZod(formData, { schema: CloneSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // clone setlist
    const newSetlist = await copySetlist(setlistId);
    if (!newSetlist) {
      throw new Response("Failed to clone setlist", { status: 500 });
    }
    return redirect(`/${bandId}/setlists/${newSetlist.id}`);
  }

  if (intent === IntentSchema.Enum["create-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: CreatePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: true });
    return json(submission.payload);
  }

  if (intent === IntentSchema.Enum["remove-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: RemovePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: false });
    return json(submission.payload);
  }

  return null;
}
