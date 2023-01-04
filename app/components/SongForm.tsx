import { faBolt } from "@fortawesome/free-solid-svg-icons";
import type { Feel, Song } from "@prisma/client"
import type { SerializeFrom } from '@remix-run/node'
import Select from "react-select"
import { positionEnums, setlistAutoGenImportanceEnums } from '~/utils/enums'
import { FlexList } from "./FlexList"
import { Label } from "./Label"
import { Input } from "./Input";
import { Field } from "./Field";
import { keyLetters, majorMinorOptions } from "~/utils/songConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RadioGroup } from "./RadioGroup";
import { ErrorMessage } from "./ErrorMessage";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { Checkbox } from "./Checkbox";
import { FeelSelect } from "~/routes/$bandId/resources/FeelSelect";
import { getTempoColor } from "./TempoIcons";

const getRangeColor = (tempo: number) => {
  switch (tempo) {
    case 1:
      return 'range-info'
    case 2:
      return 'range-accent'
    case 3:
      return 'range-success'
    case 4:
      return 'range-warning'
    case 5:
      return 'range-error'
    default:
      return 'range-base-content'
  }
}

export const SongForm = ({ song, feels, errors }: {
  song?: Partial<SerializeFrom<Song & { feels: Feel[] }>>; feels: SerializeFrom<Feel>[];
  errors?: Record<keyof SerializeFrom<Song>, string>;
}) => {
  const [isWindow, setIsWindow] = useState(false)
  const [tempoColorClass, setTempoColorClass] = useState(getRangeColor(song?.tempo || 3))

  // Select's portal needs window in this component. Without this check, page crashes on reload
  useEffect(() => {
    setIsWindow(true)
  }, [])

  if (!isWindow) { return null }

  const handleTempoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setTempoColorClass(getRangeColor(parseInt(value)))
  }

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
        <input defaultValue={song?.tempo} onChange={handleTempoChange} className={`range ${tempoColorClass}`} type="range" min={1} max={5} name="tempo" />
        <div className="w-full flex justify-between pt-1 px-2">
          <FontAwesomeIcon className={getTempoColor(1)} icon={faBolt} />
          <FontAwesomeIcon className={getTempoColor(2)} icon={faBolt} />
          <FontAwesomeIcon className={getTempoColor(3)} icon={faBolt} />
          <FontAwesomeIcon className={getTempoColor(4)} icon={faBolt} />
          <FontAwesomeIcon className={getTempoColor(5)} icon={faBolt} />
        </div>
      </Field>
      <Field name="feels" label="Feels">
        <FeelSelect feels={feels} defaultFeels={song?.feels} />
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
        <textarea placeholder="Add a note..." className="textarea textarea-bordered" name="note" id="note" rows={5} defaultValue={song?.note || ''} />
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