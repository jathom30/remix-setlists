import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  faCheck,
  faCopy,
  faEllipsisVertical,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Feel } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { QRCode } from "react-qrcode-logo";
import invariant from "tiny-invariant";
import { z } from "zod";

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
import { Label } from "@/components/ui/label";
import { Avatar, FlexList } from "~/components";
import { H1, P, Small } from "~/components/typography";
import {
  deleteBand,
  getBand,
  getBandMembers,
  updateBandCode,
} from "~/models/band.server";
import { deleteFeel, getMostRecentFeels } from "~/models/feel.server";
import { getUsersById } from "~/models/user.server";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import {
  requireAdminMember,
  requireUser,
  requireUserId,
} from "~/session.server";
import { getDomainUrl } from "~/utils/assorted";
import { RoleEnum } from "~/utils/enums";

const IntentSchema = z.enum([
  "delete-band",
  "delete-feel",
  "remove-member",
  "generate-code",
]);

const DeleteBandSchema = z.object({
  band_id: z.string(),
  intent: z.literal(IntentSchema.Enum["delete-band"]),
});

const DeleteFeelSchema = z.object({
  band_id: z.string(),
  feel_id: z.string(),
  intent: z.literal(IntentSchema.Enum["delete-feel"]),
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
  const feels = await getMostRecentFeels(bandId);

  const domainUrl = getDomainUrl(request);
  const qrCodeAddress = `${domainUrl}/add-band?code=${band.code}`;

  return json({ band, members: augmentedMembers, feels, qrCodeAddress });
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

  if (intent === IntentSchema.Enum["delete-feel"]) {
    const submission = parseWithZod(formData, { schema: DeleteFeelSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await getBand(submission.value.band_id);
    if (!band) {
      throw new Response("Band not found", { status: 404 });
    }
    const memberRole = band.members.find((m) => m.userId === user.id)?.role;
    if (memberRole !== RoleEnum.ADMIN) {
      throw new Response("You do not have permission to delete this feel", {
        status: 403,
      });
    }
    await deleteFeel(submission.value.feel_id);
    return null;
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
  const { band, members, feels } = useLoaderData<typeof loader>();

  return (
    <div className="p-2 space-y-2">
      <H1>Band Settings</H1>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>General Settings</CardTitle>
            <Button variant="outline" asChild>
              <Link to="edit">Edit</Link>
            </Button>
          </FlexList>
          <CardDescription>
            Created on {new Date(band.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <Label>Name</Label>
            <P>{band.name}</P>
          </div>
          <div>
            <Label>Avatar</Label>
            <Avatar bandName={band.name} icon={band.icon} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Members</CardTitle>
            <AddMemberDialog />
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
                <MemberSettings bandId={band.id} memberId={member.id} />
              </FlexList>
            ))}
          </FlexList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Feels</CardTitle>
            <Button variant="outline">Add Feel</Button>
          </FlexList>
          <CardDescription>
            These are the feels that your band has created. Update and add to
            them here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList gap={1}>
            {feels.map((feel) => (
              <FlexList
                direction="row"
                items="center"
                justify="between"
                key={feel.id}
              >
                <P>{feel.label}</P>
                <FeelSettings feel={feel} />
              </FlexList>
            ))}
          </FlexList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Deleting this band is a perminant action and cannot be undone. It
            will remove all songs, setlists, and other data associated with this
            band.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <DeleteBandDialog bandId={band.id} />
        </CardFooter>
      </Card>
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

const FeelSettings = ({ feel }: { feel: SerializeFrom<Feel> }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button title="Update member settings" variant="ghost" size="icon">
          <FontAwesomeIcon className="h-4 w-4" icon={faEllipsisVertical} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Feel Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`feels/${feel.id}`}>
            <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
      <DeleteFeelDialog
        bandId={feel.bandId}
        feelId={feel.id}
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
      />
    </DropdownMenu>
  );
};

const DeleteFeelDialog = ({
  bandId,
  feelId,
  open,
  onOpenChange,
}: {
  bandId: string;
  feelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-feel"],
    defaultValue: {
      feel_id: feelId,
      band_id: bandId,
      intent: IntentSchema.Enum["delete-feel"],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteFeelSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            {...getInputProps(fields.feel_id, { type: "hidden" })}
          />
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
          <FontAwesomeIcon className="h-4 w-4" icon={faEllipsisVertical} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Feel Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to={`members/${memberId}`}>
            <FontAwesomeIcon icon={faPenToSquare} className="mr-2" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
          <FontAwesomeIcon icon={faTrash} className="mr-2" />
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
          <DialogTitle>Remove this Member?</DialogTitle>
          <DialogDescription>
            This action will remove this member from the band. They can be
            re-added at any time in the future.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <input
            hidden
            {...getInputProps(fields.member_id, { type: "hidden" })}
          />
          <input
            hidden
            {...getInputProps(fields.band_id, { type: "hidden" })}
          />
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          {fields.intent.errors}
          <DialogFooter>
            <Button variant="destructive">Remove Member</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const AddMemberDialog = () => {
  const { qrCodeAddress } = useLoaderData<typeof loader>();
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
            <FontAwesomeIcon
              icon={showSuccess ? faCheck : faCopy}
              className="ml-2"
            />
          </Button>
          <FlexList items="center">
            <QRCode value={qrCodeAddress} />
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
