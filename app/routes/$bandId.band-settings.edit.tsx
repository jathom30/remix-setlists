import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  UploadHandler,
  json,
  redirect,
  unstable_composeUploadHandlers,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useNavigation } from "@remix-run/react";
import { ChangeEvent, useState } from "react";
import { useSpinDelay } from "spin-delay";
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
import { updateBandIcon } from "~/models/bandIcon.server";
import { uploadImage } from "~/models/cloudinary.server";
import { requireUserId } from "~/session.server";

const MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB

const FormSchema = z.object({
  band_name: z.string().min(1),
  file: z
    .instanceof(File, { message: "File is required" })
    .optional()
    .refine((file) => {
      // if (!file) return false;
      return (file?.size || 0) <= MAX_UPLOAD_SIZE;
      // "File size must be less than 3MB",
    }),
});

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

  const uploadHandler: UploadHandler = unstable_composeUploadHandlers(
    async ({
      name,
      data,
      filename,
    }): Promise<string | File | null | undefined> => {
      if (name !== "file") {
        return undefined;
      }
      // form allows for empty file uploads
      if (!filename) {
        return undefined;
      }
      const uploadedImage = await uploadImage(data, bandId);
      return uploadedImage.secure_url;
    },
    unstable_createMemoryUploadHandler(),
  );
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler,
  );
  const submission = parseWithZod(formData, {
    schema: z.object({
      band_name: z.string().min(1),
      file: z.string().optional(),
    }),
  });
  if (submission.status !== "success") {
    return submission.reply();
  }
  await updateBandName(bandId, submission.value.band_name);
  const file = submission.value.file;
  if (file) {
    await updateBandIcon(bandId, { path: file });
  }

  return redirect(`/${bandId}/band-settings`);
}

export default function BandSettingsEdit() {
  const { band } = useLoaderData<typeof loader>();
  const [image, setImage] = useState(band.icon?.path || "");
  const navigation = useNavigation();
  const isTransitioning = useSpinDelay(navigation.state !== "idle");

  const [form, fields] = useForm({
    id: "document-form",
    constraint: getZodConstraint(FormSchema),
    defaultValue: {
      band_name: band.name,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: FormSchema,
      });
    },
    shouldValidate: "onBlur",
  });

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  return (
    <div className="p-2 space-y-2">
      <H1>Edit Details</H1>
      <Form method="put" encType="multipart/form-data" {...getFormProps(form)}>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Update the band name and avatar here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FlexList gap={2}>
              <div>
                <Label htmlFor="band_name">Name</Label>
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
              {image ? (
                <div className="aspect-square max-w-xs m-auto overflow-hidden rounded-full">
                  <img
                    className="w-full h-full object-cover"
                    src={image}
                    alt="band logo"
                  />
                </div>
              ) : (
                <span>Max size: 10MB</span>
              )}
              <Input
                {...getInputProps(fields.file, { type: "file" })}
                onChange={onImageChange}
                accept="image/*"
                placeholder="Upload image"
              />
            </FlexList>
          </CardContent>
          <CardFooter>
            <FlexList direction="row" gap={2} justify="end">
              <Button variant="ghost" asChild>
                <Link to={`/${band.id}/band-settings`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isTransitioning}>
                {isTransitioning ? "Saving..." : "Save"}
              </Button>
            </FlexList>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
