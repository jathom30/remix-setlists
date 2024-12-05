import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, NavLink, useSearchParams } from "@remix-run/react";
import { CirclePlus, SearchIcon } from "lucide-react";
import pluralize from "pluralize";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FlexList } from "~/components";
import { H1, H3, Small } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { getBands } from "~/models/band.server";
import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);
  const url = new URL(request.url);
  const q = url.searchParams.get("query") || "";
  const bands = await getBands(userId, { q });

  if (!bands) {
    throw new Response("Bands not found", { status: 404 });
  }
  return { bands };
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Your Bands" }];
};

export default function Home() {
  const { bands } = useLiveLoader<typeof loader>(() => toast("Bands updated"));
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") ?? "";
  const setQuery = (value: string) => {
    setSearchParams((prev) => {
      prev.set("query", value);
      return prev;
    });
  };

  const hasNoBands = bands.length === 0;
  return (
    <div className="p-2 space-y-2">
      <FlexList direction="row" items="center" justify="between" gap={2}>
        <H1>Bands</H1>
        <Button asChild>
          <Link to="add-band">
            <CirclePlus className="h-4 w-4 mr-2" />
            Add Band
          </Link>
        </Button>
      </FlexList>
      {hasNoBands ? (
        <NavLink to="add-band">
          <Card className="hover:bg-accent hover:text-accent-foreground">
            <CardHeader className="flex-row gap-4 items-center flex-wrap">
              <H3>
                <CirclePlus className="mr-2" />
                Create New
              </H3>
              <div className="flex-grow" />
              <Small>
                You have no bands. Click here to create or add a band to your
                account.
              </Small>
            </CardHeader>
          </Card>
        </NavLink>
      ) : (
        <>
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
            {/* <SortItems value={sort || "updatedAt:desc"} onChange={setSort} /> */}
          </FlexList>
          <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
            {bands.map((band) => (
              <NavLink to={`/${band.id}`} key={band.id}>
                <Card className="hover:bg-accent hover:text-accent-foreground">
                  <CardHeader>
                    <FlexList direction="row" items="center" gap={2}>
                      <Avatar>
                        <AvatarImage
                          src={band.icon?.path || ""}
                          alt={band.name}
                        />
                        <AvatarFallback>
                          {band.name.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <H3>{band.name}</H3>
                    </FlexList>
                    <FlexList direction="row" items="center" gap={2}>
                      <Badge variant="secondary">
                        {
                          band.members.find(
                            (member) => member.userId === user.id,
                          )?.role
                        }
                      </Badge>
                      <Badge variant="outline">
                        {pluralize("Member", band.members.length, true)}
                      </Badge>
                    </FlexList>
                  </CardHeader>
                </Card>
              </NavLink>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
