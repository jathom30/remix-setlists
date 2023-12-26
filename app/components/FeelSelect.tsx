import { Feel } from "@prisma/client";
import { useFetcher, useParams } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/server-runtime";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";

import { FeelSelectAction } from "~/routes/$bandId.resources.FeelSelect";
import { getColor } from "~/utils/tailwindColors";

export function FeelSelect({
  feels,
  defaultFeels,
}: {
  feels: SerializeFrom<Feel>[];
  defaultFeels?: SerializeFrom<Feel>[];
}) {
  const fetcher = useFetcher<FeelSelectAction>();
  const newFeel = fetcher.data?.newFeel;

  const { bandId } = useParams();
  const [selectedFeels, setSelectedFeels] = useState(defaultFeels || []);

  // ! this feels wrong. Seems like there should be a way to grab the data inside handleCreateFeel
  useEffect(() => {
    if (!newFeel) {
      return;
    }
    // if newFeel is in prevFeels return
    setSelectedFeels((prevFeels) => {
      if (prevFeels.some((feel) => feel.id === newFeel.id)) {
        return prevFeels;
      }
      return [...prevFeels, newFeel];
    });
  }, [newFeel]);

  const base100 = getColor("base-100");
  const base200 = getColor("base-200");
  const base300 = getColor("base-300");
  const baseContent = getColor("base-content");
  const error = getColor("error");
  const errorContent = getColor("error-content");
  const border = getColor("base-content", 0.2);

  const handleCreateFeel = (newFeel: string) => {
    fetcher.submit(
      { newFeel },
      { method: "post", action: `${bandId}/resources/FeelSelect` },
    );
  };
  return (
    <CreatableSelect
      value={selectedFeels}
      onChange={(newFeels) => setSelectedFeels(Array.from(newFeels))}
      name="feels"
      isMulti
      instanceId="feels"
      options={feels}
      onCreateOption={handleCreateFeel}
      getOptionLabel={(feel) => feel.label}
      getOptionValue={(feel) => feel.id}
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
        groupHeading: (baseStyles) => ({ ...baseStyles, color: baseContent }),
        loadingIndicator: (baseStyles) => ({
          ...baseStyles,
          color: baseContent,
        }),
        loadingMessage: (baseStyles) => ({ ...baseStyles, color: baseContent }),
        menuList: (baseStyles) => ({ ...baseStyles, color: baseContent }),
        menuPortal: (baseStyles) => ({ ...baseStyles, color: baseContent }),
        placeholder: (baseStyles) => ({ ...baseStyles, color: baseContent }),
        singleValue: (baseStyles) => ({ ...baseStyles, color: baseContent }),
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
        dropdownIndicator: (baseStyles) => ({ ...baseStyles, color: border }),
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
  );
};