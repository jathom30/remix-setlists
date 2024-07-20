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
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function createSetlistNote(note: {
  setlistId: Setlist["id"];
  content: string;
  userId: string;
}) {
  return prisma.setlistNote.create({
    data: {
      content: note.content,
      createdById: note.userId,
      setlistId: note.setlistId,
    },
  });
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
