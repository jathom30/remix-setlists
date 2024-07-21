import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import { useFetcher, useLoaderData, useParams } from "@remix-run/react";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { FlexList } from "~/components";
import { H1, Muted, P, Small } from "~/components/typography";
import {
  createSetlistNote,
  deleteSetlistNote,
  editSetlistNote,
  getSetlistNotes,
  markAllNotesAsSeen,
} from "~/models/setlist-notes";
import { getSetlist } from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { useMemberRole, useUser } from "~/utils";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";

const NoteIntentEnum = z.enum(["create", "delete", "edit"]);

const CreateNoteSchema = z.object({
  intent: z.literal(NoteIntentEnum.Enum.create),
  content: z.string().min(1),
  userId: z.string().min(1),
  setlistId: z.string().min(1),
});

const DeleteNoteSchema = z.object({
  intent: z.literal(NoteIntentEnum.Enum.delete),
  noteId: z.string().min(1),
});

const EditNoteSchema = z.object({
  intent: z.literal(NoteIntentEnum.Enum.edit),
  noteId: z.string().min(1),
  content: z.string().min(1),
});

export async function loader({ request, params }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }

  const notes = await getSetlistNotes(setlistId);
  await markAllNotesAsSeen(setlistId, userId);
  return json({ setlist, notes });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data?.setlist.name} Notes` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === NoteIntentEnum.Enum.create) {
    const submission = parseWithZod(formData, { schema: CreateNoteSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await createSetlistNote(submission.value);
  }

  if (intent === NoteIntentEnum.Enum.delete) {
    const submission = parseWithZod(formData, { schema: DeleteNoteSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await deleteSetlistNote(submission.value.noteId);
  }

  if (intent === NoteIntentEnum.Enum.edit) {
    const submission = parseWithZod(formData, { schema: EditNoteSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await editSetlistNote({
      content: submission.value.content,
      id: submission.value.noteId,
    });
  }
  emitter.emit(emitterKeys.setlist_notes);
  return null;
}

export default function SetlistNotes() {
  const { notes } = useLoaderData<typeof loader>();

  const memberRole = useMemberRole();
  const isSub = memberRole === RoleEnum.SUB;

  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <H1>Notes</H1>
        {!isSub ? <NewSetlistNote /> : null}
      </FlexList>

      <FlexList gap={1}>
        {notes.map((note) => (
          <NoteContainer key={note.id} note={note} />
        ))}
      </FlexList>
    </div>
  );
}

const NoteContainer = ({
  note,
}: {
  note: SerializeFrom<Awaited<ReturnType<typeof getSetlistNotes>>[number]>;
}) => {
  const user = useUser();

  const isCreatedToday =
    new Date(note.createdAt).toDateString() === new Date().toDateString();
  const displayDate = isCreatedToday
    ? new Date(note.createdAt).toLocaleTimeString()
    : new Date(note.createdAt).toLocaleDateString();
  const isMyNote = note.createdBy?.id === user.id;

  return (
    <Card key={note.id}>
      <CardHeader>
        <FlexList direction="row" items="center">
          <Small>{note.createdBy?.name}</Small>
          <Muted>{displayDate}</Muted>
        </FlexList>
      </CardHeader>
      <CardContent>
        <FlexList gap={1}>
          {note.content.split("\n").map((item) => (
            <P key={item}>{item}</P>
          ))}
        </FlexList>
      </CardContent>
      {isMyNote ? (
        <CardFooter>
          <FlexList direction="row">
            <EditSetlistNote content={note.content} noteId={note.id} />
            <DeleteNote noteId={note.id} />
          </FlexList>
        </CardFooter>
      ) : null}
    </Card>
  );
};

const NewSetlistNote = () => {
  const { setlistId } = useParams();
  const fetcher = useFetcher({
    key: "create-note",
  });
  const user = useUser();
  const [form, fields] = useForm({
    id: "create-note",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateNoteSchema });
    },
    defaultValue: {
      intent: NoteIntentEnum.Enum.create,
      content: "",
      userId: user.id,
      setlistId,
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <CirclePlus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetTitle>Add Note</SheetTitle>
        <SheetDescription>
          Add a note to the setlist for your bandmates to see.
        </SheetDescription>
        <fetcher.Form method="post" {...getFormProps(form)}>
          <div className="space-y-2 py-2">
            <Textarea
              placeholder="Setlist note..."
              {...getInputProps(fields.content, { type: "text" })}
            />
            <div className="text-sm text-destructive">
              {fields.content.errors}
            </div>
            <input
              hidden
              {...getInputProps(fields.intent, { type: "hidden" })}
            />
            <input
              hidden
              {...getInputProps(fields.userId, { type: "hidden" })}
            />
            <input
              hidden
              {...getInputProps(fields.setlistId, { type: "hidden" })}
            />
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" disabled={fetcher.state !== "idle"}>
                Add Note
              </Button>
            </SheetClose>
          </SheetFooter>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
};

const EditSetlistNote = ({
  content,
  noteId,
}: {
  content: string;
  noteId: string;
}) => {
  const fetcher = useFetcher({
    key: noteId,
  });
  const [formContent, setFormContent] = useState(content);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">Edit</Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetTitle>Edit Note</SheetTitle>
        <SheetDescription>
          Add a note to the setlist for your bandmates to see.
        </SheetDescription>
        <fetcher.Form method="post">
          <div className="space-y-2 py-2">
            <Textarea
              name="content"
              placeholder="Setlist note..."
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
            />
          </div>
          <input
            hidden
            name="intent"
            value={NoteIntentEnum.Enum.edit}
            type="hidden"
          />
          <input hidden name="noteId" value={noteId} type="hidden" />
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit" disabled={fetcher.state !== "idle"}>
                Update Note
              </Button>
            </SheetClose>
          </SheetFooter>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
};

const DeleteNote = ({ noteId }: { noteId: string }) => {
  const fetcher = useFetcher({
    key: "delete-note",
  });
  const [form, fields] = useForm({
    id: "delete-note",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteNoteSchema });
    },
    defaultValue: {
      intent: NoteIntentEnum.Enum.delete,
      noteId,
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete Note</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this note?
        </DialogDescription>
        <fetcher.Form method="delete" {...getFormProps(form)}>
          <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
          <input hidden {...getInputProps(fields.noteId, { type: "hidden" })} />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="submit" disabled={fetcher.state !== "idle"}>
                Delete Note
              </Button>
            </DialogClose>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};
