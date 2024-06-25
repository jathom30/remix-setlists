import { Feel, Set, Setlist, Song } from "@prisma/client";
import { LoaderFunctionArgs, SerializeFrom, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlexList, PieChart, RatioBar, TempoWave } from "~/components";
import { H1 } from "~/components/typography";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { setlistId, bandId } = params;
  invariant(setlistId, "setlistId is required");
  invariant(bandId, "bandId is required");
  const setlist = await getSetlist(setlistId);
  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 });
  }
  return json({ setlist });
}

type TSetlist = SerializeFrom<
  Setlist & {
    sets: (Set & { songs: { song: Song & { feels: Feel[] } }[] })[];
    band: { name: string };
  }
>;

const getSongCounts = (setlist: TSetlist, setId: string) => {
  const bandName = setlist.band.name;
  const getOriginalSongCount = () => {
    if (setId === "all-sets") {
      return setlist.sets.reduce((acc, set) => {
        return (
          acc +
          set.songs.filter((song) => song.song?.author === bandName).length
        );
      }, 0);
    }
    const set = setlist.sets.find((set) => set.id === setId);
    return (
      set?.songs.filter((song) => song.song?.author === bandName).length || 0
    );
  };
  const getCoverSongCount = () => {
    if (setId === "all-sets") {
      return setlist.sets.reduce((acc, set) => {
        return (
          acc +
          set.songs.filter(
            (song) => song.song?.author && song.song.author !== bandName,
          ).length
        );
      }, 0);
    }
    const set = setlist.sets.find((set) => set.id === setId);
    return (
      set?.songs.filter(
        (song) => song.song?.author && song.song.author !== bandName,
      ).length || 0
    );
  };

  const getUnknownSongCount = () => {
    if (setId === "all-sets") {
      return setlist.sets.reduce((acc, set) => {
        return acc + set.songs.filter((song) => !song.song?.author).length;
      }, 0);
    }
    const set = setlist.sets.find((set) => set.id === setId);
    return set?.songs.filter((song) => !song.song?.author).length || 0;
  };

  return {
    coverCount: getCoverSongCount(),
    originalCount: getOriginalSongCount(),
    unknownCount: getUnknownSongCount(),
  };
};

interface TTempFeel {
  label: string;
  color: string;
  id: string;
}

const getFeels = (setlist: TSetlist, setId: string) => {
  const getFeelCount = (id: string) => {
    const set = setlist.sets.find((set) => set.id === id);
    if (!set) {
      return [];
    }
    const feels: TTempFeel[] = [];
    set.songs.forEach((song) => {
      song.song.feels.forEach((feel) => {
        if (!feels.find((f) => f.id === feel.id)) {
          feels.push({
            label: feel.label,
            color: feel.color || "",
            id: feel.id,
          });
        }
      });
    });
    return feels;
  };
  if (setId === "all-sets") {
    return setlist.sets.reduce((acc: TTempFeel[], set) => {
      return set.songs.reduce((acc, song) => {
        song.song.feels.forEach((feel) => {
          if (!acc.find((f) => f.id === feel.id)) {
            acc.push({
              label: feel.label,
              color: feel.color || "",
              id: feel.id,
            });
          }
        });
        return acc;
      }, acc);
    }, []);
  }

  return getFeelCount(setId);
};

export default function SetlistMetrics() {
  const { setlist } = useLoaderData<typeof loader>();
  const [activeSet, setActiveSet] = useState("all-sets");

  const { coverCount, originalCount, unknownCount } = getSongCounts(
    setlist,
    activeSet,
  );
  const ratio = {
    start: { label: "Originals", amount: originalCount },
    stop: { label: "Covers", amount: coverCount },
    unset: {
      label: "Songwriter not available",
      amount: unknownCount,
    },
  };

  const feels = getFeels(setlist, activeSet);
  const feelsCount = feels.reduce((totals: Record<string, number>, feel) => {
    if (!totals[feel.label]) {
      totals[feel.label] = 0;
    }
    totals[feel.label] += 1;
    return totals;
  }, {});
  const getSongsWithoutFeelsCount = () => {
    if (activeSet === "all-sets") {
      return setlist.sets.reduce((acc, set) => {
        return (
          acc + set.songs.filter((song) => song.song?.feels.length === 0).length
        );
      }, 0);
    }
    const set = setlist.sets.find((set) => set.id === activeSet);
    return (
      set?.songs.filter((song) => song.song?.feels.length === 0).length || 0
    );
  };
  const feelSlices = Object.entries(feelsCount).map(([label, count]) => {
    return {
      percent: count / (feels.length + getSongsWithoutFeelsCount()),
      feel: {
        label,
        color: feels.find((f) => f.label === label)?.color || "",
      },
    };
  });
  const songsWithoutFeelsCount = getSongsWithoutFeelsCount();
  const totalFeels = feels?.length + songsWithoutFeelsCount;

  const getTempos = () => {
    if (activeSet === "all-sets") {
      return setlist.sets.reduce((acc: number[], set) => {
        const setTempos = set.songs.map((song) => song.song?.tempo || 0);
        return acc.concat(setTempos);
      }, []);
    }
    const set = setlist.sets.find((set) => set.id === activeSet);
    if (!set) {
      return [];
    }
    return set.songs.map((song) => song.song?.tempo || 0);
  };
  return (
    <div className="p-2 space-y-2">
      <H1>Metrics</H1>
      {setlist.sets.length > 1 ? (
        <FlexList direction="row" justify="end">
          <Tabs value={activeSet} onValueChange={setActiveSet}>
            <TabsList>
              {setlist.sets.map((set, i) => (
                <TabsTrigger key={set.id} value={set.id}>
                  Set {i + 1}
                </TabsTrigger>
              ))}
              <TabsTrigger value="all-sets">All Sets</TabsTrigger>
            </TabsList>
          </Tabs>
        </FlexList>
      ) : null}
      <div className="grid gap-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Covers to Originals Ratio</CardTitle>
            <CardDescription>
              This ratio represents the number of cover songs versus original
              songs in the setlist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RatioBar ratio={ratio} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Feels</CardTitle>
            <CardDescription>
              See the mix of feels across the setlist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PieChart
              slices={feelSlices}
              noFeel={songsWithoutFeelsCount / totalFeels}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tempos</CardTitle>
            <CardDescription>
              The graph below shows the tempos chronologically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-full">
              <TempoWave tempos={getTempos()} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
