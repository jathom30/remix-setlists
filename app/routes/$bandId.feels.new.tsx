import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { Form, Link, useActionData, useParams } from "@remix-run/react";
import { HexColorPicker } from "react-colorful";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { H1 } from "~/components/typography";
import { createFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";

const CreateFeelSchema = z.object({
  label: z.string().min(1),
  color: z.string().min(1),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  return null;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: CreateFeelSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const feel = await createFeel(
    submission.value.label,
    bandId,
    submission.value.color,
  );
  return redirect(`/${bandId}/feels/${feel.id}`);
}

export default function BandFeelCreate() {
  const { bandId } = useParams();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "create-feel",
    lastResult,
    defaultValue: {
      label: "",
      color: "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateFeelSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const color = useInputControl(fields.color);
  return (
    <Form
      method="post"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="p-2 space-y-2"
    >
      <H1>Create Feel</H1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Modifying the feel here will set its appearance throughout the app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <Label htmlFor={fields.label.id}>Label</Label>
              <Input
                {...getInputProps(fields.label, { type: "text" })}
                placeholder="Feel label"
              />
              <div
                className="text-sm text-destructive"
                id={fields.label.errorId}
              >
                {fields.label.errors}
              </div>
            </div>

            <div>
              <Label htmlFor={fields.color.id}>Color</Label>
              <HexColorPicker
                id={fields.color.id}
                color={color.value}
                onChange={color.change}
                onFocus={color.focus}
                onBlur={color.blur}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button type="submit">Create Feel</Button>
            <Button variant="outline" asChild>
              <Link to={`/${bandId}/feels`}>Cancel</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </Form>
  );
}
