import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { SearchIcon, Trash } from "lucide-react";
import invariant from "tiny-invariant";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlexList } from "~/components";
import { SongContainer } from "~/components/song-container";
import { H1, Muted } from "~/components/typography";
import { getFeelWithSongs } from "~/models/feel.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { feelId } = params;
  invariant(feelId, "feelId is required");
  const query = new URL(request.url).searchParams.get("query") || "";
  const feel = await getFeelWithSongs(feelId, query);
  if (!feel) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ feel });
}

export default function BandFeel() {
  const { feel } = useLoaderData<typeof loader>();

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
        <H1>Feel</H1>
        <Button asChild>
          <Link to="edit">Update Feel</Link>
        </Button>
      </FlexList>
      <Card>
        <CardHeader>
          <CardTitle className="flex">
            <div
              className="h-6 w-6 border rounded-full mr-2"
              style={{ background: feel.color || "" }}
            />
            {feel.label}
          </CardTitle>
          <CardDescription>
            Feels are a helpful way to categorize songs.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Songs Featuring {feel.label}</CardTitle>
        </CardHeader>
        <CardContent>
          <FlexList>
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
            </FlexList>
            <FlexList gap={2}>
              {feel.songs.map((song) => (
                <Link key={song.id} to={`/${feel.bandId}/songs/${song.id}`}>
                  <SongContainer.Card>
                    <SongContainer.Song song={song} />
                  </SongContainer.Card>
                </Link>
              ))}
              {feel.songs.length === 0 ? (
                <Muted>
                  {query
                    ? "We couldn't find any songs matching your search."
                    : "This feel has no songs yet."}
                </Muted>
              ) : null}
            </FlexList>
          </FlexList>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Deleting this feel is a perminant action and cannot be undone. It
            will be removed from all songs and will no longer be available for
            use.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <DeleteFeelDialog />
        </CardFooter>
      </Card>
    </div>
  );
}

const DeleteFeelDialog = () => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash className="w-4 h-4 mr-2" />
          Delete Feel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this feel
            from all songs.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form method="post">
          <input type="hidden" name="intent" value="delete" />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction type="submit">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};