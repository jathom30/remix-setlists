import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Setlist } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
  json,
} from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  AreaChart,
  Copy,
  EllipsisVertical,
  LinkIcon,
  Pencil,
  Plus,
  Search,
  Shrink,
  Trash,
} from "lucide-react";
import { ReactNode, useState } from "react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlexList } from "~/components";
import { SetlistContainer } from "~/components/setlist-container";
import { SortItems } from "~/components/sort-items";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import {
  copySetlist,
  deleteSetlist,
  getSetlists,
  updateSetlistName,
} from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { getDomainUrl } from "~/utils/assorted";
import { RoleEnum } from "~/utils/enums";
import { getColor } from "~/utils/tailwindColors";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const bandId = params.bandId;
  invariant(bandId, "bandId not found");
  const domainUrl = getDomainUrl(request);

  const urlSearchParams = new URL(request.url).searchParams;
  const q = urlSearchParams.get("query");
  const intent = urlSearchParams.get("intent");
  let sort = urlSearchParams.get("sort");
  if (intent === "clear") {
    urlSearchParams.delete("query");
  }

  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};

  if (cookie && typeof cookie === "object" && "setlistSort" in cookie) {
    sort = String(cookie.setlistSort);
  }

  const filterParams = {
    ...(q ? { q } : null),
    ...(sort ? { sort } : null),
  };

  const setlists = await getSetlists(bandId, filterParams);
  return json({
    setlists,
    sort,
    domainUrl,
  });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Setlists" }];
};

const IntentSchema = z.enum([
  "update-setlist",
  "update-name",
  "delete-setlist",
  "clone-setlist",
  "remove-song",
]);

const SetlistNameSchema = z
  .object({
    setlist_name: z.string().min(1),
    setlist_id: z.string().min(1),
    intent: z.literal(IntentSchema.Enum["update-name"]),
  })
  .required();

const DeleteSetlistSchema = z
  .object({
    setlist_id: z.string().min(1),
    intent: z.literal(IntentSchema.Enum["delete-setlist"]),
  })
  .required();

