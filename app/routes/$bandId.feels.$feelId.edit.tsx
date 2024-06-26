import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
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
import { FlexList } from "~/components";
import { H1, Muted } from "~/components/typography";
import { getFeel, updateFeel } from "~/models/feel.server";
import { requireUserId } from "~/session.server";

const EditFeelSchema = z.object({
  feel_id: z.string(),
  label: z.string().min(1),
  color: z.string().min(1),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { feelId } = params;
  invariant(feelId, "feelId is required");
  const feel = await getFeel(feelId);
  if (!feel) {
    throw new Response("Feel not found", { status: 404 });
  }
  return json({ feel });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Edit ${data?.feel.label}` || "Edit Feel" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { feelId, bandId } = params;
  invariant(feelId, "feelId is required");
  invariant(bandId, "bandId is required");
  const formData = await request.formData();

  const searchParams = new URL(request.url).searchParams;
  const redirectTo = searchParams.get("redirectTo");

  const submission = parseWithZod(formData, { schema: EditFeelSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const feel = await updateFeel(feelId, {
    label: submission.value.label,
    color: submission.value.color,
  });
  if (!feel) {
    throw new Response("Feel not found", { status: 404 });
  }
  return redirect(redirectTo ?? `/${bandId}/feels/${feel.id}`);
}

export default function EditFeelPage() {
  const { feel } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    id: "edit-feel",
    lastResult,
    defaultValue: {
      feel_id: feel.id,
      label: feel.label,
      color: feel.color,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditFeelSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const color = useInputControl(fields.color);

  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="p-2 space-y-2"
    >
      <H1>Edit Feel</H1>
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>
            Modifying the feel here will update its appearance throughout the
            app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <input
              hidden
              {...getInputProps(fields.feel_id, { type: "hidden" })}
            />
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
              <FlexList direction="row" gap={2} items="start">
                <div className="flex-grow">
                  <HexColorPicker
                    id={fields.color.id}
                    color={color.value}
                    onChange={color.change}
                    onFocus={color.focus}
                    onBlur={color.blur}
                  />
                </div>
                <div className="space-y-2">
                  <FlexList direction="row" gap={1} items="center">
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: feel.color || "",
                      }}
                    />
                    <Muted>Original Color</Muted>
                  </FlexList>
                  <FlexList direction="row" items="center" gap={1}>
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{
                        backgroundColor: color.value,
                      }}
                    />
                    <Muted>Updated Color</Muted>
                  </FlexList>
                </div>
              </FlexList>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row-reverse">
            <Button type="submit">Update Feel</Button>
            <Button variant="outline" asChild>
              <Link to={redirectTo ?? `/${feel.bandId}/feels/${feel.id}`}>
                Cancel
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </Form>
  );
}
