import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  Link,
  isRouteErrorResponse,
  useLoaderData,
  useLocation,
  useRouteError,
} from "@remix-run/react";
import pluralize from "pluralize";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CatchContainer,
  ErrorContainer,
  FlexList,
  Header,
  MaxWidth,
} from "~/components";
import { H1, P, Muted } from "~/components/typography";
import { getPublicSetlist } from "~/models/setlist.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const urlSearchParams = new URL(request.url).searchParams;
  const setlistId = urlSearchParams.get("setlistId");
  invariant(setlistId, "setlistId not found");

  const setlist = await getPublicSetlist(setlistId);
  return { setlist };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [
      {
        title: "Setlist",
      },
    ];
  }
  const {
    setlist: { name },
  } = data;
  return [{ title: name }];
};

export default function PublicSetlist() {
  const { setlist } = useLoaderData<typeof loader>();
  const { search } = useLocation();
  const urlSearchParams = new URLSearchParams(search);
  const bandId = urlSearchParams.get("bandId");
  const setlistId = urlSearchParams.get("setlistId");

  const setLength = (set: (typeof setlist)["sets"][number]) =>
    set.songs.reduce((acc, song) => (acc += song.song?.length || 0), 0);

  return (
    <div className="bg-muted/40 h-full">
      <div className="p-2 border-b sticky top-0 inset-x-0 z-10 bg-background">
        <Header>
          <div></div>
          <FlexList direction="row" gap={2} items="center">
            <Button variant="secondary" asChild>
              <Link to={`/${bandId}/setlists/${setlistId}`}>
                Login to see full details
              </Link>
            </Button>
          </FlexList>
        </Header>
      </div>
      <MaxWidth>
        <div className="p-2 space-y-2">
          <H1>{setlist.name}</H1>
          <div className="grid gap-2 sm:grid-cols-2">
            {setlist.sets.map((set, index) => (
              <Card key={set.id}>
                <CardHeader>
                  <CardTitle className="text-lg">Set {index + 1}</CardTitle>
                  <CardDescription>
                    {pluralize("minutes", setLength(set), true)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {set.songs.map((song, songIndex) => (
                    <div
                      className="flex gap-2 items-baseline"
                      key={song.songId}
                    >
                      <P>
                        {songIndex + 1}. {song.song?.name}
                      </P>
                      {song.song?.author ? (
                        <Muted>{song.song.author}</Muted>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MaxWidth>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
