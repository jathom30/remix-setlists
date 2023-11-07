import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect , json } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  Button,
  CatchContainer,
  ErrorContainer,
  ErrorMessage,
  FlexList,
  Input,
} from "~/components";
import { deleteBand, getBandName } from "~/models/band.server";
import { deleteImage } from "~/models/cloudinary.server";
import { requireAdminMember } from "~/session.server";
import { getFields } from "~/utils/form";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireAdminMember(request, bandId);
  const bandName = await getBandName(bandId);

  if (!bandName) {
    throw new Response("Band not found", { status: 404 });
  }

  return json({ bandName: bandName.name });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireAdminMember(request, bandId);
  const formData = await request.formData();

  const { errors } = getFields<{ bandName: string }>(formData, [
    { name: "bandName", type: "string", isRequired: true },
  ]);

  if (Object.keys(errors).length) {
    return json({ errors });
  }

  await deleteImage(bandId);
  await deleteBand(bandId);
  return redirect("/home");
}

export default function DeleteBand() {
  const { bandName } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isDisabled, setIsDisabled] = useState(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsDisabled(e.target.value !== bandName);
  };

  return (
    <Form method="delete">
      <FlexList pad={4} gap={2}>
        <h3 className="font-bold">Are you sure?</h3>
        <p className="text-xs text-text-subdued">
          Deleting this band will destroy all songs and setlists associated with
          the band as well as remove any other band member's connection to this
          band.
        </p>
        <p className="text-xs text-text-subdued">
          To delete, type this band's name below.
        </p>
        <Input onChange={handleChange} name="bandName" placeholder={bandName} />
        {actionData?.errors.bandName ? (
          <ErrorMessage message="Band name must match" />
        ) : null}
        <Button kind="error" type="submit" isDisabled={isDisabled}>
          Delete
        </Button>
      </FlexList>
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
