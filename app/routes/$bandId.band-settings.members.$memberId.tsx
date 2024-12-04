import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, useLoaderData, useParams } from "@remix-run/react";
import { CircleCheck, CircleX } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { H1, Large, P, Small } from "~/components/typography";
import { getBand } from "~/models/band.server";
import { getUserById } from "~/models/user.server";
import { updateBandMemberRole } from "~/models/usersInBands.server";
import { requireMemberOfRole } from "~/session.server";
import { useMemberRole } from "~/utils";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { createToastHeaders } from "~/utils/toast.server";

const MemberRoleSchema = z.object({
  member_id: z.string(),
  band_id: z.string(),
  role: z.enum(["ADMIN", "MEMBER", "SUB"]),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId, memberId } = params;
  invariant(bandId, "Band ID is required");
  invariant(memberId, "Member ID is required");
  await requireMemberOfRole(request, bandId, RoleEnum.ADMIN);
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const member = await getUserById(memberId);
  if (!member) {
    throw new Response("Member not found", { status: 404 });
  }
  const augmentedMember = {
    ...member,
    role: band.members.find((m) => m.userId === member.id)?.role,
  };
  // if there are other members who are also admins, user can demote self from admin
  const canRemoveAsAdmin = band.members
    .filter((member) => member.userId !== memberId)
    .some((member) => member.role === RoleEnum.ADMIN);

  return { member: augmentedMember, canRemoveAsAdmin };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Member: ${data?.member.name}` || "Member Role" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "Band ID is required");
  await requireMemberOfRole(request, bandId, RoleEnum.ADMIN);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: MemberRoleSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  await updateBandMemberRole(
    bandId,
    submission.value.member_id,
    submission.value.role,
  );
  const toastHeaders = await createToastHeaders({
    title: "Updated!",
    description: "This member's role has been updated successfully.",
    type: "success",
  });
  emitter.emit(emitterKeys.band_settings);
  return data(null, { headers: toastHeaders });
}

export default function BandSettingsMembers() {
  const { bandId } = useParams();
  const { member, canRemoveAsAdmin } = useLoaderData<typeof loader>();
  const userRole = useMemberRole();

  const [form, fields] = useForm({
    id: "member-role",
    defaultValue: {
      member_id: member.id,
      band_id: bandId,
      role: member.role || RoleEnum.MEMBER,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: MemberRoleSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const role = useInputControl(fields.role);
  const disableSubmit =
    userRole === RoleEnum.SUB ||
    !canRemoveAsAdmin ||
    role.value === member.role;

  const memberRoleDisplay = {
    ADMIN: "Admin",
    MEMBER: "Member",
    SUB: "Sub",
  }[role.value || "MEMBER"];

  const roleDescription = {
    ADMIN:
      "Admins have full control over all aspects of the band and its setlists and songs.",
    MEMBER:
      "Members have limited control over the band, but full control over its setlists and songs.",
    SUB: "Subs have read-only access to the band as well as its setlists and songs.",
  }[role.value || "MEMBER"];

  const isAdmin = role.value === RoleEnum.ADMIN;
  const isSub = role.value === RoleEnum.SUB;

  return (
    <div className="p-2 space-y-2">
      <H1>Member Role</H1>
      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>
            Update the role of the member within the band. Members can take one
            of three roles within the band: Admin, Member, or Sub.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <div>
            <Label>Member Name</Label>
            <P>{member.name}</P>
          </div>
          <div>
            <Label>Current Role</Label>
            <P>{member.role}</P>
          </div>
        </CardContent>
      </Card>
      <Form
        method="put"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <div className="grid gap-2 grid-cols-1">
          <Card>
            <CardHeader>
              <CardTitle>Update Member Role</CardTitle>
              <CardDescription>
                For Details about each role, see below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ToggleGroup
                type="single"
                value={role.value}
                onValueChange={role.change}
                size="lg"
              >
                <ToggleGroupItem value={RoleEnum.ADMIN} aria-label="Admin">
                  Admin
                </ToggleGroupItem>
                <ToggleGroupItem value={RoleEnum.MEMBER} aria-label="Member">
                  Member
                </ToggleGroupItem>
                <ToggleGroupItem value={RoleEnum.SUB} aria-label="Sub">
                  Sub
                </ToggleGroupItem>
              </ToggleGroup>
              <input
                hidden
                {...getInputProps(fields.member_id, { type: "hidden" })}
              />
              <input
                hidden
                {...getInputProps(fields.band_id, { type: "hidden" })}
              />
            </CardContent>
            <CardFooter>
              <div className="flex gap-2 flex-col w-full sm:items-end">
                <Button size="sm" type="submit" disabled={disableSubmit}>
                  Update Role
                </Button>
                <Small>
                  {canRemoveAsAdmin
                    ? ""
                    : "Bands must have at least one admin. Add another user as admin before changing your role."}
                </Small>
              </div>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{memberRoleDisplay}</CardTitle>
              <CardDescription>{roleDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Large>Band Controls</Large>
                <ul>
                  <li className="flex items-center">
                    {isAdmin ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can add and remove members.
                  </li>
                  <li className="flex items-center">
                    {isAdmin ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can update band details such as name and avatar.
                  </li>
                  <li className="flex items-center">
                    {isAdmin ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can delete the band.
                  </li>
                </ul>
              </div>
              <div>
                <Large>Setlist Controls</Large>
                <ul>
                  <li className="flex items-center">
                    <CircleCheck className="mr-2 text-primary" />
                    Can see setlists
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can create setlists
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can edit setlists
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can delete setlists
                  </li>
                </ul>
              </div>
              <div>
                <Large>Song Controls</Large>
                <ul>
                  <li className="flex items-center">
                    <CircleCheck className="mr-2 text-primary" />
                    Can see songs
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can create songs
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can edit songs
                  </li>
                  <li className="flex items-center">
                    {!isSub ? (
                      <CircleCheck className="mr-2 text-primary" />
                    ) : (
                      <CircleX className="mr-2" />
                    )}
                    Can delete songs
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </Form>
    </div>
  );
}
