import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  isRouteErrorResponse,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
} from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useSpinDelay } from "spin-delay";

import {
  Button,
  CatchContainer,
  ErrorContainer,
  ErrorMessage,
  FlexList,
  Input,
} from "~/components";
import { deleteBand, getBand } from "~/models/band.server";
import { deleteUserByEmail } from "~/models/user.server";
import { getUserBands } from "~/models/usersInBands.server";
import { requireUser } from "~/session.server";
import { validateEmail } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  return json({ userEmail: user?.email });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const email = formData.get("email");

  if (!validateEmail(email)) {
    return json({
      errors: { email: "Not a valid email" },
    });
  }
  if (email !== user.email) {
    return json({
      errors: { email: "Email does not match" },
    });
  }

  const userBands = await getUserBands(user.id);
  await Promise.all(
    userBands.map(async (userBand) => {
      const band = await getBand(userBand.bandId);
      if (!band) return null;
      // if user is only member in the band, delete band
      const userIsOnlyMember = band?.members.every(
        (member) => member.userId === user.id,
      );
      // if other members, but no other Admins, delete band
      const userIsOnlyAdmin = band.members
        .filter((member) => member.userId !== user.id)
        .every((member) => member.role !== RoleEnum.ADMIN);
      if (userIsOnlyMember || userIsOnlyAdmin) {
        return await deleteBand(band.id);
      }
    }),
  );

  await deleteUserByEmail(email);
  return redirect(".");
}

export default function DeleteUser() {
  const { userEmail } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isDisabled, setIsDisabled] = useState(true);
  const navigation = useNavigation();
  const isSubmitting = useSpinDelay(navigation.state !== "idle");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsDisabled(e.target.value !== userEmail);
  };

  return (
    <Form method="delete">
      <FlexList pad={4} gap={2}>
        <h3 className="font-bold">Are you sure?</h3>
        <p className="text-xs text-text-subdued">
          Deleting your account is a <strong>perminant</strong> action and
          cannot be undone. If you wish to keep any bands intact after your
          deletion, promote another user to <strong>ADMIN</strong>. Otherwise,
          your bands and their songs and setlists will be deleted. Good luck and
          may god have mercy on your soul.
        </p>
        <p className="text-xs text-text-subdued">
          To delete, type your email below.
        </p>
        <Input
          onChange={handleChange}
          name="email"
          placeholder={userEmail}
          type="email"
        />
        {actionData?.errors.email ? (
          <ErrorMessage message="user email must match" />
        ) : null}
        <Button
          kind="error"
          type="submit"
          isSaving={isSubmitting}
          isDisabled={isDisabled}
        >
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
