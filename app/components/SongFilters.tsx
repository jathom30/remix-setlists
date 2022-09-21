import { useState } from "react";
import type { ReactNode } from "react";
import { Button, Collapsible, CollapsibleHeader, FlexList, Label, MaxHeightContainer, TempoIcons } from "~/components";



export function SongFilters() {
  return (
    <MaxHeightContainer
      header={
        <div className="border-b border-slate-300">
          <FlexList pad={2} direction="row" justify="between" items="center">
            <span className="font-bold">Filters</span>
            <Button type="button" kind="secondary">Clear all</Button>
          </FlexList>
        </div>
      }
    >
      <FlexList gap={0}>
        <FilterOption label="Tempo">
          <FlexList pad={4} gap={2}>
            {Array.from({ length: 5 }, (_, i) => (
              <TempoIcons key={i} tempo={i + 1} />
            ))}
          </FlexList>
        </FilterOption>
        <FilterOption label="Feels">
          a list of feels
        </FilterOption>
        <FilterOption label="Cover">
          <FlexList pad={4} gap={2}>
            <span>Covers</span>
            <span>Originals</span>
          </FlexList>
        </FilterOption>
        <FilterOption label="Positions">
          <FlexList gap={2} pad={4}>
            <span>Opener</span>
            <span>Closer</span>
            <span>Other</span>
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
      {children}
    </Collapsible>
  )
}
