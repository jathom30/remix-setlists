import { useState } from "react";
import type { ReactNode } from "react";
import type { SerializeFrom } from "@remix-run/node";
import type { Feel } from "@prisma/client";
import { Button, Checkbox, Collapsible, CollapsibleHeader, FlexList, Label, MaxHeightContainer, TempoIcons } from "~/components";
import Select from "react-select";
import { capitalizeFirstLetter } from "~/utils/assorted";

const positions = ['opener', 'closer', 'other'] as const

export function SongFilters({ filters, onChange, feels, onClearAll }: { filters?: URLSearchParams; onChange: (param: string, value: string | string[]) => void; feels: SerializeFrom<Feel>[]; onClearAll: () => void }) {
  const feelParams = filters?.getAll('feels').reduce((allFeels: SerializeFrom<Feel>[], feelId) => {
    const foundFeel = feels.find(feel => feel.id === feelId)
    if (foundFeel?.id) {
      return [
        ...allFeels, foundFeel
      ]
    }
    return allFeels
  }, [])

  const handleTempoChange = (tempo: string) => {
    const currentTempos = filters?.getAll('tempos') || []
    // if already in array, remove
    if (currentTempos?.some(t => t === tempo)) {
      const newTempos = [...currentTempos].filter(t => t !== tempo)
      onChange('tempos', newTempos)
    } else {
      onChange('tempos', [...currentTempos, tempo])
    }
  }

  const handleArtistChange = (artist: 'isCover' | 'isOriginal') => {
    const currentArtist = filters?.get('isCover')
    onChange('isCover', artist !== currentArtist ? artist : '')
  }

  const handlePositionChange = (position: typeof positions[number]) => {
    const currentPositions = filters?.getAll('positions') || []
    if (currentPositions?.some(p => p === position)) {
      const newPositions = [...currentPositions].filter(p => p !== position)
      onChange('positions', newPositions)
    } else {
      onChange('positions', [...currentPositions, position])
    }
  }

  return (
    <MaxHeightContainer
      header={
        <div className="border-b border-slate-300 bg-white">
          <FlexList pad={2} direction="row" justify="between" items="center">
            <span className="font-bold">Filters</span>
            <Button type="button" kind="secondary" onClick={onClearAll}>Clear all</Button>
          </FlexList>
        </div>
      }
    >
      <FlexList gap={0}>
        <FilterOption label="Tempo">
          <FlexList gap={2}>
            {Array.from({ length: 5 }, (_, i) => (
              <Checkbox
                key={i}
                defaultChecked={filters?.getAll('tempos').some(t => t === (i + 1).toString())}
                name="tempos"
                label={<TempoIcons tempo={i + 1} />}
                onChange={() => handleTempoChange((i + 1).toString())}
              />
            ))}
          </FlexList>
        </FilterOption>
        <FilterOption label="Feels">
          <Select
            defaultValue={feelParams}
            isMulti
            onChange={newFeels => {
              onChange('feels', newFeels.map(newFeel => newFeel.id))
            }}
            name="feels"
            options={feels}
            getOptionValue={feel => feel.id}
            getOptionLabel={feel => feel.label}
          />
        </FilterOption>
        <FilterOption label="Artist">
          <FlexList gap={2}>
            <Checkbox
              name="isCover"
              label="Covers only"
              defaultChecked={filters?.get('isCover') === 'isCover'}
              onChange={() => handleArtistChange('isCover')}
            />
            <Checkbox
              name="isCover"
              label="Originals only"
              defaultChecked={filters?.get('isCover') === 'isOriginal'}
              onChange={() => handleArtistChange('isOriginal')}
            />
          </FlexList>
        </FilterOption>
        <FilterOption label="Positions">
          <FlexList gap={2}>
            {positions.map(position => (
              <Checkbox
                key={position}
                defaultChecked={filters?.getAll('positions').some(p => p === position)}
                name="positions"
                label={`${capitalizeFirstLetter(position)}s`}
                onChange={() => handlePositionChange(position)}
              />
            ))}
          </FlexList>
        </FilterOption>
      </FlexList>
    </MaxHeightContainer>
  )
}

const FilterOption = ({ label, children }: { label: string; children?: ReactNode }) => {
  const [show, setShow] = useState(true)
  return (
    <Collapsible
      isOpen={show}
      header={
        <CollapsibleHeader isOpen={show} onClick={e => { e.preventDefault(); setShow(!show) }}>
          <Label>{label}</Label>
        </CollapsibleHeader>
      }
    >
      <div className="p-4">
        {children}
      </div>
    </Collapsible>
  )
}
