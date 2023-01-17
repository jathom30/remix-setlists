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
import type { handleSongFormData } from "~/models/song.server";
import { getColor } from "~/utils/tailwindColors";
import { useMatchesData } from "~/utils";

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
  errors?: SerializeFrom<ReturnType<typeof handleSongFormData>['errors']>;
}) => {
  const [isWindow, setIsWindow] = useState(false)
  const [tempoColorClass, setTempoColorClass] = useState(getRangeColor(song?.tempo || 3))
  // const [authorField, setAuthorField] = useState<'cover' | 'original' | 'untouched'>('untouched')
  const [author, setAuthor] = useState(song?.author)
  const { band } = useMatchesData('routes/$bandId') as { band: { name: string } }
  const [isAuthorDisabled, setIsAuthorDisabled] = useState(song?.author === band.name)

  // Select's portal needs window in this component. Without this check, page crashes on reload
  useEffect(() => {
    setIsWindow(true)
  }, [])

  if (!isWindow) { return null }

  const handleTempoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setTempoColorClass(getRangeColor(parseInt(value)))
  }
  const handleOriginalPieceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    setIsAuthorDisabled(checked)
    if (checked) {
      setAuthor(band.name)
    }
  }

  const base100 = getColor('base-100')
  const base200 = getColor('base-200')
  const baseContent = getColor('base-content')
  const border = getColor('base-content', .2)

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
            instanceId="keyLetter"
            defaultValue={{ value: song?.keyLetter ?? "C", label: song?.keyLetter ?? "C" }}
            name="keyLetter"
            options={keyLetters.map(letter => ({ value: letter, label: letter }))}
            styles={{
              control: (baseStyles, { isFocused }) => ({
                ...baseStyles,
                backgroundColor: base100,
                text: baseContent,
                borderColor: border,
                ...(isFocused ? {
                  outline: 2, outlineStyle: 'solid', outlineColor: border, outlineOffset: 2
                } : null),
                '&:hover': {
                  borderColor: baseContent
                }
              }),
              group: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              groupHeading: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              loadingIndicator: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              loadingMessage: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              menuList: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              menuPortal: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              placeholder: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              singleValue: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValue: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValueLabel: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValueRemove: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              input: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: border }),
              indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: border }),
              noOptionsMessage: (baseStyles) => ({ ...baseStyles }),
              menu: (baseStyles) => ({ ...baseStyles, backgroundColor: base100, color: baseContent }),
              option: (baseStyles, state) => ({
                ...baseStyles, backgroundColor: base100, color: baseContent,
                '&:hover': { backgroundColor: base200 }
              }),
            }}
          />
          <Select
            instanceId="isMinor"
            defaultValue={{ label: song?.isMinor ? 'Minor' : 'Major', value: song?.isMinor }}
            name="isMinor"
            options={majorMinorOptions}
            styles={{
              control: (baseStyles, { isFocused }) => ({
                ...baseStyles,
                backgroundColor: base100,
                text: baseContent,
                borderColor: border,
                ...(isFocused ? {
                  outline: 2, outlineStyle: 'solid', outlineColor: border, outlineOffset: 2
                } : null),
                '&:hover': {
                  borderColor: baseContent
                }
              }),
              group: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              groupHeading: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              loadingIndicator: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              loadingMessage: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              menuList: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              menuPortal: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              placeholder: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              singleValue: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValue: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValueLabel: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              multiValueRemove: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              input: (baseStyles) => ({ ...baseStyles, color: baseContent }),
              dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: border }),
              indicatorSeparator: (baseStyles) => ({ ...baseStyles, backgroundColor: border }),
              noOptionsMessage: (baseStyles) => ({ ...baseStyles }),
              menu: (baseStyles) => ({ ...baseStyles, backgroundColor: base100, color: baseContent }),
              option: (baseStyles, state) => ({
                ...baseStyles, backgroundColor: base100, color: baseContent,
                '&:hover': { backgroundColor: base200 }
              }),
            }}
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

      <FlexList gap={0}>
        <Field name="visAuthor" label="Artist(s)">
          <Input
            name="visAuthor"
            placeholder="Artist name(s)..."
            isDisabled={isAuthorDisabled}
            onChange={e => setAuthor(e.target.value)}
            value={author || ''}
          />
        </Field>
        <Checkbox name="isOriginal" onChange={handleOriginalPieceChange} label="Original piece" defaultChecked={isAuthorDisabled} />
        <input type="hidden" hidden name="author" value={author || undefined} />
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
        <Label>Notes/Lyrics</Label>
        <textarea placeholder="Add a note or some lyrics..." className="textarea textarea-bordered" name="note" id="note" rows={5} defaultValue={song?.note || ''} />
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