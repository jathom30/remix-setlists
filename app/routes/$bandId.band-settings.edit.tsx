import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
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
import { FlexList } from "~/components";
import { H1 } from "~/components/typography";
import { getBand, updateBandName } from "~/models/band.server";
import { requireUserId } from "~/session.server";

const FormSchema = z
  .object({
    band_name: z.string().min(1),
    band_id: z.string().min(1),
    // avatar: z.instanceof(File).optional(),
  })
  .required();

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  return json({ band });
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: FormSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  await updateBandName(bandId, submission.value.band_name);
  return redirect(`/${bandId}/band-settings`);
}

export default function BandSettingsEdit() {
  const { band } = useLoaderData<typeof loader>();
  const [form, fields] = useForm({
    id: "band-settings-edit",
    defaultValue: {
      band_name: band.name,
      // avatar: band.icon?.path ?? "",
      band_id: band.id,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: FormSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  return (
    <div className="p-2 space-y-2">
      <H1>Edit Details</H1>
      <Form
        method="put"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Update the band name and avatar here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              hidden
              {...getInputProps(fields.band_id, { type: "hidden" })}
            />
            <div
              id={fields.band_id.errorId}
              className="text-sm text-destructive"
            >
              {fields.band_id.errors}
            </div>
            <FlexList gap={2}>
              <div>
                <Label htmlFor={fields.band_name.name}>Name</Label>
                <Input
                  {...getInputProps(fields.band_name, { type: "text" })}
                  placeholder="Band name"
                />
                <div
                  id={fields.band_name.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.band_name.errors}
                </div>
              </div>
              {/* <div>
                <Label htmlFor={fields.avatar.name}>Avatar</Label>
                <Input {...getInputProps(fields.avatar, { type: "file" })} />
                <div
                  id={fields.avatar.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.avatar.errors}
                </div>
              </div> */}
            </FlexList>
          </CardContent>
          <CardFooter>
            <FlexList direction="row" gap={2} justify="end">
              <Button variant="ghost" asChild>
                <Link to={`/${band.id}/band-settings`}>Cancel</Link>
              </Button>
              <Button type="submit">Save</Button>
            </FlexList>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
