import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, data } from "@remix-run/node";
import invariant from "tiny-invariant";

import {
  copySetlist,
  deleteSetlist,
  updateMultiSetSetlist,
  updateSetlist,
  updateSetlistName,
} from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { createToastHeaders, redirectWithToast } from "~/utils/toast.server";

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

    const toastHeaders = await createToastHeaders({
      title: "Updated!",
      description: "This setlist has been updated successfully.",
      type: "success",
    });
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);
    return data({ updatedSetlist }, { headers: toastHeaders });
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
    const toastHeaders = await createToastHeaders({
      title: "Name updated!",
      description: "This setlist name been updated successfully.",
      type: "success",
    });
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);
    return data({ updatedSetlist }, { headers: toastHeaders });
  }

  if (intent === IntentSchema.Enum["delete-setlist"]) {
    const submission = parseWithZod(formData, { schema: DeleteSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // delete setlist
    await deleteSetlist(setlistId);
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);

    return redirectWithToast(`/${bandId}/setlists`, {
      title: "Setlist deleted!",
      description: "This set has been deleted successfully.",
      type: "success",
    });
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
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);
    return redirectWithToast(`/${bandId}/setlists/${newSetlist.id}`, {
      title: "Setlist cloned!",
      description: "This setlist has been cloned successfully.",
      type: "success",
    });
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
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);
    const toastHeaders = await createToastHeaders({
      title: "Link created!",
      description: "This setlist's publ;ic link has been created.",
      type: "success",
    });
    return data(submission.payload, { headers: toastHeaders });
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
    const toastHeaders = await createToastHeaders({
      title: "Link removed!",
      description: "This setlist is no longer public.",
      type: "success",
    });
    emitter.emit(emitterKeys.setlists);
    emitter.emit(emitterKeys.dashboard);
    return data(submission.payload, { headers: toastHeaders });
  }

  return null;
}