const CloneSetlistSchema = z
  .object({
    setlist_id: z.string().min(1),
    intent: z.literal(IntentSchema.Enum["clone-setlist"]),
  })
  .required();

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["update-name"]) {
    const submission = parseWithZod(formData, { schema: SetlistNameSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await updateSetlistName(
      submission.value.setlist_id,
      submission.value.setlist_name,
    );
  }

  if (intent === IntentSchema.Enum["delete-setlist"]) {
    const submission = parseWithZod(formData, { schema: DeleteSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await deleteSetlist(submission.value.setlist_id);
  }

  if (intent === IntentSchema.Enum["clone-setlist"]) {
    const submission = parseWithZod(formData, { schema: CloneSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // clone setlist
    const newSetlist = await copySetlist(submission.value.setlist_id);
    if (!newSetlist) {
      throw new Response("Failed to clone setlist", { status: 500 });
    }
  }

  return null;
}

export default function Setlists() {
  const showToast = () => {
    toast("Setlists updated!", {
      duration: 2000,
      style: {
        backgroundColor: getColor("success"),
        color: getColor("success-content"),
      },
    });
  };
  const { setlists, sort } = useLiveLoader<typeof loader>(showToast);
  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;

  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      prev.set("query", value);
      return prev;
    });
  };

  const setSort = (value: string) => {
    setSearchParams((prev) => {
      prev.set("sort", value);
      return prev;
    });
  };

  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <H1>Setlists</H1>
        {!isSub ? (
          <Button asChild>
            <Link to="new">
              <Plus className=" w-4 h-4 mr-2" />
              Create Setlist
            </Link>
          </Button>
        ) : null}
      </FlexList>

      <FlexList direction="row" items="center" justify="end" gap={2}>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SortItems value={sort || "updatedAt:desc"} onChange={setSort} />
      </FlexList>

      {setlists.length ? (
        <FlexList gap={2}>
          {setlists.map((setlist) => (
            <SetlistContainer.Card key={setlist.id}>
              <FlexList direction="row" items="center" gap={2}>
                <Link className="w-full" to={setlist.id}>
                  <SetlistContainer.Setlist setlist={setlist} />
                </Link>
                <SetlistActions setlist={setlist} />
              </FlexList>
            </SetlistContainer.Card>
          ))}
        </FlexList>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Setlists Found</CardTitle>
            <CardDescription>
              {query
                ? "We couldn't find any setlists matching your search."
                : "This band has no setlists yet."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {query ? (
              <Button onClick={() => setQuery("")} variant="secondary">
                Clear search
              </Button>
            ) : !isSub ? (
              <Button asChild>
                <Link to="new">Create your first setlist here</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// const sortOptions = [
//   {
//     label: "Updated: Newest first",
//     value: "updated-desc",
//     icon: <ArrowDown01 className="w-4 h-4" />,
//   },
//   {
//     label: "Updated: Oldest first",
//     value: "updated-asc",
//     icon: <ArrowUp01 className="w-4 h-4" />,
//   },
//   {
//     label: "Name: A-Z",
//     value: "name-asc",
//     icon: <ArrowDownAZ className="w-4 h-4" />,
//   },
//   {
//     label: "Name: Z-A",
//     value: "name-desc",
//     icon: <ArrowUpAZ className="w-4 h-4" />,
//   },
// ];

// const SortSetlists = ({
//   value,
//   onChange,
// }: {
//   value: string;
//   onChange: (val: string) => void;
// }) => {
//   return (
//     <div>
//       <div className="hidden sm:block">
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button size="icon" variant="outline">
//               <ArrowDownUp className="h-4 w-4" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent>
//             <DropdownMenuLabel>Setlist Sort</DropdownMenuLabel>
//             <DropdownMenuSeparator />
//             <DropdownMenuGroup>
//               <DropdownMenuRadioGroup
//                 defaultValue={value}
//                 onValueChange={onChange}
//               >
//                 {sortOptions.map(({ label, value: val, icon }) => (
//                   <DropdownMenuRadioItem
//                     key={val}
//                     value={val}
//                     className="flex flex-row gap-2"
//                   >
//                     {icon}
//                     {label}
//                   </DropdownMenuRadioItem>
//                 ))}
//               </DropdownMenuRadioGroup>
//             </DropdownMenuGroup>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//       <div className="sm:hidden">
//         <Sheet>
//           <SheetTrigger asChild>
//             <Button size="icon" variant="outline">
//               <ArrowDownUp className="w-4 h-4" />
//             </Button>
//           </SheetTrigger>
//           <SheetContent side="bottom">
//             <SheetHeader>
//               <SheetTitle>Setlist Sort</SheetTitle>
//               <SheetDescription>
//                 <RadioGroup defaultValue={value} onValueChange={onChange}>
//                   <FlexList gap={0}>
//                     {sortOptions.map(({ label, value: val, icon }) => (
//                       <div
//                         key={val}
//                         className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
//                       >
//                         <FlexList direction="row" items="center" gap={2}>
//                           <RadioGroupItem value={val} id={val} />
//                           <Label
//                             className="w-full text-start flex flex-row gap-2"
//                             htmlFor={val}
//                           >
//                             {icon}
//                             {label}
//                           </Label>
//                         </FlexList>
//                       </div>
//                     ))}
//                   </FlexList>
//                 </RadioGroup>
//               </SheetDescription>
//             </SheetHeader>
//           </SheetContent>
//         </Sheet>
//       </div>
//     </div>
//   );
// };

const SetlistActions = ({ setlist }: { setlist: SerializeFrom<Setlist> }) => {
  const { domainUrl } = useLoaderData<typeof loader>();
  const [showEditName, setShowEditName] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Setlist Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {!isSub ? (
              <DropdownMenuItem onClick={() => setShowEditName(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Name
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <Link to={`/${setlist.bandId}/setlists/${setlist.id}/metrics`}>
                <AreaChart className="h-4 w-4 mr-2" />
                Metrics
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                onCopy(`${domainUrl}/${setlist.bandId}/setlists/${setlist.id}`)
              }
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to={`/${setlist.bandId}/setlists/${setlist.id}/condensed`}>
                <Shrink className="h-4 w-4 mr-2" />
                Condensed View
              </Link>
            </DropdownMenuItem>
            {!isSub ? (
              <>
                <DropdownMenuItem onClick={() => setShowClone(true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Setlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowDelete(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Setlist
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showEditName} onOpenChange={setShowEditName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>Edit the name of the setlist</DialogDescription>
          </DialogHeader>
          <EditNameForm name={setlist.name} id={setlist.id}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowEditName(false)}>
                Save
              </Button>
            </DialogFooter>
          </EditNameForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Setlist?</DialogTitle>
            <DialogDescription>
              This is a perminent action and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DeleteSetlistForm id={setlist.id}>
            <DialogFooter>
              <Button variant="destructive" type="submit">
                Delete
              </Button>
            </DialogFooter>
          </DeleteSetlistForm>
        </DialogContent>
      </Dialog>

      <Dialog open={showClone} onOpenChange={setShowClone}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clone Setlist</DialogTitle>
            <DialogDescription>
              Clone this setlist to create a new identical one.
            </DialogDescription>
          </DialogHeader>
          <CloneSetlistForm id={setlist.id}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowClone(false)}>
                Clone
              </Button>
            </DialogFooter>
          </CloneSetlistForm>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EditNameForm = ({
  name,
  id,
  children,
}: {
  name: string;
  id: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["update-name"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SetlistNameSchema });
    },
    defaultValue: {
      setlist_name: name,
      setlist_id: id,
      intent: IntentSchema.Enum["update-name"],
    },
  });

  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <div>
        <Label htmlFor={fields.setlist_name.name}>Setlist Name</Label>
        <Input
          {...getInputProps(fields.setlist_name, { type: "text" })}
          placeholder="Setlist name"
        />
        <div
          className="text-sm text-destructive"
          id={fields.setlist_name.errorId}
        >
          {fields.setlist_name.errors}
        </div>
      </div>
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      <input hidden {...getInputProps(fields.setlist_id, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const DeleteSetlistForm = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteSetlistSchema });
    },
    defaultValue: {
      setlist_id: id,
      intent: IntentSchema.Enum["delete-setlist"],
    },
  });

  return (
    <Form
      method="delete"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      <input hidden {...getInputProps(fields.setlist_id, { type: "hidden" })} />
      {children}
    </Form>
  );
};

const CloneSetlistForm = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["clone-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CloneSetlistSchema });
    },
    defaultValue: {
      setlist_id: id,
      intent: IntentSchema.Enum["clone-setlist"],
    },
  });

  return (
    <Form
      method="post"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      <input hidden {...getInputProps(fields.setlist_id, { type: "hidden" })} />
      {children}
    </Form>
  );
};
