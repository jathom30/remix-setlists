import { Form, useActionData } from "@remix-run/react";
import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useState } from "react";
import invariant from "tiny-invariant";
import {
  ErrorMessage,
  Field,
  FlexList,
  Input,
  PasswordStrength,
  SaveButtons,
} from "~/components";
import { requireUserId } from "~/session.server";
import { getPasswordError, passwordStrength } from "~/utils/assorted";
import { updateUserPassword } from "~/models/user.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const formData = await request.formData();
  const password = formData.get("password");
  const verifyPassword = formData.get("verifyPassword");

  if (typeof password !== "string" || typeof verifyPassword !== "string") {
    throw new Response("passwords are not strings");
  }

  const { tests } = passwordStrength(password);

  const passwordError = getPasswordError(tests);
  if (passwordError) {
    return json({
      errors: { password: passwordError, verifyPassword: null },
    });
  }
  if (password !== verifyPassword) {
    return json({
      errors: { password: null, verifyPassword: "passwords must match" },
    });
  }

  await updateUserPassword(userId, password);
  return redirect(`/${bandId}/user`);
}

export default function UpdatePassword() {
  const actionData = useActionData<typeof action>();
  const [password, setPassword] = useState("");
  const { tests, strength } = passwordStrength(password);

  const isValid = Object.values(tests).every((test) => test);

  return (
    <Form method="put">
      <FlexList pad={4}>
        <p className="font-bold">Update your password</p>
        <Field name="password" label="Password">
          <Input
            name="password"
            type="password"
            placeholder="Update password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {actionData?.errors.password ? (
            <ErrorMessage message={actionData?.errors.password} />
          ) : null}
        </Field>
        <PasswordStrength tests={tests} strength={strength} />
        <Field name="verifyPassword" label="Verify password">
          <Input
            name="verifyPassword"
            type="password"
            placeholder="Verify password"
          />
          {actionData?.errors?.verifyPassword ? (
            <ErrorMessage message="Passwords must match" />
          ) : null}
        </Field>
      </FlexList>
      <SaveButtons
        isDisabled={!isValid}
        saveLabel="Update password"
        cancelTo=".."
      />
    </Form>
  );
}
