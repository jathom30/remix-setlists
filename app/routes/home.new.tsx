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
  SaveButtons,
} from "~/components";
import { createBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const name = formData.get("name");

  const hasName = name && typeof name === "string";

  if (hasName) {
    const band = await createBand({ name }, userId);
    return redirect(`/${band.id}/setlists`);
  }
  return json({ errors: { name: "Band name is required" } });
}

export default function NewBand() {
  const actionData = useActionData<typeof action>();

  return (
    <Form method="post">
      <FlexList pad={4} gap={0}>
        <h1>Create a new band</h1>
        <Input name="name" placeholder="Band name..." />
        {actionData?.errors.name ? (
          <ErrorMessage message="Band name is required" />
        ) : null}
      </FlexList>
      <SaveButtons saveLabel="Create" cancelTo=".." />
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
