import { redirect, json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, Link, useLoaderData, useParams } from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button, ConfirmDelete, ErrorContainer, FlexList } from "~/components";
import { getBand } from "~/models/band.server";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const userId = await requireUserId(request);
  const { bandId, removeId } = params;
  invariant(bandId, "bandId not found");
  invariant(removeId, "removeId not found");
  const band = await getBand(removeId);

  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }

  // can remove member if user is not the only admin in the band.
  const canRemoveMember =
    band.members
      .filter((member) => member.userId !== userId)
      .reduce(
        (total, member) =>
          (total +=
            (member.role as unknown as RoleEnum) === RoleEnum.ADMIN ? 1 : 0),
        0,
      ) > 0;

  return json({ canRemoveMember });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { removeId, bandId } = params;
  invariant(removeId, "removeId not found");
  invariant(bandId, "bandId not found");

  await removeMemberFromBand(removeId, userId);
  if (bandId !== removeId) {
    return redirect(`/${bandId}/user`);
  }
  return redirect(`/home`);
}

export default function RemoveSelfFromBand() {
  const { canRemoveMember } = useLoaderData<typeof loader>();
  const { removeId } = useParams();
  if (!canRemoveMember) {
    return (
      <FlexList pad={4}>
        <span className="font-bold">Cannot remove self from band.</span>
        <p className="text-danger text-sm">
          You are the only admin. Make at least one other member an Admin before
          removing yourself.
        </p>
        <p className="text-sm">
          Instead, if you would rather delete this band, you can do so{" "}
          <Link
            className="underline text-error"
            to={`/${removeId}/band/delete`}
          >
            here
          </Link>
          .
        </p>
        <Button isDisabled>Remove</Button>
      </FlexList>
    );
  }
  return (
    <Form method="put">
      <ConfirmDelete
        label="Remove self from band?"
        message="Removing yourself from this band will remove your access to this band's songs and setlists."
        cancelTo=".."
      />
    </Form>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />;
}
