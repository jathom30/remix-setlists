import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { faPlusCircle, faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useLoaderData,
  json,
  redirect,
  Form,
  useActionData,
  useNavigation,
} from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FlexList, MaxWidth } from "~/components";
import { H1, H4, P, Muted } from "~/components/typography";
import { UserAvatarMenu } from "~/components/user-avatar-menu";
import {
  createBand,
  deleteBand,
  getBand,
  updateBandByCode,
} from "~/models/band.server";
import {
  deleteUserById,
  getUserWithBands,
  updateUser,
  updateUserPassword,
} from "~/models/user.server";
import {
  getUserBands,
  removeMemberFromBand,
} from "~/models/usersInBands.server";
import { requireUserId } from "~/session.server";
import { RoleEnum } from "~/utils/enums";

const IntentEnums = z.enum([
  "user-details",
  "user-password",
  "leave-band",
  "new-band",
  "add-band",
  "delete-account",
]);

const UserDetailsSchema = z
  .object({
    user_name: z.string().min(1).optional(),
    user_email: z.string().email(),
    intent: z.literal("user-details"),
  })
  .required();

const UserPasswordSchema = z
  .object({
    password: z.string().min(8),
    password_confirm: z.string(),
    intent: z.literal("user-password"),
  })
  .superRefine((data, ctx) => {
    const containsNumber = /\d/.test(data.password);
    const containsUppercase = /[A-Z]/.test(data.password);
    const containsLowercase = /[a-z]/.test(data.password);
    const containsSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(
      data.password,
    );
    if (!containsNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain a number.",
        path: ["password"],
      });
    }
    if (!containsUppercase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain an uppercase letter. ",
        path: ["password"],
      });
    }
    if (!containsLowercase) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain a lowercase letter. ",
        path: ["password"],
      });
    }
    if (!containsSpecialChar) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must contain a special character. ",
        path: ["password"],
      });
    }
    if (data.password !== data.password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["password_confirm"],
      });
    }
  });

const RemoveMemberFromBandSchema = z
  .object({
    band_id: z.string(),
    intent: z.literal("leave-band"),
  })
  .required();

const NewBandSchema = z
  .object({
    band_name: z.string().min(1),
  })
  .required();

const AddBandSchema = z.object({
  band_code: z.coerce
    .string()
    .length(5, "Band code must be exactly 5 characters."),
});

