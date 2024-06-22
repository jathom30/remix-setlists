import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { Song } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  SerializeFrom,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import {
  AudioLines,
  Check,
  Copy,
  EllipsisVertical,
  ExternalLink,
  Link,
  Pencil,
  Trash,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { QRCode } from "react-qrcode-logo";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { H1 } from "~/components/typography";
import {
  copySetlist,
  deleteSetlist,
  getSetlist,
  updateMultiSetSetlist,
  updateSetlist,
  updateSetlistName,
} from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { getDomainUrl } from "~/utils/assorted";
import { DroppableIdEnums, TSet, compareSets, onDragEnd } from "~/utils/dnd";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  const domainUrl = getDomainUrl(request);
  const setlistLink = `${domainUrl}/${setlist.bandId}/setlists/${setlist.id}`;

  const publicSearchParams = new URLSearchParams();
  publicSearchParams.set("bandId", bandId);
  publicSearchParams.set("setlistId", setlistId);
  const setlistPublicUrl = `${domainUrl}/publicSetlist?${publicSearchParams.toString()}`;
  return json({
    setlist,
    setlistLink,
    ...(setlist.isPublic ? { setlistPublicUrl } : {}),
  });
}

const IntentSchema = z.enum([
  "update-setlist",
  "update-name",
  "delete-setlist",
  "clone-setlist",
  "create-public-link",
  "remove-public-link",
]);

const FormSchema = z.object({
  sets: z.record(z.string()),
  intent: z.literal(IntentSchema.Enum["update-setlist"]),
});

const SetlistNameSchema = z.object({
  setlist_name: z.string().min(1),
  intent: z.literal(IntentSchema.Enum["update-name"]),
});

const DeleteSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["delete-setlist"]),
});
const CloneSetlistSchema = z.object({
  intent: z.literal(IntentSchema.Enum["clone-setlist"]),
});

const CreatePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["create-public-link"]),
});
const RemovePublicLinkSchema = z.object({
  intent: z.literal(IntentSchema.Enum["remove-public-link"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  await requireNonSubMember(request, bandId);

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["update-setlist"]) {
    const submission = parseWithZod(formData, { schema: FormSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // string array is serialized as comma separated string onSubmit
    const sets = Object.entries(submission.value.sets).map(([, songIds]) =>
      songIds.split(","),
    );
    const updatedSetlist = await updateMultiSetSetlist(setlistId, sets);
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["update-name"]) {
    const submission = parseWithZod(formData, { schema: SetlistNameSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }

    const updatedSetlist = await updateSetlistName(
      setlistId,
      submission.value.setlist_name,
    );
    return json({ updatedSetlist });
  }

  if (intent === IntentSchema.Enum["delete-setlist"]) {
    const submission = parseWithZod(formData, { schema: DeleteSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // delete setlist
    await deleteSetlist(setlistId);
    return redirect(`/${bandId}/setlists`);
  }

  if (intent === IntentSchema.Enum["clone-setlist"]) {
    const submission = parseWithZod(formData, { schema: CloneSetlistSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // clone setlist
    const newSetlist = await copySetlist(setlistId);
    if (!newSetlist) {
      throw new Response("Failed to clone setlist", { status: 500 });
    }
    return redirect(`/${bandId}/setlists/${newSetlist.id}`);
  }

  if (intent === IntentSchema.Enum["create-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: CreatePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: true });
    return json(submission.payload);
  }

  if (intent === IntentSchema.Enum["remove-public-link"]) {
    const submission = parseWithZod(formData, {
      schema: RemovePublicLinkSchema,
    });
    if (submission.status !== "success") {
      return submission.reply();
    }
    // create public link
    await updateSetlist(setlistId, { isPublic: false });
    return json(submission.payload);
  }

  return null;
}

const FetcherDataSchema = z.object({
  updatedSetlist: z.object({
    id: z.string(),
    name: z.string(),
    sets: z.array(
      z.object({
        id: z.string(),
        songs: z.array(
          z.object({
            positionInSet: z.number(),
            song: z.object({
              id: z.string(),
              name: z.string(),
              length: z.number(),
              isCover: z.boolean(),
              author: z.string(),
              note: z.string().nullable(),
              keyLetter: z.string(),
              isMinor: z.boolean(),
              tempo: z.number(),
              position: z.string(),
              rank: z.string(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
              bandId: z.string(),
            }),
          }),
        ),
      }),
    ),
  }),
});

export default function SetlistPage() {
  const { setlist } = useLoaderData<typeof loader>();
  const fetcher = useFetcher({ key: `setlist-${setlist.id}` });

  const defaultSets = setlist.sets.reduce((acc: TSet, set) => {
    const setSongs = set.songs
      .filter((song) => Boolean(song) && Boolean(song.song))
      .map((song) => song.song) as SerializeFrom<Song>[];
    acc[set.id] = setSongs;
    return acc;
  }, {} as TSet);
  const [sets, setSets] = useState<TSet>(defaultSets);

  // update sets when fetcher is done
  useEffect(() => {
    if (!fetcher.data || fetcher.state !== "loading") return;

    const parsedData = FetcherDataSchema.safeParse(fetcher.data);
    if (!parsedData.success) return;
    const returnedSets = parsedData.data.updatedSetlist.sets.reduce(
      (acc: TSet, set) => {
        const setSongs = set.songs
          .filter((song) => Boolean(song) && Boolean(song.song))
          .map((song) => song.song) as unknown as SerializeFrom<Song>[];
        acc[set.id] = setSongs;
        return acc;
      },
      {} as TSet,
    );

    setSets(returnedSets);
  }, [fetcher.data, fetcher.state]);

  const [isChangedSetlist, setIsChangedSetlist] = useState(false);

  const handleDragEnd = (drop: DropResult) => {
    setSets((prev) => {
      const updatedSets = onDragEnd(drop, sets)(prev);
      setIsChangedSetlist(compareSets(defaultSets, updatedSets));
      return updatedSets;
    });
  };

  const onSubmit = () => {
    const reducedSets = Object.entries(sets).reduce(
      (acc: Record<string, string[]>, [setId, set]) => {
        if (setId === DroppableIdEnums.Enum["available-songs"]) return acc;
        const mappedSet = set.map((song) => song.id);
        acc[setId] = mappedSet;
        return acc;
      },
      {} as Record<string, string[]>,
    );

    const formData = {
      sets: reducedSets,
      intent: "update-setlist",
    };
    fetcher.submit(formData, { method: "post" });
    setIsChangedSetlist(false);
  };

  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" gap={2} justify="between">
        <H1>{setlist.name}</H1>
        <SetlistActions />
      </FlexList>
      <DragDropContext key={setlist.id} onDragEnd={handleDragEnd}>
        {Object.entries(sets)
          .filter(
            ([setId]) => setId !== DroppableIdEnums.Enum["available-songs"],
          )
          .map(([setId, set], index) => (
            <div key={setId} className="pb-4">
              <Droppable droppableId={setId}>
                {(dropProvided, dropSnapshot) => (
                  <div
                    ref={dropProvided.innerRef}
                    {...dropProvided.droppableProps}
                    className={
                      dropSnapshot.isDraggingOver
                        ? "outline outline-primary outline-offset-2 rounded bg-card"
                        : ""
                    }
                  >
                    <Label
                      className={dropSnapshot.isDraggingOver ? "font-bold" : ""}
                    >
                      Set {index + 1}
                    </Label>
                    {set.map((song, songIndex) => (
                      <Draggable
                        draggableId={song.id}
                        key={song.id}
                        index={songIndex}
                      >
                        {(dragprovided) => (
                          <div
                            className="py-1"
                            ref={dragprovided.innerRef}
                            {...dragprovided.dragHandleProps}
                            {...dragprovided.draggableProps}
                          >
                            <SongContainer song={song} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dropProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        <Droppable droppableId={DroppableIdEnums.Enum["new-set"]}>
          {(dropProvided, dropSnapshot) => (
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
              <Card
                className={`outline-dashed outline-border  border-none ${
                  dropSnapshot.isDraggingOver ? "outline-primary" : ""
                }`}
              >
                <CardHeader>
                  <CardDescription className="text-center">
                    Drop songs here to create a new set
                  </CardDescription>
                </CardHeader>
              </Card>
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {isChangedSetlist ? (
        <div className="sticky bottom-2 inset-x-0 bg-card">
          <Card className="p-2">
            <FlexList>
              <Button onClick={onSubmit}>Save Changes?</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSets(defaultSets);
                  setIsChangedSetlist(false);
                }}
              >
                Revert
              </Button>
            </FlexList>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

const SetlistActions = () => {
  const { setlist, setlistLink } = useLoaderData<typeof loader>();
  const [showEditName, setShowEditName] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showClone, setShowClone] = useState(false);
  const [showPublicLink, setShowPublicLink] = useState(false);

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy);

  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Setlist Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <AudioLines className="h-4 w-4 mr-2" />
                Add Songs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowEditName(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy(setlistLink)}>
                <Link className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowPublicLink(true)}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {setlist.isPublic ? "View Public Link" : "Create Public Link"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowClone(true)}>
                <Copy className="h-4 w-4 mr-2" />
                Clone Setlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDelete(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Setlist
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="secondary" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Setlist Actions</SheetTitle>
            </SheetHeader>
            <FlexList gap={0}>
              <SheetClose asChild>
                <Button variant="ghost">
                  <AudioLines className="h-4 w-4 mr-2" />
                  Add Songs
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button onClick={() => setShowEditName(true)} variant="ghost">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Name
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => onCopy(setlistLink)}>
                  <Link className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowPublicLink(true)}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {setlist.isPublic ? "View Public Link" : "Create Public Link"}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowClone(true)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Setlist
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="ghost" onClick={() => setShowDelete(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Setlist
                </Button>
              </SheetClose>
            </FlexList>
          </SheetContent>
        </Sheet>
      </div>
      <Dialog open={showEditName} onOpenChange={setShowEditName}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Name</DialogTitle>
            <DialogDescription>Edit the name of the setlist</DialogDescription>
          </DialogHeader>
          <EditNameForm name={setlist.name}>
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
          <DeleteSetlistForm>
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
          <CloneSetlistForm>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowClone(false)}>
                Clone
              </Button>
            </DialogFooter>
          </CloneSetlistForm>
        </DialogContent>
      </Dialog>

      <PublicLink open={showPublicLink} onOpenChange={setShowPublicLink} />
    </div>
  );
};

const EditNameForm = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["update-name"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SetlistNameSchema });
    },
    defaultValue: {
      setlist_name: name,
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
      {children}
    </Form>
  );
};

const DeleteSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteSetlistSchema });
    },
    defaultValue: {
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
      {children}
    </Form>
  );
};

const CloneSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["clone-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CloneSetlistSchema });
    },
    defaultValue: {
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
      {children}
    </Form>
  );
};

const PublicLink = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const loaderData = useLoaderData<typeof loader>();
  const publicLink = loaderData.setlistPublicUrl;
  const [showSuccess, setShowSuccess] = useState(false);

  const title = publicLink ? "Public Link" : "Create Public Link";
  const description = publicLink
    ? "Copy the link below to share"
    : "Creating a public link will allow anyone with the link to view a read-only version of the setlist.";

  const onCopy = (textToCopy: string) =>
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {publicLink ? (
          <FlexList gap={2}>
            <Button
              variant="outline"
              onClick={() => onCopy(publicLink)}
              onMouseLeave={() => setShowSuccess(false)}
            >
              {showSuccess ? (
                "Copied!"
              ) : (
                <span className="truncate max-w-xs">{publicLink}</span>
              )}
              {showSuccess ? (
                <Check className="w-4 h-4 ml-2" />
              ) : (
                <ExternalLink className="w-4 h-4 ml-2" />
              )}
            </Button>
            <FlexList items="center" gap={0}>
              <QRCode value={publicLink} />
            </FlexList>
          </FlexList>
        ) : null}
        {publicLink ? (
          <RemovePublicLinkForm>
            <DialogFooter>
              <Button type="submit" variant="secondary">
                Remove Public Link
              </Button>
            </DialogFooter>
          </RemovePublicLinkForm>
        ) : (
          <CreatePublicLinkForm>
            <DialogFooter>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </CreatePublicLinkForm>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CreatePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["create-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreatePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["create-public-link"],
    },
  });
  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <Input {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};
const RemovePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["remove-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RemovePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["remove-public-link"],
    },
  });
  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <Input {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};
