import { useSearchParams } from "react-router";
import { Filter } from "lucide-react";
import { ReactNode, useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSlider } from "@/components/ui/multi-slider";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TFeel } from "~/routes/$bandId.songs._index";

import { FlexList } from "./FlexList";
import { MultiSelectFeel } from "./multi-select-feel";
import { Small } from "./typography";

const TempoSchema = z.object({
  min: z.number(),
  max: z.number(),
});
export const PositionSchema = z.array(
  z.union([z.literal("opener"), z.literal("closer"), z.literal("other")]),
);
const FeelsSchema = z.array(z.string());

const defaultTempo = { min: 0, max: 420 };
export const getTempo = (tempo: string | null) => {
  if (!tempo) {
    return defaultTempo;
  }
  const parsed = TempoSchema.safeParse(JSON.parse(tempo));
  if (!parsed.success) {
    return defaultTempo;
  }
  return parsed.data;
};
export const getPosition = (position: string | null) => {
  if (!position) {
    return [];
  }
  const parsed = PositionSchema.safeParse(JSON.parse(position));
  if (!parsed.success) {
    return [];
  }
  return parsed.data;
};
export const getFeels = (feels: string | null) => {
  if (!feels) {
    return [];
  }
  const parsed = FeelsSchema.safeParse(JSON.parse(feels));
  if (!parsed.success) {
    return [];
  }
  return parsed.data;
};

const positions = [
  {
    label: "Opener",
    value: "opener",
  },
  {
    label: "Closer",
    value: "closer",
  },
  {
    label: "Other",
    value: "other",
  },
];

export const useSongFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tempoParam = getTempo(searchParams.get("tempo"));
  const positionParam = getPosition(searchParams.get("position"));
  const feelsParam = getFeels(searchParams.get("feels"));
  const artistParam = searchParams.get("artist") || "";

  const [tempo, setTempo] = useState(tempoParam);
  const [position, setPosition] =
    useState<z.infer<typeof PositionSchema>>(positionParam);
  const [selectedFeels, setSelectedFeels] = useState<string[]>(feelsParam);
  const [artist, setArtist] = useState(artistParam);

  const hasFilters =
    tempoParam.min !== 0 ||
    tempoParam.max !== 420 ||
    positionParam.length ||
    feelsParam.length ||
    artistParam;

  const onClear = () => {
    setSearchParams({});
    setTempo(defaultTempo);
    setPosition([]);
    setSelectedFeels([]);
    setArtist("");
  };

  const onSubmit = () => {
    setSearchParams((prev) => {
      prev.set("tempo", JSON.stringify(tempo));
      prev.set("position", JSON.stringify(position));
      prev.set("feels", JSON.stringify(selectedFeels));
      prev.set("artist", artist);
      return prev;
    });
  };

  const onChange = (
    type: "tempo" | "position" | "feels" | "artist",
    value: unknown,
  ) => {
    switch (type) {
      case "tempo":
        setTempo(TempoSchema.parse(value));
        break;
      case "position":
        setPosition(PositionSchema.parse(value));
        break;
      case "feels":
        setSelectedFeels(FeelsSchema.parse(value));
        break;
      case "artist":
        setArtist(typeof value === "string" ? value : "");
        break;
    }
  };

  const submitOnChange = (
    type: "tempo" | "position" | "feels" | "artist",
    value: unknown,
  ) => {
    switch (type) {
      case "tempo":
        setTempo(TempoSchema.parse(value));
        setSearchParams((prev) => {
          prev.set("tempo", JSON.stringify(TempoSchema.parse(value)));
          return prev;
        });
        break;
      case "position":
        setPosition(PositionSchema.parse(value));
        setSearchParams((prev) => {
          prev.set("position", JSON.stringify(PositionSchema.parse(value)));
          return prev;
        });
        break;
      case "feels":
        setSelectedFeels(FeelsSchema.parse(value));
        setSearchParams((prev) => {
          prev.set("feels", JSON.stringify(FeelsSchema.parse(value)));
          return prev;
        });
        break;
      case "artist":
        setArtist(typeof value === "string" ? value : "");
        setSearchParams((prev) => {
          prev.set("artist", typeof value === "string" ? value : "");
          return prev;
        });
        break;
    }
  };

  return {
    filters: {
      tempo,
      position,
      selectedFeels,
      artist,
    },
    filterParams: {
      tempoParam,
      positionParam,
      feelsParam,
      artistParam,
    },
    hasFilters: Boolean(hasFilters),
    onClear,
    onSubmit,
    onChange,
    submitOnChange,
  };
};

export const SongFilters = ({
  children,
  onSubmit,
  onClear,
  hasFilters,
}: {
  children: ReactNode;
  onSubmit: () => void;
  onClear: () => void;
  hasFilters: boolean;
}) => {
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            title="Filters"
            variant="outline"
            size="icon"
            className="relative"
          >
            <Filter className="w-4 h-4" />
            {hasFilters ? (
              <div className="rounded-full bg-primary top-1 right-1 w-2 h-2 absolute" />
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Song Filters</SheetTitle>
          </SheetHeader>
          {children}
          <SheetFooter className="pt-4">
            <SheetClose asChild>
              <Button variant="secondary" onClick={onClear}>
                Clear
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button onClick={onSubmit}>Submit</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const SongFiltersBody = ({
  feelOptions,
  onChange,
  filters: { tempo, position, feels, artist },
}: {
  feelOptions: TFeel[];
  onChange: (
    type: "tempo" | "position" | "feels" | "artist",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => void;

  filters: {
    tempo: { min: number; max: number };
    position: z.infer<typeof PositionSchema>;
    feels: string[];
    artist: string;
  };
}) => {
  return (
    <FlexList gap={4}>
      <FlexList gap={2}>
        <Label>Tempo</Label>
        <FlexList direction="row" items="center">
          <Small className="text-muted-foreground">{tempo.min}</Small>
          <MultiSlider
            max={420}
            min={0}
            step={1}
            minStepsBetweenThumbs={10}
            value={[Number(tempo.min), Number(tempo.max)]}
            onValueChange={(values) =>
              onChange("tempo", {
                min: values[0],
                max: values[1],
              })
            }
          />
          <Small className="text-muted-foreground">{tempo.max}</Small>
        </FlexList>
      </FlexList>
      <FlexList gap={1}>
        <Label>Position</Label>
        <FlexList gap={4} direction="row">
          {positions.map((p) => (
            <FlexList key={p.value} direction="row" gap={1} items="center">
              <Checkbox
                checked={position.includes(
                  p.value as z.infer<typeof PositionSchema>[number],
                )}
                id={p.value}
                value={p.value}
                onCheckedChange={() => {
                  const typedValue = p.value as z.infer<
                    typeof PositionSchema
                  >[number];
                  const newPositions: z.infer<typeof PositionSchema> =
                    position.includes(typedValue)
                      ? position.filter((pos) => pos !== typedValue)
                      : [...position, typedValue];

                  onChange("position", newPositions);
                }}
              />
              <Label htmlFor={p.value}>{p.label}</Label>
            </FlexList>
          ))}
        </FlexList>
      </FlexList>
      <FlexList gap={1}>
        <Label>Feels</Label>
        <MultiSelectFeel
          feels={feelOptions}
          values={feels}
          onChange={(newFeels) => onChange("feels", newFeels)}
        />
      </FlexList>
      <div>
        <Label>Artist</Label>
        <Input
          value={artist}
          onChange={(e) => onChange("artist", e.target.value)}
          placeholder="Artist name..."
        />
      </div>
    </FlexList>
  );
};

SongFilters.Body = SongFiltersBody;
