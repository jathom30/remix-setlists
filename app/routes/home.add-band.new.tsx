import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, MetaFunction } from "react-router";
import { Form } from "react-router";
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
import { H1 } from "~/components/typography";
import { createBand } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { redirectWithToast } from "~/utils/toast.server";

const FormSchema = z
  .object({
    name: z.string().min(1),
  })
  .required();

export const meta: MetaFunction = () => {
  return [{ title: "New Band" }];
};

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const band = await createBand({ name: submission.value.name }, userId);
  emitter.emit(emitterKeys.bands);
  emitter.emit(emitterKeys.dashboard);
  return redirectWithToast(`/${band.id}`, {
    title: "Band Created",
    description: "Your band has been created successfully.",
    type: "success",
  });
}
export default function BandNew() {
  const [form, fields] = useForm({
    defaultValue: { name: "" },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FormSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="p-2 space-y-2">
      <H1>New Band</H1>
      <Form
        method="post"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create a new band</CardTitle>
            <CardDescription>
              All you need is a band name to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label>Band Name</Label>
            <Input
              {...getInputProps(fields.name, { type: "text" })}
              placeholder="Band name"
            />
          </CardContent>
          <CardFooter>
            <Button type="submit">Create Band</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
