import { Setlist } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getSetlistNotes(setlistId: Setlist["id"]) {
  return prisma.setlistNote.findMany({
    where: {
      setlistId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      seenBy: {
        select: {
          userId: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnseenNotes(setlistId: Setlist["id"], userId: string) {
  return prisma.setlistNote.findMany({
    where: {
      setlistId,
      seenBy: {
        none: {
          userId,
        },
      },
    },
  });
}

export async function getUnseenNotesCount(
  setlistId: Setlist["id"],
  userId: string,
) {
  return prisma.setlistNote.count({
    where: {
      setlistId,
      seenBy: {
        none: {
          userId,
        },
      },
    },
  });
}

export async function markAllNotesAsSeen(
  setlistId: Setlist["id"],
  userId: string,
) {
  const unseenNotes = await getUnseenNotes(setlistId, userId);
  const seenBy = unseenNotes.map((note) => ({
    userId,
    setlistNoteId: note.id,
  }));
  return Promise.all(
    seenBy.map((seen) =>
      prisma.usersInSetlistNotes.create({
        data: seen,
      }),
    ),
  );
}

export async function createSetlistNote(note: {
  setlistId: Setlist["id"];
  content: string;
  userId: string;
}) {
  const createdNote = await prisma.setlistNote.create({
    data: {
      content: note.content,
      createdById: note.userId,
      setlistId: note.setlistId,
      seenBy: {
        create: {
          userId: note.userId,
        },
      },
    },
  });
  return createdNote;
}

export async function editSetlistNote({
  id,
  content,
}: {
  id: string;
  content: string;
}) {
  return prisma.setlistNote.update({
    where: { id },
    data: {
      content,
    },
  });
}

export async function deleteSetlistNote(noteId: string) {
  return prisma.setlistNote.delete({
    where: {
      id: noteId,
    },
  });
}
