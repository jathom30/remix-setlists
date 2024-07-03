import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H1, Muted } from "~/components/typography";
import { updateBandByCode } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserId(request);

  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get("code");

  return json({ code });
}

export const meta: MetaFunction = () => {
  return [{ title: "Join Band" }];
};

const FormSchema = z
  .object({
    code: z.string().length(6),
  })
  .required();

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const band = await updateBandByCode(submission.value.code, userId);
  if ("error" in band) {
    return submission.reply({ fieldErrors: { code: [band.error] } });
  }
  emitter.emit(emitterKeys.bands);
  emitter.emit(emitterKeys.dashboard);
  return redirectWithToast(`/${band.id}`, {
    title: "Joined Band",
    description: "You have successfully joined the band.",
    type: "success",
  });
}

export default function BandExisting() {
  const { code } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { code: code || "" },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FormSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  return (
    <div className="p-2 space-y-2">
      <H1>Join Band</H1>
      <Form
        method="put"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <Card>
          <CardHeader>
            <CardTitle>Join an existing band</CardTitle>
            <CardDescription>
              Enter the band code provided by the band leader to join an
              existing band.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Band Code</Label>
            <Input
              {...getInputProps(fields.code, { type: "text" })}
              placeholder="Band code"
            />
            <Muted>Please enter the code exacted as you received it.</Muted>
            <div id={fields.code.errorId} className="text-sm text-destructive">
              {fields.code.errors}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Join Band</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
