import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { HexColorPicker } from "react-colorful";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  redirect,
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "react-router";
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
import { getMemberRole } from "~/models/usersInBands.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { redirectWithToast } from "~/utils/toast.server";

const EditFeelSchema = z.object({
  feel_id: z.string(),
  label: z.string().min(1),
  color: z.string().min(1),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { feelId, bandId } = params;
  invariant(feelId, "feelId is required");
  invariant(bandId, "bandId is required");
  const memberRole = await getMemberRole(bandId, userId);

  if (memberRole === RoleEnum.SUB) {
    return redirect(`/${bandId}/feels/${feelId}`);
  }
  const feel = await getFeel(feelId);
  if (!feel) {
    throw new Response("Feel not found", { status: 404 });
  }
  if (feel.bandId !== bandId) {
    throw new Response("Feel does not belong to this band.", { status: 403 });
  }
  return { feel };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Edit ${data?.feel.label}` || "Edit Feel" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { feelId, bandId } = params;
  invariant(feelId, "feelId is required");
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);
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
  emitter.emit(emitterKeys.feels);
  emitter.emit(emitterKeys.dashboard);
  return redirectWithToast(redirectTo ?? `/${bandId}/feels/${feel.id}`, {
    title: "Feel Updated",
    description: "Your feel has been updated successfully.",
    type: "success",
  });
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
            <Button type="submit">Save</Button>
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
