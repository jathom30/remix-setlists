import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Feel } from "@prisma/client";
import { json } from "@remix-run/node"
import { useFetcher, useLoaderData, useLocation, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import type { ReactNode } from "react";
import { useState } from "react";
import Select from "react-select";
import invariant from "tiny-invariant";
import { Button, Checkbox, Collapsible, CollapsibleHeader, FlexList, Label, Link, MaxHeightContainer, RadioGroup, TempoIcons } from "~/components";
import { getFeels } from "~/models/feel.server";
import { requireUserId } from "~/session.server";
import { capitalizeFirstLetter } from "~/utils/assorted";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request)
  const { bandId } = params
  invariant(bandId, 'bandId not found')

  const feels = await getFeels(bandId)

  return json({ feels })
}

const positions = ['opener', 'closer', 'other'] as const

export default function SongsFilters() {
  const fetcher = useFetcher()
  const { feels } = useLoaderData<typeof loader>()
  const { search } = useLocation()
  const submit = useSubmit()
  const [params] = useSearchParams()
  const { bandId } = useParams()
  const feelParams = params?.getAll('feels').reduce((allFeels: SerializeFrom<Feel>[], feelId) => {
    const foundFeel = feels.find(feel => feel.id === feelId)
    if (foundFeel?.id) {
      return [
        ...allFeels, foundFeel
      ]
    }
    return allFeels
  }, [])

  return (
    <fetcher.Form method="put" action={`/resource/songFilters?${params}`}>
      <MaxHeightContainer
        header={
          <div className="border-b border-slate-300 bg-white">
            <FlexList pad={2} direction="row" justify="between" items="center">
              <Link kind="ghost" to={{ pathname: `/${bandId}/songs`, search }}><FontAwesomeIcon icon={faChevronLeft} /></Link>
              <span className="font-bold">Filters</span>
              <Button name="intent" value="reset" type="button" isOutline onClick={e => submit(e.currentTarget)}>Reset</Button>
            </FlexList>
          </div>
        }
        footer={
          <div className="border-t bg-white p-4 flex flex-col">
            <Button type="submit" kind="primary">Apply</Button>
          </div>
        }
      >
        <FlexList gap={0}>
          <FilterOption label="Tempo">
            <FlexList gap={0}>
              {Array.from({ length: 5 }, (_, i) => (
                <Checkbox
                  key={i}
                  defaultChecked={params?.getAll('tempos').some(t => t === (i + 1).toString())}
                  name="tempos"
                  value={(i + 1).toString()}
                  label={<TempoIcons tempo={i + 1} />}
                />
              ))}
            </FlexList>
          </FilterOption>
          <FilterOption label="Feels">
            <Select
              defaultValue={feelParams}
              isMulti
              name="feels"
              options={feels}
              getOptionValue={feel => feel.id}
              getOptionLabel={feel => feel.label}
            />
          </FilterOption>
          <FilterOption label="Artist">
            <FlexList gap={2}>
              <RadioGroup
                name="isCover"
                options={[
                  { label: 'Covers only', value: 'true' },
                  { label: 'Originals only', value: 'false' },
                  { label: 'No Preference', value: ' ' },
                ]}
                isChecked={(val) => {
                  const isCover = params.get('isChecked')
                  return val === (isCover ?? ' ')
                }}
              />
            </FlexList>
          </FilterOption>
          <FilterOption label="Positions">
            <FlexList gap={0}>
              {positions.map(position => (
                <Checkbox
                  key={position}
                  value={position}
                  defaultChecked={params?.getAll('positions').some(p => p === position)}
                  name="positions"
                  label={`${capitalizeFirstLetter(position)}s`}
                />
              ))}
            </FlexList>
          </FilterOption>
        </FlexList>
      </MaxHeightContainer>
      <input hidden type="hidden" name="redirectTo" value={`/${bandId}/setlist/new/manual`} />
    </fetcher.Form>
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