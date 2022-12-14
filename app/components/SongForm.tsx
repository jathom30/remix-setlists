import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import type { Feel, Song } from "@prisma/client"
import type { SerializeFrom } from '@remix-run/node'
import Select from "react-select"
import CreatableSelect from 'react-select/creatable';
import { positionEnums, setlistAutoGenImportanceEnums } from '~/utils/enums'
import { FlexList } from "./FlexList"
import { Label } from "./Label"
import { Input } from "./Input";
import { Field } from "./Field";
import { keyLetters, majorMinorOptions } from "~/utils/songConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RadioGroup } from "./RadioGroup";
import { ErrorMessage } from "./ErrorMessage";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";
import { useFetcher, useParams } from "@remix-run/react";

export const SongForm = ({ song, feels, errors }: {
  song?: Partial<SerializeFrom<Song & { feels: Feel[] }>>; feels: SerializeFrom<Feel>[];
  errors?: Record<keyof SerializeFrom<Song>, string>;
}) => {
  const [originalFeels] = useState(feels)
  const [selectedFeels, setSelectedFeels] = useState(song?.feels || [])
  const [isWindow, setIsWindow] = useState(false)
  const fetcher = useFetcher()
  const { bandId } = useParams()

  // Select's portal needs window in this component. Without this check, page crashes on reload
  useEffect(() => {
    setIsWindow(true)
  }, [])

  useEffect(() => {
    setSelectedFeels(prevFeels => {
      const [newFeel] = feels?.filter(feel => originalFeels?.every(og => og.id !== feel.id)) || []
      const newFeels = [...prevFeels, newFeel]
      return newFeels
    })
  }, [originalFeels, feels])

  // uses a resourse route to create new so parent route doesn't have to filter requests
  const handleCreateFeel = (newFeel: string) => {
    fetcher.submit({ newFeel }, { method: 'post', action: `${bandId}/resources/createNewFeel` })
  }

  if (!isWindow) { return null }

  return (
    <FlexList pad={4}>
      <Field name="name" label="Name" isRequired>
        <Input name="name" defaultValue={song?.name} placeholder="Song name..." />
        {errors?.name ? (<ErrorMessage message={errors.name} />) : null}
      </Field>
      <Field name="length" label="Length (in minutes)" isRequired>
        <Input name="length" defaultValue={song?.length} type="number" placeholder="Song length..." />
        {errors?.length ? (<ErrorMessage message={errors.length} />) : null}
      </Field>

      <FlexList gap={2}>
        <Label>Key</Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            isClearable
            instanceId="keyLetter"
            defaultValue={song?.keyLetter ? { value: song?.keyLetter, label: song?.keyLetter } : undefined}
            name="keyLetter"
            options={keyLetters.map(letter => ({ value: letter, label: letter }))}
          />
          <Select
            isClearable
            instanceId="isMinor"
            defaultValue={song?.keyLetter ? { label: song?.isMinor ? 'Minor' : 'Major', value: song?.isMinor } : undefined}
            name="isMinor"
            options={majorMinorOptions}
          />
        </div>
      </FlexList>

      <Field name="tempo" label="Tempo" isRequired>
        <FlexList direction="row">
          <FontAwesomeIcon size="sm" icon={faArrowDown} />
          <input defaultValue={song?.tempo} className="w-full" type="range" min={1} max={5} name="tempo" />
          <FontAwesomeIcon size="lg" icon={faArrowUp} />
        </FlexList>
      </Field>
      <Field name="feels" label="Feels">
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
      </Field>

      <FlexList direction="row">
        <Field name='isCover' label="Cover">
          <Checkbox name="isCover" label="Is a cover" />
        </Field>
      </FlexList>

      <FlexList gap={2}>
        <Label>Position</Label>
        <RadioGroup
          name="position"
          options={[
            { label: positionEnums.opener, value: 'opener' },
            { label: positionEnums.closer, value: 'closer' },
            { label: positionEnums.other, value: 'other' },
          ]}
          isChecked={(val) => song?.position === val}
        />
      </FlexList>

      <FlexList gap={2}>
        <Label>Notes</Label>
        <textarea placeholder="Add a note..." className="w-full border p-2" name="note" id="note" rows={5} defaultValue={song?.note || ''} />
      </FlexList>

      <FlexList gap={2}>
        <Label>Setlist auto-generation importance</Label>
        <RadioGroup
          name="rank"
          options={[
            { label: setlistAutoGenImportanceEnums.exclude, value: 'exclude' },
            { label: setlistAutoGenImportanceEnums.include, value: 'include' },
            { label: setlistAutoGenImportanceEnums.no_preference, value: 'no_preference' },
          ]}
          isChecked={(val) => song?.rank === val}
        />
      </FlexList>
    </FlexList>
  )
}