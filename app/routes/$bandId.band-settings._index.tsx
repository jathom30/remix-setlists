import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { EllipsisVertical, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { H1, P, H3 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import {
  deleteBand,
  getBand,
  getBandMembers,
  updateBandCode,
} from "~/models/band.server";
import { getUsersById } from "~/models/user.server";
import { removeMemberFromBand } from "~/models/usersInBands.server";
import { requireUser, requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { redirectWithToast } from "~/utils/toast.server";

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

  return { band, members: augmentedMembers, qrCodeAddress };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.band.name} Settings` || "Band Settings" }];
};

export async function action({ request }: ActionFunctionArgs) {
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
    emitter.emit(emitterKeys.band_settings);
    emitter.emit(emitterKeys.dashboard);
    return redirectWithToast("/", {
      title: "Deleted!",
      description: "This band has been deleted successfully.",
      type: "success",
    });
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
    emitter.emit(emitterKeys.dashboard);
    return null;
  }

  return null;
}

export default function BandSettings() {
  const { band, members } = useLiveLoader<typeof loader>(() =>
    toast("Band updated"),
  );
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
            <AvatarFallback>
              {band.name.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <H3>{band.name}</H3>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <FlexList direction="row" items="center" justify="between">
            <CardTitle>Members</CardTitle>
            {isAdmin ? (
              <Button variant="outline" asChild>
                <Link to="add-member">Add Member</Link>
              </Button>
            ) : null}
            {/* {isAdmin ? <AddMemberDialog /> : null} */}
          </FlexList>
          <CardDescription>Manage the members of your band.</CardDescription>
        </CardHeader>
        <CardContent>
          <FlexList gap={2}>
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
                {isAdmin ? (
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
        <Button variant="destructive">
          <Trash className="w-4 h-4 mr-2" />
          Delete Band
        </Button>
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

  const isOnlyAdmin =
    members.filter((m) => m.role === RoleEnum.ADMIN && m.id === memberId)
      .length === 1;

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
          {isOnlyAdmin ? (
            <P>
              You are the only Admin member of this band. Either promote someone
              else to Admin or delete the band.
            </P>
          ) : null}
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
