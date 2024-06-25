import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { SearchIcon } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { FlexList } from "~/components";
import { FeelContainer } from "~/components/feel-container";
import { H1 } from "~/components/typography";
import { getBand } from "~/models/band.server";
import { deleteFeel, getFeels } from "~/models/feel.server";
import { requireUser } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

const IntentSchema = z.enum(["delete-feel"]);

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const query = new URL(request.url).searchParams.get("query") || "";
  const feels = await getFeels(bandId, query);
  return json({ feels });
}

const DeleteFeelSchema = z.object({
  band_id: z.string(),
  feel_id: z.string(),
  intent: z.literal(IntentSchema.Enum["delete-feel"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

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
}

export default function BandFeels() {
  const { feels } = useLoaderData<typeof loader>();
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

  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between">
        <H1>Feels</H1>
        {!isSub ? (
          <Button asChild>
            <Link to="new">Create Feel</Link>
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
        {/* <SortSetlists value={sort || "updatedAt:desc"} onChange={setSort} /> */}
      </FlexList>

      {feels.length ? (
        <FlexList gap={1}>
          {feels.map((feel) => (
            <Link className="w-full" key={feel.id} to={feel.id}>
              <FeelContainer.Card>
                <FeelContainer.Feel feel={feel} />
              </FeelContainer.Card>
            </Link>
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

// const FeelSettings = ({ feel }: { feel: SerializeFrom<Feel> }) => {
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button title="Update member settings" variant="ghost" size="icon">
//           <EllipsisVertical className="w-4 h-4" />
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent align="end">
//         <DropdownMenuLabel>Feel Options</DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuItem asChild>
//           <Link to={`${feel.id}/edit`}>
//             <Pencil className="w-4 h-4 mr-2" />
//             Edit
//           </Link>
//         </DropdownMenuItem>
//         <DropdownMenuItem onClick={() => setShowDeleteModal(true)}>
//           <Trash className="w-4 h-4 mr-2" />
//           Delete
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//       <DeleteFeelDialog
//         bandId={feel.bandId}
//         feelId={feel.id}
//         open={showDeleteModal}
//         onOpenChange={setShowDeleteModal}
//       />
//     </DropdownMenu>
//   );
// };

// const DeleteFeelDialog = ({
//   bandId,
//   feelId,
//   open,
//   onOpenChange,
// }: {
//   bandId: string;
//   feelId: string;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
// }) => {
//   const [form, fields] = useForm({
//     id: IntentSchema.Enum["delete-feel"],
//     defaultValue: {
//       feel_id: feelId,
//       band_id: bandId,
//       intent: IntentSchema.Enum["delete-feel"],
//     },
//     onValidate({ formData }) {
//       return parseWithZod(formData, { schema: DeleteFeelSchema });
//     },
//     shouldValidate: "onBlur",
//     shouldRevalidate: "onInput",
//   });

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Delete this Feel?</DialogTitle>
//           <DialogDescription>
//             This action is permanent and cannot be undone. Are you sure you want
//             to delete this feel?
//           </DialogDescription>
//         </DialogHeader>
//         <Form method="post" id={form.id} onSubmit={form.onSubmit} noValidate>
//           <input
//             hidden
//             {...getInputProps(fields.feel_id, { type: "hidden" })}
//           />
//           <input
//             hidden
//             {...getInputProps(fields.band_id, { type: "hidden" })}
//           />
//           <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
//           {fields.intent.errors}
//           <DialogFooter>
//             <Button variant="destructive">Delete Feel</Button>
//           </DialogFooter>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   );
// };
