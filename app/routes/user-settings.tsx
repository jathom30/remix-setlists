import { faPlusCircle, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
} from "@remix-run/server-runtime";
import { useForm } from "react-hook-form";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FlexList, MaxWidth } from "~/components";
import { H1, H4, P } from "~/components/typography";
import {
  getUserWithBands,
  updateUser,
  updateUserPassword,
} from "~/models/user.server";
import { requireUserId } from "~/session.server";

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
    if (data.password !== data.password_confirm) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match.",
        path: ["password_confirm"],
      });
    }
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
  const userName = formData.get("user_name");
  const email = formData.get("user_email");
  const password = formData.get("password");
  const passwordConfirm = formData.get("password_confirm");
  const intent = formData.get("intent");

  if (intent === "user-details") {
    const parsedData = UserDetailsSchema.parse({
      user_name: userName,
      user_email: email,
      intent,
    });

    await updateUser(userId, {
      name: parsedData.user_name,
      email: parsedData.user_email,
    });
    return json({ success: true });
  }

  if (intent === "user-password") {
    const parsedData = UserPasswordSchema.parse({
      password: password,
      password_confirm: passwordConfirm,
      intent,
    });

    await updateUserPassword(userId, parsedData.password);
    return json({ success: true });
  }
  return null;
}

export default function UserSettings() {
  const { user } = useLoaderData<typeof loader>();

  // User Details Form
  const userDetailsForm = useForm<z.infer<typeof UserDetailsSchema>>({
    resolver: zodResolver(UserDetailsSchema),
    defaultValues: {
      user_name: user.name || "",
      user_email: user.email,
      intent: "user-details",
    },
  });

  const userDetailsFetcher = useFetcher({ key: "user-details" });

  const onUserSettingsSubmit = (data: z.infer<typeof UserDetailsSchema>) => {
    userDetailsFetcher.submit(data, { method: "put" });
  };

  // User Password Form
  const userPasswordForm = useForm<z.infer<typeof UserPasswordSchema>>({
    resolver: zodResolver(UserPasswordSchema),
    defaultValues: {
      password: "",
      password_confirm: "",
      intent: "user-password",
    },
  });

  const userPasswordFetcher = useFetcher({ key: "user-password" });

  const onUserPasswordSubmit = (data: z.infer<typeof UserPasswordSchema>) => {
    userPasswordFetcher.submit(data, { method: "put" });
  };

  return (
    <div>
      <div className="sticky border-b top-0 z-10 bg-background inset-x-0 flex items-center justify-between p-2 gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/home">
            <FontAwesomeIcon icon={faUsers} className="mr-2" />
            My Bands
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="overflow-hidden rounded-full"
            >
              {user.name
                ?.split(" ")
                .map((n) => n[0].toUpperCase())
                .join(" ")}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/user-settings">User Settings</Link>
            </DropdownMenuItem>
            <form method="post" action="/logout">
              <DropdownMenuItem asChild className="w-full">
                <button type="submit">Logout</button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
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
          <Form {...userDetailsForm}>
            <form onSubmit={userDetailsForm.handleSubmit(onUserSettingsSubmit)}>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={userDetailsForm.control}
                  name="user_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="User name" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the public name that will be displayed in your
                        bands.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={userDetailsForm.control}
                  name="user_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormDescription>
                        Updating your email address will cause you to reverify
                        your account via an emailed link. You will not lose any
                        data.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <input
                  hidden
                  type="hidden"
                  name="intent"
                  defaultValue="user-details"
                />
                <Button variant="ghost" onClick={() => userDetailsForm.reset()}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <H4>Security</H4>
            <CardDescription>
              We will never ask you for your password. Change it at anytime.
            </CardDescription>
          </CardHeader>
          <Form {...userPasswordForm}>
            <form
              onSubmit={userPasswordForm.handleSubmit(onUserPasswordSubmit)}
            >
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={userPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        Passwords must be at least 8 characters long.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userPasswordForm.control}
                  name="password_confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Password"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormDescription>
                        Confirm your password by re-entering it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <input
                  hidden
                  type="hidden"
                  name="intent"
                  defaultValue="user-password"
                />
                <Button
                  variant="ghost"
                  onClick={() => userPasswordForm.reset()}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Password</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        {/* Band list */}
        <Card>
          <CardHeader>
            <FlexList direction="row" items="center" justify="between" gap={2}>
              <H4>Associated Bands</H4>
              <Button variant="outline">
                <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                Add Band
              </Button>
            </FlexList>
            <CardDescription>
              You can be associated with any number of bands.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.bands.map((band) => (
              <Card key={band.bandId}>
                <CardHeader className="p-2">
                  <FlexList direction="row" items="center" gap={2}>
                    <P>{band.bandName}</P>
                    <Badge variant="outline">{band.role}</Badge>
                    <div className="flex-grow" />
                    {band.role === "ADMIN" ? (
                      <Button variant="ghost">Edit</Button>
                    ) : null}
                    <Button variant="secondary">Remove</Button>
                  </FlexList>
                </CardHeader>
              </Card>
            ))}
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
          <CardContent className="text-end">
            <Button variant="destructive" className="w-full sm:w-auto">
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </MaxWidth>
    </div>
  );
}
