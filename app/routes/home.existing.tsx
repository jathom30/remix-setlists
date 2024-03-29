import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useRouteError,
} from "@remix-run/react";

import {
  CatchContainer,
  ErrorContainer,
  ErrorMessage,
  FlexList,
  Input,
  Label,
  SaveButtons,
} from "~/components";
import { updateBandByCode } from "~/models/band.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const bandCode = formData.get("bandCode")?.toString();

  if (!bandCode) {
    return json({ error: "Band code is required" });
  }

  const band = await updateBandByCode(bandCode, userId);
  if ("error" in band) {
    return json({ error: band.error });
  }
  return redirect(`/${band.id}/setlists`);
}

export default function ExisitingBand() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="put">
      <FlexList gap={0} pad={4}>
        <Label>Band Code</Label>
        <Input name="bandCode" placeholder="Enter your band code here..." />
        {actionData?.error ? <ErrorMessage message={actionData.error} /> : null}
      </FlexList>
      <SaveButtons saveLabel="Add me to this band" cancelTo=".." />
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
