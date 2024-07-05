import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Feel } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
  json,
} from "@remix-run/node";
import { Form, Link, useParams, useSearchParams } from "@remix-run/react";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  CirclePlus,
  EllipsisVertical,
  Pencil,
  SearchIcon,
  Trash,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";
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
import { FlexList } from "~/components";
import { FeelContainer } from "~/components/feel-container";
import { SortItems } from "~/components/sort-items";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { deleteFeel, getFeels } from "~/models/feel.server";
import { requireNonSubMember, requireUser } from "~/session.server";
import { useMemberRole } from "~/utils";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { RoleEnum } from "~/utils/enums";
import { updateSortCookie } from "~/utils/sort-cookie.server";
import { createToastHeaders } from "~/utils/toast.server";

const IntentSchema = z.enum(["delete-feel"]);

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const sortQuery = url.searchParams.get("sort");

  const { header, sort } = await updateSortCookie({
    request,
    sortQuery,
    cookieKey: "feelSort",
    defaultSort: "label:asc",
  });

  const feels = await getFeels(bandId, query, sort || "");
  return json({ feels, sort }, { headers: header });
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Feels" }];
};

const DeleteFeelSchema = z.object({
  band_id: z.string(),
  feel_id: z.string(),
  intent: z.literal(IntentSchema.Enum["delete-feel"]),
});

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUser(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === IntentSchema.Enum["delete-feel"]) {
    await requireNonSubMember(request, bandId);
    const submission = parseWithZod(formData, { schema: DeleteFeelSchema });
    if (submission.status !== "success") {
      return submission.reply();
    }
    await deleteFeel(submission.value.feel_id);
    const toastHeaders = await createToastHeaders({
      title: "Deleted!",
      description: "This feel has been deleted successfully.",
      type: "success",
    });
    emitter.emit(emitterKeys.feels);
    emitter.emit(emitterKeys.dashboard);
    return json({ success: true }, { headers: toastHeaders });
  }
  return null;
}

export default function BandFeels() {
  const { feels, sort } = useLiveLoader<typeof loader>(() =>
    toast("Feels updated"),
  );
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
      <FlexList direction="row" items="center" justify="between">
        <H1>Feels</H1>
        {!isSub ? (
          <Button asChild>
            <Link to="new">
              <CirclePlus className="h-4 w-4 mr-2" />
              Create Feel
            </Link>
          </Button>
        ) : null}
      </FlexList>

      <FlexList direction="row" items="center" justify="end" gap={2}>
        <div className="relative ml-auto flex-1 md:grow-0">
          <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <SortItems
          options={[
            {
              label: "Updated: Newest first",
              value: "updatedAt:desc",
              Icon: ArrowDown01,
            },
            {
              label: "Updated: Oldest first",
              value: "updatedAt:asc",
              Icon: ArrowUp01,
            },
            { label: "Name: A-Z", value: "label:asc", Icon: ArrowDownAZ },
            { label: "Name: Z-A", value: "label:desc", Icon: ArrowUpAZ },
          ]}
          value={sort || "updatedAt:desc"}
          onChange={setSort}
        />
      </FlexList>

      {feels.length ? (
        <FlexList gap={1}>
          {feels.map((feel) => (
            <FeelContainer.Card key={feel.id}>
              <FlexList direction="row" items="center" gap={2}>
                <Link className="w-full" key={feel.id} to={feel.id}>
                  <FeelContainer.Feel feel={feel} />
                </Link>
                <FeelActions feel={feel} />
              </FlexList>
            </FeelContainer.Card>
          ))}
        </FlexList>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Feels Found</CardTitle>
            <CardDescription>
              {query
                ? "We couldn't find any feels matching your search."
                : "This band has no feels yet."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            {query ? (
              <Button onClick={() => setQuery("")} variant="secondary">
                Clear search
              </Button>
            ) : !isSub ? (
              <Button asChild>
                <Link to="new">Create your first feel here</Link>
              </Button>
            ) : null}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

const FeelActions = ({ feel }: { feel: SerializeFrom<Feel> }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isSub = useMemberRole() === RoleEnum.SUB;
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Feel Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link
                to={{
                  pathname: `/${feel.bandId}/feels/${feel.id}/edit`,
                  search: `redirectTo=${`/${feel.bandId}/feels`}`,
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </DropdownMenuItem>
            {!isSub ? (
              <DropdownMenuItem onClick={() => setShowDeleteDialog(true)}>
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Song?</DialogTitle>
            <DialogDescription>
              This is a perminent action and cannot be undone. This song will be
              removed from all associated setlists.
            </DialogDescription>
          </DialogHeader>
          <DeleteFeelForm id={feel.id}>
            <DialogFooter>
              <Button type="submit" onClick={() => setShowDeleteDialog(false)}>
                Delete
              </Button>
            </DialogFooter>
          </DeleteFeelForm>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DeleteFeelForm = ({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) => {
  const { bandId } = useParams();
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-feel"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteFeelSchema });
    },
    defaultValue: {
      feel_id: id,
      band_id: bandId,
      intent: IntentSchema.Enum["delete-feel"],
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
      <input hidden {...getInputProps(fields.feel_id, { type: "hidden" })} />
      <input hidden {...getInputProps(fields.band_id, { type: "hidden" })} />
      {children}
    </Form>
  );
};
