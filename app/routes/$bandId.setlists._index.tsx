import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowDownUp,
  ArrowUp01,
  ArrowUpAZ,
  Plus,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FlexList, SetlistLink } from "~/components";
import { H1 } from "~/components/typography";
import { useLiveLoader } from "~/hooks";
import { userPrefs } from "~/models/cookies.server";
import { getSetlists } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";
import { getColor } from "~/utils/tailwindColors";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const bandId = params.bandId;
  invariant(bandId, "bandId not found");

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
    setlists: setlists.filter((setlist) => !setlist.editedFromId),
    sort,
  });
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
        <SortSetlists value={sort || ""} onChange={console.log} />
      </FlexList>

      {setlists.length ? (
        <FlexList gap={2}>
          {setlists.map((setlist) => (
            <SetlistLink
              key={setlist.id}
              setlist={setlist}
              publicRemark="You can remove the public link by clicking on this setlist's settings."
            />
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
const sortOptions = [
  {
    label: "Updated: Newest first",
    value: "updated-desc",
    icon: <ArrowDown01 className="w-4 h-4" />,
  },
  {
    label: "Updated: Oldest first",
    value: "updated-asc",
    icon: <ArrowUp01 className="w-4 h-4" />,
  },
  {
    label: "Name: A-Z",
    value: "name-asc",
    icon: <ArrowDownAZ className="w-4 h-4" />,
  },
  {
    label: "Name: Z-A",
    value: "name-desc",
    icon: <ArrowUpAZ className="w-4 h-4" />,
  },
];

const SortSetlists = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div>
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <ArrowDownUp className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Setlist Sort</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                defaultValue={value}
                onValueChange={onChange}
              >
                {sortOptions.map(({ label, value: val, icon }) => (
                  <DropdownMenuRadioItem
                    key={val}
                    value={val}
                    className="flex flex-row gap-2"
                  >
                    {icon}
                    {label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <ArrowDownUp className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Setlist Sort</SheetTitle>
              <SheetDescription>
                <RadioGroup defaultValue={value} onValueChange={onChange}>
                  <FlexList gap={0}>
                    {sortOptions.map(({ label, value: val, icon }) => (
                      <div
                        key={val}
                        className="p-2 rounded hover:bg-accent hover:text-accent-foreground"
                      >
                        <FlexList direction="row" items="center" gap={2}>
                          <RadioGroupItem value={val} id={val} />
                          <Label
                            className="w-full text-start flex flex-row gap-2"
                            htmlFor={val}
                          >
                            {icon}
                            {label}
                          </Label>
                        </FlexList>
                      </div>
                    ))}
                  </FlexList>
                </RadioGroup>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
