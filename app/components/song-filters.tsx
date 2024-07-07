import { Feel } from "@prisma/client";
import { useSearchParams } from "@remix-run/react";
import { SerializeFrom } from "@remix-run/server-runtime";
import { Filter } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSlider } from "@/components/ui/multi-slider";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { FlexList } from "./FlexList";
import { MultiSelectFeel } from "./multi-select-feel";
import { Small } from "./typography";

const TempoSchema = z.object({
  min: z.number(),
  max: z.number(),
});
const PositionSchema = z.array(
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

export const SongFilters = ({
  feelOptions,
}: {
  feelOptions: SerializeFrom<Feel>[];
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tempoParam = getTempo(searchParams.get("tempo"));
  const positionParam = getPosition(searchParams.get("position"));
  const feelsParam = getFeels(searchParams.get("feels"));
  const artistParam = searchParams.get("artist") || "";
  const [tempo, setTempo] = useState(tempoParam);
  const [position, setPosition] =
    useState<z.infer<typeof PositionSchema>>(positionParam);
  const [feels, setFeels] = useState<string[]>(feelsParam);
  const [artist, setArtist] = useState(artistParam);

  const hasFilters =
    tempoParam.min !== 0 ||
    tempoParam.max !== 420 ||
    positionParam.length ||
    feelsParam.length ||
    artistParam;

  const onClear = () => {
    setTempo(defaultTempo);
    setPosition([]);
    setFeels([]);
    setArtist("");
    setSearchParams({});
  };

  const onSubmit = () => {
    setSearchParams((prev) => {
      prev.set("tempo", JSON.stringify(tempo));
      prev.set("position", JSON.stringify(position));
      prev.set("feels", JSON.stringify(feels));
      prev.set("artist", artist);
      return prev;
    });
  };

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
                  onValueChange={(values) => {
                    setTempo({ min: values[0], max: values[1] });
                  }}
                />
                <Small className="text-muted-foreground">{tempo.max}</Small>
              </FlexList>
            </FlexList>
            <FlexList gap={1}>
              <Label>Position</Label>
              <FlexList gap={4} direction="row">
                {positions.map((p) => (
                  <FlexList
                    key={p.value}
                    direction="row"
                    gap={1}
                    items="center"
                  >
                    <Checkbox
                      checked={position.includes(
                        p.value as z.infer<typeof PositionSchema>[number],
                      )}
                      id={p.value}
                      value={p.value}
                      onCheckedChange={(checked) => {
                        setPosition((prev) => {
                          const typedVal = p.value as z.infer<
                            typeof PositionSchema
                          >[number];
                          if (checked) {
                            return [...prev, typedVal];
                          }
                          return prev.filter((pos) => pos !== typedVal);
                        });
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
                onChange={setFeels}
              />
            </FlexList>
            <div>
              <Label>Artist</Label>
              <Input
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name..."
              />
            </div>
          </FlexList>
          <SheetFooter className="pt-4">
            <Button variant="secondary" onClick={onClear}>
              Clear
            </Button>
            <Button onClick={onSubmit}>Submit</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};
