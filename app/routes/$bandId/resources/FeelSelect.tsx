import type { ActionArgs, SerializeFrom } from "@remix-run/server-runtime";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { createFeel } from "~/models/feel.server";
import { requireNonSubMember } from "~/session.server";
import CreatableSelect from "react-select/creatable";
import type { Feel } from "@prisma/client";
import { useEffect, useState } from "react";
import { useFetcher, useParams } from "@remix-run/react";

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const newFeel = formData.get('newFeel')

  if (newFeel && typeof newFeel === 'string') {
    return json({
      newFeel: await createFeel(newFeel, bandId)
    })
  }
  return json({ error: 'Could not create feel' })
}

export const FeelSelect = ({ feels, defaultFeels }: { feels: SerializeFrom<Feel>[]; defaultFeels?: SerializeFrom<Feel>[] }) => {
  const fetcher = useFetcher()

  const { bandId } = useParams()
  const [selectedFeels, setSelectedFeels] = useState(defaultFeels || [])

  // ! this feels wrong. Seems like there should be a way to grab the data inside handleCreateFeel
  useEffect(() => {
    const newFeel: SerializeFrom<Feel> | undefined = fetcher.data?.newFeel
    const isUnique = selectedFeels.every(feel => feel.id !== newFeel?.id)
    if (newFeel && isUnique) {
      setSelectedFeels(prevFeels => [...prevFeels, newFeel])
    }
  }, [fetcher, selectedFeels])

  const handleCreateFeel = (newFeel: string) => {
    fetcher.submit({ newFeel }, { method: 'post', action: `${bandId}/resources/FeelSelect` })
  }
  return (
    <CreatableSelect
      value={selectedFeels}
      onChange={newFeels => setSelectedFeels(Array.from(newFeels))}
      name="feels"
      isMulti
      instanceId="feels"
      options={feels}
      onCreateOption={handleCreateFeel}
      getOptionLabel={feel => feel.label}
      getOptionValue={feel => feel.id}
      menuPortalTarget={document.body}
    />
  )
}