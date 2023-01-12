import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { FlexHeader, FlexList, Label, Link, MaxHeightContainer, Navbar, PieChart, RatioBar, TempoWave } from "~/components";
import invariant from "tiny-invariant";
import { getSetMetrics } from "~/models/set.server";
import { useLoaderData } from "@remix-run/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

export async function loader({ params }: LoaderArgs) {
  const { setId } = params
  invariant(setId, 'setId not found')
  const setMetrics = await getSetMetrics(setId)
  return json({ setMetrics })
}

export default function SetDataMetrics() {
  const { setMetrics } = useLoaderData<typeof loader>()

  const { feels, tempos, isCoverLength, isOriginalLength } = setMetrics
  const uniqueFeelIds = [...new Map(feels?.map(feel => [feel?.id, feel])).values()]
  const feelSlices = uniqueFeelIds.map(feel => {
    const feelCount = feels?.filter(f => f?.id === feel?.id)?.length || 0
    const totalFeels = feels?.length || 0
    return {
      percent: feelCount / totalFeels,
      feel: feel
    }
  })

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <h3 className="font-bold">Data metrics</h3>
            <Link isRounded kind="ghost" to=".."><FontAwesomeIcon icon={faTimes} /></Link>
          </FlexHeader>
        </Navbar>
      }
    >
      <FlexList pad={4}>
        <Label>Covers/Originals ratio</Label>
        <RatioBar ratio={{ start: { label: 'Covers', amount: isCoverLength }, stop: { label: 'Originals', amount: isOriginalLength } }} />
        <Label>Feels</Label>
        <PieChart slices={feelSlices} />
        <Label>Tempos</Label>
        <TempoWave tempos={tempos} />
      </FlexList>
    </MaxHeightContainer>
  )
}