import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  Form,
  useLoaderData,
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
import { addToBandEmail } from "~/email/add-to-band.server";
import {
  generateJoinBandLink,
  getBand,
  updateBandCode,
} from "~/models/band.server";
import { requireAdminMember } from "~/session.server";
import { getDomainUrl } from "~/utils/assorted";

const emailSchema = z.string().email();
const parseToEmailList = (emails: string) =>
  emails
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
const isEmail = (email: string) => {
  const parse = emailSchema.safeParse(email);
  return parse.success;
};

const AddMemberSchema = z.object({
  intent: z.literal("add-member"),
  emails: z.string().superRefine((string, ctx) => {
    const trimmedEmails = parseToEmailList(string);
    if (!trimmedEmails.length) {
      return string;
    }

    const failingEmails = trimmedEmails.filter((email) =>
      email.trim() ? !isEmail(email.trim()) : true,
    );
    if (failingEmails.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "One or more emails are invalid",
      });
    }
    return string;
  }),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  await requireAdminMember(request, bandId);
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const domainUrl = getDomainUrl(request);
  // generate token link and send email
  const magicLink = await generateJoinBandLink(bandId, domainUrl);

  return { magicLink, band };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Add Members to ${data?.band.name}` || "Add Members" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  await requireAdminMember(request, bandId);
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "generate-code") {
    await updateBandCode(bandId);
  }

  if (intent === "add-member") {
    const submission = parseWithZod(formData, { schema: AddMemberSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const emails = parseToEmailList(submission.value.emails);

    const domainUrl = getDomainUrl(request);
    // generate token link and send email
    const magicLink = await generateJoinBandLink(bandId, domainUrl);
    emails.forEach(async (email) => {
      // send email
      await addToBandEmail(email, magicLink, band.name);
    });

    return { success: true };
  }

  return null;
}

export default function BandSettingsAddMember() {
  const { magicLink } = useLoaderData<typeof loader>();
  const [showSuccess, setShowSuccess] = useState(false);

  const onCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));
  };

  const [form, fields] = useForm({
    id: "add-member",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddMemberSchema });
    },
    defaultValue: {
      intent: "add-member",
      emails: "",
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <div className="p-2 space-y-2">
      <H1>Add Member</H1>
      <Card>
        <CardHeader>
          <CardTitle>New member emails</CardTitle>
          <CardDescription>
            Add an email of the bandmate you want to invite to this band.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" {...getFormProps(form)}>
            <FlexList>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  {...getInputProps(fields.emails, { type: "text" })}
                  placeholder="email@domain.com"
                />
                {fields.emails.errors ? (
                  <p className="text-sm text-destructive">
                    {fields.emails.errors}
                  </p>
                ) : (
                  <Muted>Separate multiple emails with commas</Muted>
                )}
              </div>
              <input
                hidden
                {...getInputProps(fields.intent, { type: "hidden" })}
              />
              <div className="flex sm:block sm:ml-auto">
                <Button className=" grow" type="submit">
                  Send invite
                </Button>
              </div>
            </FlexList>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Don't have their email?</CardTitle>
          <CardDescription>
            No problem! Members can be added by either sending them the link
            below or having them scan the QR code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => onCopy(magicLink)}
              onMouseLeave={() => setShowSuccess(false)}
            >
              <span className="truncate">
                {showSuccess ? "Copied!" : magicLink}
              </span>
              <div className="grow">
                {showSuccess ? (
                  <Check className="w-4 h-4 ml-2" />
                ) : (
                  <Copy className="w-4 h-4 ml-2" />
                )}
              </div>
            </Button>
            <FlexList items="center">
              <QRCode size={300} value={magicLink} />
            </FlexList>
          </FlexList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Reset Invite Links</CardTitle>
          <CardDescription>
            This will invalidate all existing invite links for this band.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="put">
            <FlexList>
              <input type="hidden" name="intent" value="generate-code" />
              <Button type="submit" variant="secondary">
                Reset Invite Link
              </Button>
            </FlexList>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
