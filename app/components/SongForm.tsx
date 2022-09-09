import { faArrowDown, faArrowUp, faSave } from "@fortawesome/free-solid-svg-icons";
import type { Feel, Song } from "@prisma/client"
import type { SerializeFrom } from '@remix-run/node'
import Select from "react-select"
import CreatableSelect from 'react-select/creatable';
import { positionEnums, setlistAutoGenImportanceEnums } from '~/utils/enums'
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { ItemBox } from "./ItemBox"
import { Label } from "./Label"
import { Link } from "./Link";
import { Input } from "./Input";
import { Field } from "./Field";
import { keyLetters, majorMinorOptions } from "~/utils/songConstants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RadioGroup } from "./RadioGroup";
import { ErrorMessage } from "./ErrorMessage";

export const SongForm = ({ song, feels, errors, cancelTo }: { song?: Partial<SerializeFrom<Song>>; feels: SerializeFrom<Feel>[]; errors?: Record<keyof SerializeFrom<Song>, string>; cancelTo: string }) => {
  return (
    <FlexList>
      <FlexList gap={2}>
        <Label>Details</Label>
        <ItemBox>
          <FlexList>
            <Field name="name" label="Name" isRequired>
              <Input name="name" defaultValue={song?.name} />
              {errors?.name ? (<ErrorMessage message={errors.name} />) : null}
            </Field>
            <Field name="length" label="Length (in minutes)" isRequired>
              <Input name="length" defaultValue={song?.length} type="number" />
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

            <div className="grid grid-cols-2 gap-4">
              <Field name="tempo" label="Tempo" isRequired>
                <FlexList direction="row">
                  <FontAwesomeIcon size="sm" icon={faArrowDown} />
                  <input defaultValue={song?.tempo} className="w-full" type="range" min={1} max={5} name="tempo" />
                  <FontAwesomeIcon size="lg" icon={faArrowUp} />
                </FlexList>
              </Field>
              <Field name="feels" label="Feels">
                <CreatableSelect
                  name="feels"
                  isMulti
                  instanceId="feels"
                  options={feels}
                  // onCreateOption={newFeel => console.log(newFeel)}
                  getOptionLabel={feel => feel.label}
                  getOptionValue={feel => feel.id}
                />
              </Field>
            </div>

            <FlexList direction="row">
              <Field name='isCover' label="Cover">
                <div className="p-2 rounded hover:bg-slate-100">
                  <FlexList direction="row" items="center">
                    <input id="isCover" name="isCover" type="checkbox" defaultChecked={song?.isCover} />
                    <span className="text-sm">Is a cover</span>
                  </FlexList>
                </div>
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
          </FlexList>
        </ItemBox>
      </FlexList>

      <FlexList gap={2}>
        <Label>Notes</Label>
        <ItemBox>
          <textarea placeholder="Add a note..." className="w-full border p-2" name="note" id="note" rows={5} defaultValue={song?.note || ''} />
        </ItemBox>
      </FlexList>

      <FlexList gap={2}>
        <Label>Settings</Label>
        <ItemBox>
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
        </ItemBox>
      </FlexList>

      <div className="grid grid-cols-2 gap-4">
        <Link to={cancelTo} type="submit">Cancel</Link>
        <Button icon={faSave} kind="primary" type="submit">Save song</Button>
      </div>
    </FlexList>
  )
}