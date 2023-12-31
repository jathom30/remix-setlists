import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import {
  FlexHeader,
  FlexList,
  Label,
  Link,
  MaxHeightContainer,
  Navbar,
  PieChart,
  RatioBar,
  TempoWave,
} from "~/components";
import { getSetMetrics } from "~/models/set.server";

export async function loader({ params }: LoaderFunctionArgs) {
  const { setId } = params;
  invariant(setId, "setId not found");
  const setMetrics = await getSetMetrics(setId);
  return json({ setMetrics });
}

export default function SetDataMetrics() {
  const { setMetrics } = useLoaderData<typeof loader>();

  const {
    songs,
    feels,
    tempos,
    numberOfCoverSongs,
    numberOfOriginalSongs,
    numberOfSongsWithoutAuthor,
  } = setMetrics;
  const songsWithoutFeelsCount = songs.filter(
    (song) => song.song?.feels.length === 0,
  ).length;
  const uniqueFeels = [
    ...new Map(feels?.map((feel) => [feel?.id, feel])).values(),
  ];
  const totalFeels = feels?.length + songsWithoutFeelsCount;
  const feelSlices = uniqueFeels.map((feel) => {
    const feelCount = feels?.filter((f) => f?.id === feel?.id)?.length || 0;
    return {
      percent: feelCount / totalFeels,
      feel: feel,
    };
  });

  const ratio = {
    start: { label: "Covers", amount: numberOfCoverSongs },
    stop: { label: "Originals", amount: numberOfOriginalSongs },
    unset: {
      label: "Songwriter not available",
      amount: numberOfSongsWithoutAuthor,
    },
  };
  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <h3 className="font-bold">Data metrics</h3>
            <Link isRounded kind="ghost" to="..">
              <FontAwesomeIcon icon={faTimes} />
            </Link>
          </FlexHeader>
        </Navbar>
      }
    >
      <FlexList pad={4}>
        <Label>Covers/Originals ratio</Label>
        <RatioBar ratio={ratio} />
        <Label>Feels</Label>
        <PieChart
          slices={feelSlices}
          noFeel={songsWithoutFeelsCount / totalFeels}
        />
        <Label>Tempos</Label>
        <TempoWave tempos={tempos} />
      </FlexList>
    </MaxHeightContainer>
  );
}
