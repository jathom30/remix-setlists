import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import { FlexList, Label, MaxHeightContainer, PieChart, RatioBar, TempoWave } from "~/components";
import invariant from "tiny-invariant";
import { getSetMetrics } from "~/models/set.server";
import { useLoaderData } from "@remix-run/react";

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
        <h3 className="p-4 pb-0 font-bold bg-white">Data metrics</h3>
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