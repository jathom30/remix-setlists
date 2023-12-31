import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Feel } from "@prisma/client";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node";
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import type { ReactNode } from "react";
import { useState } from "react";
import Select from "react-select";
import invariant from "tiny-invariant";

import {
  Button,
  Checkbox,
  Collapsible,
  CollapsibleHeader,
  FlexHeader,
  FlexList,
  Label,
  Link,
  MaxHeightContainer,
  Navbar,
  RadioGroup,
  TempoIcons,
} from "~/components";
import { getFeels } from "~/models/feel.server";
import { requireUserId } from "~/session.server";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { getColor } from "~/utils/tailwindColors";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId not found");

  const feels = await getFeels(bandId);

  return json({ feels });
}

const positions = ["opener", "closer", "other"] as const;

export default function SongsFilters() {
  const fetcher = useFetcher();
  const { feels } = useLoaderData<typeof loader>();
  const { search } = useLocation();
  const submit = useSubmit();
  const [params] = useSearchParams();
  const { bandId } = useParams();
  const feelParams = params
    ?.getAll("feels")
    .reduce((allFeels: SerializeFrom<Feel>[], feelId) => {
      const foundFeel = feels.find((feel) => feel.id === feelId);
      if (foundFeel?.id) {
        return [...allFeels, foundFeel];
      }
      return allFeels;
    }, []);

  const base100 = getColor("base-100");
  const base200 = getColor("base-200");
  const base300 = getColor("base-300");
  const baseContent = getColor("base-content");
  const error = getColor("error");
  const errorContent = getColor("error-content");
  const border = getColor("base-content", 0.2);

  return (
    <fetcher.Form method="put" action={`/resource/songFilters?${params}`}>
      <MaxHeightContainer
        header={
          <Navbar>
            <FlexHeader>
              <FlexList
                pad={2}
                direction="row"
                justify="between"
                items="center"
              >
                <Link
                  kind="ghost"
                  to={{ pathname: `/${bandId}/songs`, search }}
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Link>
                <span className="font-bold">Filters</span>
              </FlexList>
              <Button
                name="intent"
                value="reset"
                type="button"
                isOutline
                onClick={(e) => submit(e.currentTarget)}
              >
                Reset
              </Button>
            </FlexHeader>
          </Navbar>
        }
        footer={
          <div className="bg-base-200 p-4 flex flex-col">
            <Button type="submit" kind="primary">
              Apply
            </Button>
          </div>
        }
      >
        <FlexList gap={0}>
          <FilterOption label="Tempo">
            <FlexList gap={0}>
              {Array.from({ length: 5 }, (_, i) => (
                <Checkbox
                  key={i}
                  defaultChecked={params
                    ?.getAll("tempos")
                    .some((t) => t === (i + 1).toString())}
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
              getOptionValue={(feel) => feel.id}
              getOptionLabel={(feel) => feel.label}
              styles={{
                control: (baseStyles, { isFocused }) => ({
                  ...baseStyles,
                  backgroundColor: base100,
                  text: baseContent,
                  borderColor: border,
                  ...(isFocused
                    ? {
                        outline: 2,
                        outlineStyle: "solid",
                        outlineColor: border,
                        outlineOffset: 2,
                      }
                    : null),
                  "&:hover": {
                    borderColor: baseContent,
                  },
                }),
                group: (baseStyles) => ({ ...baseStyles, color: baseContent }),
                groupHeading: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                loadingIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                loadingMessage: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                menuList: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                menuPortal: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                placeholder: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                singleValue: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                multiValue: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: base300,
                }),
                multiValueLabel: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                }),
                multiValueRemove: (baseStyles) => ({
                  ...baseStyles,
                  color: baseContent,
                  backgroundColor: base200,
                  "&:hover": { background: error, color: errorContent },
                }),
                input: (baseStyles) => ({ ...baseStyles, color: baseContent }),
                dropdownIndicator: (baseStyles) => ({
                  ...baseStyles,
                  color: border,
                }),
                indicatorSeparator: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: border,
                }),
                noOptionsMessage: (baseStyles) => ({ ...baseStyles }),
                menu: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: base100,
                  color: baseContent,
                }),
                option: (baseStyles) => ({
                  ...baseStyles,
                  backgroundColor: base100,
                  color: baseContent,
                  "&:hover": { backgroundColor: base200 },
                }),
              }}
            />
          </FilterOption>
          <FilterOption label="Artist">
            <FlexList gap={2}>
              <RadioGroup
                name="isCover"
                options={[
                  { label: "Covers only", value: "true" },
                  { label: "Originals only", value: "false" },
                  { label: "No Preference", value: " " },
                ]}
                isChecked={(val) => {
                  const isCover = params.get("isCover");
                  return val === (isCover ?? " ");
                }}
              />
            </FlexList>
          </FilterOption>
          <FilterOption label="Positions">
            <FlexList gap={0}>
              {positions.map((position) => (
                <Checkbox
                  key={position}
                  value={position}
                  defaultChecked={params
                    ?.getAll("positions")
                    .some((p) => p === position)}
                  name="positions"
                  label={`${capitalizeFirstLetter(position)}s`}
                />
              ))}
            </FlexList>
          </FilterOption>
        </FlexList>
      </MaxHeightContainer>
      <input
        hidden
        type="hidden"
        name="redirectTo"
        value={`/${bandId}/songs`}
      />
    </fetcher.Form>
  );
}

const FilterOption = ({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) => {
  const [show, setShow] = useState(true);
  return (
    <Collapsible
      isOpen={show}
      isBordered
      header={
        <CollapsibleHeader
          isOpen={show}
          onClick={(e) => {
            e.preventDefault();
            setShow(!show);
          }}
        >
          <Label>{label}</Label>
        </CollapsibleHeader>
      }
    >
      <div className="p-4">{children}</div>
    </Collapsible>
  );
};