const DeleteAccountSchema = z.object({
  user_id: z.string(),
  intent: z.literal("delete-account"),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserWithBands(request);
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }
  return json({ user });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentEnums.Enum["user-details"]) {
    const submission = parseWithZod(formData, { schema: UserDetailsSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const user = await updateUser(userId, {
      name: submission.value.user_name,
      email: submission.value.user_email,
    });
    if ("error" in user) {
      return submission.reply({
        formErrors: ["An error occurred while updating the user."],
      });
    }
    return submission;
  }

  if (intent === IntentEnums.Enum["user-password"]) {
    const submission = parseWithZod(formData, { schema: UserPasswordSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const user = await updateUserPassword(userId, submission.value.password);
    if ("error" in user) {
      return submission.reply({
        formErrors: ["An error occurred while updating the password."],
      });
    }
    return submission;
  }

  if (intent === IntentEnums.Enum["leave-band"]) {
    const submission = parseWithZod(formData, {
      schema: RemoveMemberFromBandSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await removeMemberFromBand(submission.value.band_id, userId);
    if ("error" in band) {
      return submission.reply({
        formErrors: ["An error occurred while leaving the band."],
      });
    }
    return submission;
  }

  if (intent === IntentEnums.Enum["new-band"]) {
    const submission = parseWithZod(formData, { schema: NewBandSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await createBand({ name: submission.value.band_name }, userId);
    if ("error" in band) {
      return submission.reply({
        formErrors: ["An error occurred while creating the band."],
      });
    }
    return redirect(`/${band.id}/setlists`);
  }

  if (intent === IntentEnums.Enum["add-band"]) {
    const submission = parseWithZod(formData, { schema: AddBandSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const band = await updateBandByCode(submission.value.band_code, userId);
    if ("error" in band) {
      return submission.reply({
        fieldErrors: { band_code: [band.error] },
      });
    }
    return redirect(`/${band.id}/setlists`);
  }

  if (intent === IntentEnums.Enum["delete-account"]) {
    const submission = parseWithZod(formData, { schema: DeleteAccountSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    const userBands = await getUserBands(submission.value.user_id);
    await Promise.all(
      userBands.map(async (userBand) => {
        const band = await getBand(userBand.bandId);
        if (!band) return null;
        // if user is only member in the band, delete band
        const userIsOnlyMember = band?.members.every(
          (member) => member.userId === userId,
        );
        // if other members, but no other Admins, delete band
        const userIsOnlyAdmin = band.members
          .filter((member) => member.userId !== userId)
          .every((member) => member.role !== RoleEnum.ADMIN);
        if (userIsOnlyMember || userIsOnlyAdmin) {
          return await deleteBand(band.id);
        }
      }),
    );

    await deleteUserById(submission.value.user_id);
    return redirect("/login");
  }

  return null;
}

export default function UserSettings() {
  const { user } = useLoaderData<typeof loader>();
  return (
    <div className="bg-muted/40">
      <div className="sticky border-b top-0 z-10 bg-background inset-x-0 flex items-center justify-between p-2 gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/home">
            <FontAwesomeIcon icon={faHome} className="pr-2" />
            My Bands
          </Link>
        </Button>
        <UserAvatarMenu />
      </div>
      <MaxWidth className="p-2 space-y-2">
        <H1>User Settings</H1>

        <Card>
          <CardHeader>
            <H4>Site Theme</H4>
            <CardDescription>
              Set the site's theme between light or dark mode. If you'd prefer,
              check "Prefer system settings" to use your OS's settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <FlexList direction="row" items="center" gap={2}>
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Dark Mode</Label>
            </FlexList>
            <FlexList direction="row" items="center" gap={2}>
              <Checkbox id="prefer-system" />
              <Label htmlFor="prefer-system">Prefer system settings</Label>
            </FlexList>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card>
          <CardHeader>
            <H4>User Details</H4>
            <CardDescription>
              Feel free to update your details as needed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <UserDetailsDialog
              user={{ name: user.name || "", email: user.email }}
            />
          </CardFooter>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <H4>Security</H4>
            <CardDescription>
              We will never ask you for your password. Change it at anytime.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <UpdatePasswordDialog />
          </CardFooter>
        </Card>

        {/* Band list */}
        <Card>
          <CardHeader>
            <FlexList direction="row" items="center" justify="between" gap={2}>
              <H4>Associated Bands</H4>
              <AddBandDialog />
            </FlexList>
            <CardDescription>
              You can be associated with any number of bands.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {user.bands.map((band) => (
              <Card key={band.bandId}>
                <CardHeader className="p-2">
                  <FlexList direction="row" items="center" gap={2}>
                    <P>{band.bandName}</P>
                    <Badge variant="outline">{band.role}</Badge>
                    <div className="flex-grow" />
                    {band.role === "ADMIN" ? (
                      <Button variant="ghost" asChild>
                        <Link to={`/${band.bandId}/band`}>Edit</Link>
                      </Button>
                    ) : null}
                    <RemoveSelfFromBandDialog band={band} />
                  </FlexList>
                </CardHeader>
              </Card>
            ))}
            {user.bands.length === 0 ? (
              <P>
                You are not associated with any bands. Click "Add Band" to join
                one.
              </P>
            ) : null}
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <H4>Support</H4>
            <CardDescription>
              Need help? We're here for you. Feel free to reach out to us.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <P>
              For tech support or general questions, reach out to us at{" "}
              <a
                className="underline text-primary"
                href="mailto:support@setlists.pro"
              >
                support@setlists.pro
              </a>
            </P>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card>
          <CardHeader>
            <H4>Danger Zone</H4>
            <CardDescription>
              Deleting your account is permanent and cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <DeleteAccountDialog userId={user.id} />
          </CardFooter>
        </Card>
      </MaxWidth>
    </div>
  );
}

const UserDetailsDialog = ({
  user,
}: {
  user: { name: string; email: string };
}) => {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const lastResult =
    actionData && !("success" in actionData) && navigation.state === "idle"
      ? actionData
      : null;

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserDetailsSchema });
    },
    defaultValue: {
      user_name: user.name,
      user_email: user.email,
      intent: IntentEnums.Enum["user-details"],
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (lastResult?.status === "success") {
      setOpen(false);
    }
  }, [lastResult?.status]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Details</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update your details?</DialogTitle>
          <DialogDescription>
            Feel free to update your details as needed.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <div>
            <Label htmlFor={fields.user_name.id}>Name</Label>
            <Input
              {...getInputProps(fields.user_name, { type: "text" })}
              placeholder="User name"
            />
            <Muted>
              This is the public name that will be displayed in your bands.
            </Muted>
            <div
              id={fields.user_name.errorId}
              className="text-sm text-destructive"
            >
              {fields.user_name.errors}
            </div>
          </div>
          <div>
            <Label htmlFor={fields.user_email.id}>Email</Label>
            <Input
              {...getInputProps(fields.user_email, { type: "email" })}
              placeholder="Email"
            />
            <Muted>
              Updating your email address will cause you to reverify your
              account via an emailed link. You will not lose any data.
            </Muted>
            <div
              id={fields.user_email.errorId}
              className="text-sm text-destructive"
            >
              {fields.user_email.errors}
            </div>
          </div>
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          <DialogFooter className="pt-4">
            <Button type="submit">Update Details</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const AddBandDialog = () => {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const lastResult =
    actionData && !("success" in actionData) && navigation.state === "idle"
      ? actionData
      : null;
  const [isNew, setIsNew] = useState(false);

  const [newBandForm, newBandFields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: NewBandSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [addBandForm, addBandFields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AddBandSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
          Add Band
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Band</DialogTitle>
          <DialogDescription>
            You can either create a new band or join an existing one.
          </DialogDescription>
        </DialogHeader>

        <FlexList direction="row" items="center" gap={2} pad={{ b: 2 }}>
          <Label htmlFor="band-toggle">Add Self to Band</Label>
          <Switch id="band-toggle" checked={isNew} onCheckedChange={setIsNew} />
          <Label htmlFor="band-toggle">Create New Band</Label>
        </FlexList>
        {isNew ? (
          <Form
            method="post"
            id={newBandForm.id}
            onSubmit={newBandForm.onSubmit}
            noValidate
          >
            <div>
              <Label htmlFor={newBandFields.band_name.id}>Band Name</Label>
              <Input
                {...getInputProps(newBandFields.band_name, { type: "text" })}
                placeholder="New band name"
              />
              <Muted>Create a band with a custom name.</Muted>
              <div
                id={newBandFields.band_name.errorId}
                className="text-sm text-destructive"
              >
                {newBandFields.band_name.errors}
              </div>
            </div>
            <input
              hidden
              type="hidden"
              name="intent"
              value={IntentEnums.Enum["new-band"]}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={navigation.state !== "idle"}>
                {navigation.state === "idle"
                  ? "Create New Band"
                  : "Creating Band..."}
              </Button>
            </DialogFooter>
          </Form>
        ) : (
          <Form
            method="post"
            id={addBandForm.id}
            onSubmit={addBandForm.onSubmit}
            noValidate
          >
            <div>
              <Label htmlFor={addBandFields.band_code.id}>Band Code</Label>
              <Input
                {...getInputProps(addBandFields.band_code, { type: "text" })}
                placeholder="New band name"
              />
              <Muted>
                Add a band code here and be instantly granted access to that
                band.
              </Muted>
              <div
                id={addBandFields.band_code.errorId}
                className="text-sm text-destructive"
              >
                {addBandFields.band_code.errors}
              </div>
            </div>
            <input
              hidden
              type="hidden"
              name="intent"
              value={IntentEnums.Enum["add-band"]}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" disabled={navigation.state !== "idle"}>
                {navigation.state === "idle" ? "Add Band" : "Adding..."}
              </Button>
            </DialogFooter>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const UpdatePasswordDialog = () => {
  const actionData = useActionData<typeof action>();
  const [open, setOpen] = useState(false);
  const navigation = useNavigation();
  const lastResult =
    actionData && !("success" in actionData) && navigation.state === "idle"
      ? actionData
      : null;

  useEffect(() => {
    if (lastResult?.status === "success") {
      setOpen(false);
    }
  }, [lastResult?.status]);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: UserPasswordSchema });
    },
    defaultValue: {
      password: "",
      password_confirm: "",
      intent: IntentEnums.Enum["user-password"],
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Password</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update your password?</DialogTitle>
          <DialogDescription>
            Please do not share your password with anyone.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <div>
            <Label htmlFor={fields.password.id}>Password</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              placeholder="Password"
            />
            <Muted>A complicated password is a good password.</Muted>
            <div
              id={fields.password.errorId}
              className="text-sm text-destructive"
            >
              {fields.password.errors}
            </div>
          </div>
          <div>
            <Label htmlFor={fields.password_confirm.id}>Confirm Password</Label>
            <Input
              {...getInputProps(fields.password_confirm, { type: "password" })}
              placeholder="Confirm password"
            />
            <div
              id={fields.password_confirm.errorId}
              className="text-sm text-destructive"
            >
              {fields.password_confirm.errors}
            </div>
          </div>

          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          <DialogFooter className="pt-4">
            <Button type="submit">Update Password</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const RemoveSelfFromBandDialog = ({
  band,
}: {
  band: { userId: string; bandName: string; bandId: string; role: string };
}) => {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const lastResult =
    actionData && !("success" in actionData) && navigation.state === "idle"
      ? actionData
      : null;

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      band_id: band.bandId,
      intent: IntentEnums.Enum["leave-band"],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RemoveMemberFromBandSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Remove</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave {band.bandName}?</DialogTitle>
          <DialogDescription>
            You can leave this band at any time, but you will no longer have
            access to any of its songs and setlists.
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <input
            hidden
            {...getInputProps(fields.band_id, { type: "hidden" })}
          />
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          <DialogFooter>
            <Button type="submit" variant="destructive">
              Leave Band
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const DeleteAccountDialog = ({ userId }: { userId: string }) => {
  const [form, fields] = useForm({
    defaultValue: {
      user_id: userId,
      intent: IntentEnums.Enum["delete-account"],
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteAccountSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. Are you sure you want
            to delete your account?
          </DialogDescription>
        </DialogHeader>
        <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
          <input
            hidden
            {...getInputProps(fields.user_id, { type: "hidden" })}
          />
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          {fields.intent.errors}
          {fields.user_id.errors}
          <DialogFooter>
            <Button variant="destructive">Delete Account</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
