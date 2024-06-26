import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { Check, Copy, EllipsisVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FlexList } from "~/components";
import { H1, P, Small, Large, H3 } from "~/components/typography";
import {
  deleteBand,
  getBand,
  getBandMembers,
  updateBandCode,
} from "~/models/band.server";
import { getUsersById } from "~/models/user.server";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import {
  requireAdminMember,
  requireUser,
  requireUserId,
} from "~/session.server";
import { useMemberRole, useUser } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { RoleEnum } from "~/utils/enums";

const IntentSchema = z.enum([
  "delete-band",
  "remove-member",
  "member-role",
  "generate-code",
]);

const DeleteBandSchema = z.object({
  band_id: z.string(),
  intent: z.literal(IntentSchema.Enum["delete-band"]),
});

const DeleteMemberSchema = z.object({
  band_id: z.string(),
  member_id: z.string(),
  intent: z.literal(IntentSchema.Enum["remove-member"]),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const band = await getBand(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  const members = await getUsersById(
    band.members.map((member) => member.userId),
  );
  const augmentedMembers = members.map((member) => ({
    ...member,
    role: band.members.find((m) => m.userId === member.id)?.role,
  }));

  const domainUrl = getDomainUrl(request);
  const qrCodeAddress = `${domainUrl}/home/add-band/existing?code=${band.code}`;

  return json({ band, members: augmentedMembers, qrCodeAddress });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["delete-band"]) {
    const submission = parseWithZod(formData, { schema: DeleteBandSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await getBandMembers(submission.value.band_id);
    if (!band) {
      throw new Response("Band not found", { status: 404 });
    }
    const memberRole = band.members.find((m) => m.userId === user.id)?.role;
    if (memberRole !== RoleEnum.ADMIN) {
      throw new Response("You do not have permission to delete this band", {
        status: 403,
      });
    }
    await deleteBand(submission.value.band_id);
    return redirect("/");
  }

  if (intent === IntentSchema.Enum["remove-member"]) {
    const submission = parseWithZod(formData, { schema: DeleteMemberSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await getBandMembers(submission.value.band_id);
    if (!band) {
      throw new Response("Band not found", { status: 404 });
    }
    const memberRole = band.members.find((m) => m.userId === user.id)?.role;
    if (memberRole !== RoleEnum.ADMIN) {
      throw new Response("You do not have permission to delete this member", {
        status: 403,
      });
    }
    // TODO check if deleted member is the last admin first
    await removeMemberFromBand(
      submission.value.band_id,
      submission.value.member_id,
    );
    // After removal of a member, we should update the band's code
    await updateBandCode(submission.value.band_id);
    return null;
  }

  if (intent === IntentSchema.Enum["generate-code"]) {
    const { bandId } = params;
    invariant(bandId, "bandId is required");
    await requireAdminMember(request, bandId);
    await updateBandCode(bandId);
    return null;
  }

  return null;
}

export default function BandSettings() {
  const { band, members } = useLoaderData<typeof loader>();
  const user = useUser();
  const memberRole = useMemberRole();
  const isAdmin = memberRole === RoleEnum.ADMIN;

  return (
    <div className="p-2 space-y-2">
      <H1>Band Settings</H1>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Details</CardTitle>
            {isAdmin ? (
              <Button variant="outline" asChild>
                <Link to="edit">Edit</Link>
              </Button>
            ) : null}
          </FlexList>
          <CardDescription>
            Created on {new Date(band.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={band.icon?.path || ""} alt={band.name} />
            <AvatarFallback>{band.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <H3>{band.name}</H3>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Members</CardTitle>
            {isAdmin ? <AddMemberDialog /> : null}
          </FlexList>
          <CardDescription>Manage the members of your band.</CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList gap={1}>
            {members.map((member) => (
              <FlexList
                direction="row"
                items="center"
                justify="between"
                key={member.id}
              >
                <FlexList direction="row" gap={2}>
                  <P>{member.name}</P>
                  <Badge variant="secondary">{member.role}</Badge>
                </FlexList>
                {isAdmin || member.id === user.id ? (
                  <MemberSettings bandId={band.id} memberId={member.id} />
                ) : null}
              </FlexList>
            ))}
          </FlexList>
        </CardContent>
      </Card>
      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Deleting this band is a perminant action and cannot be undone. It
              will remove all songs, setlists, and other data associated with
              this band.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <DeleteBandDialog bandId={band.id} />
          </CardFooter>
        </Card>
      ) : null}
    </div>
  );
}

const DeleteBandDialog = ({ bandId }: { bandId: string }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-band"],
    defaultValue: {
      band_id: bandId,
      intent: IntentSchema.Enum["delete-band"],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteBandSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Band</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this Band?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. Are you sure you want
            to delete this band?
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <input
            hidden
            {...getInputProps(fields.band_id, { type: "hidden" })}
          />
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          {fields.intent.errors}
          <DialogFooter>
            <Button variant="destructive">Delete Band</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const MemberSettings = ({
  memberId,
  bandId,
}: {
  memberId: string;
  bandId: string;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button title="Update member settings" variant="ghost" size="icon">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Feel Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`members/${memberId}`}>
            <Pencil className="w-4 h-4 mr-2" />
            Adjust Role
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
          <Trash className="w-4 h-4 mr-2" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
      <DeleteMemberDialog
        bandId={bandId}
        memberId={memberId}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </DropdownMenu>
  );
};

const DeleteMemberDialog = ({
  bandId,
  memberId,
  open,
  onOpenChange,
}: {
  bandId: string;
  memberId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { members } = useLoaderData<typeof loader>();
  const user = useUser();

  const isOnlyAdmin =
    members.filter((m) => m.role === RoleEnum.ADMIN && m.id === user.id)
      .length === 1;
  console.log(isOnlyAdmin);

  const [form, fields] = useForm({
    id: IntentSchema.Enum["remove-member"],
    defaultValue: {
      member_id: memberId,
      band_id: bandId,
      intent: IntentSchema.Enum["remove-member"],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteMemberSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isOnlyAdmin ? "Unable to remove member" : "Remove this Member?"}
          </DialogTitle>
          <DialogDescription>
            {isOnlyAdmin
              ? "Bands must have at least one Admin member."
              : "This action will remove this member from the band. They can be re-added at any time in the future."}
          </DialogDescription>
        </DialogHeader>
        <CardContent>
          <P>
            You are the only Admin member of this band. Either promote someone
            else to Admin or delete the band.
          </P>
        </CardContent>
        {!isOnlyAdmin ? (
          <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
            <input
              hidden
              {...getInputProps(fields.member_id, { type: "hidden" })}
            />
            <input
              hidden
              {...getInputProps(fields.band_id, { type: "hidden" })}
            />
            <input
              hidden
              {...getInputProps(fields.intent, { type: "hidden" })}
            />
            {fields.intent.errors}
            <DialogFooter>
              <Button variant="destructive">Remove Member</Button>
            </DialogFooter>
          </Form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

const AddMemberDialog = () => {
  const {
    qrCodeAddress,
    band: { code },
  } = useLoaderData<typeof loader>();
  const [showSuccess, setShowSuccess] = useState(false);

  const onCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add Member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Members can be added by either sending them the link below or having
            them scan the QR code.
          </DialogDescription>
        </DialogHeader>
        <FlexList gap={2}>
          <Button
            variant="outline"
            onClick={() => onCopy(qrCodeAddress)}
            onMouseLeave={() => setShowSuccess(false)}
          >
            {showSuccess ? "Copied!" : qrCodeAddress}
            {showSuccess ? (
              <Check className="w-4 h-4 ml-2" />
            ) : (
              <Copy className="w-4 h-4 ml-2" />
            )}
          </Button>
          <FlexList items="center" gap={0}>
            <QRCode value={qrCodeAddress} />
            <Large>{code}</Large>
          </FlexList>
          <Form method="put">
            <FlexList>
              <Small>
                You may, at any time, update the code associated with this band
                to invalidate any old invites or prevent unwanted members from
                joining or rejoining this band.
              </Small>
              <input
                type="hidden"
                name="intent"
                value={IntentSchema.Enum["generate-code"]}
              />
              <DialogFooter>
                <Button type="submit" variant="secondary">
                  Generate new code
                </Button>
              </DialogFooter>
            </FlexList>
          </Form>
        </FlexList>
      </DialogContent>
    </Dialog>
  );
};
