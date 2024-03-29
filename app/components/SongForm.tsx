import {
  faBolt,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Feel, Link, Song } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import Select from "react-select";

import type { handleSongFormData } from "~/models/song.server";
import { FeelSelect } from "~/routes/$bandId.resources.FeelSelect";
import { useMatchesData } from "~/utils";
import { positionEnums, setlistAutoGenImportanceEnums } from "~/utils/enums";
import { keyLetters, majorMinorOptions } from "~/utils/songConstants";
import { getColor } from "~/utils/tailwindColors";

import { Badge } from "./Badge";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { Divider } from "./Divider";
import { ErrorMessage } from "./ErrorMessage";
import { ExternalLinksInputs } from "./ExternalLinksInputs";
import { Field } from "./Field";
import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList";
import { Input } from "./Input";
import { Label } from "./Label";
import { Modal } from "./Modal";
import { Navbar } from "./Navbar";
import { RadioGroup } from "./RadioGroup";
import { getTempoColor } from "./TempoIcons";
import { Title } from "./Title";

const getRangeColor = (tempo: number) => {
  switch (tempo) {
    case 1:
      return "range-info";
    case 2:
      return "range-accent";
    case 3:
      return "range-success";
    case 4:
      return "range-warning";
    case 5:
      return "range-error";
    default:
      return "range-base-content";
  }
};

export const SongForm = ({
  song,
  feels,
  errors,
}: {
  song?: Partial<SerializeFrom<Song & { feels: Feel[]; links: Link[] }>>;
  feels: SerializeFrom<Feel>[];
  errors?: SerializeFrom<ReturnType<typeof handleSongFormData>["errors"]>;
}) => {
  const [showpositionInfo, setShowPositionInfo] = useState(false);
  const [showAutoGenInfo, setShowAutoGenInfo] = useState(false);
  const [showLinksInfo, setShowLinksInfo] = useState(false);
  const [isWindow, setIsWindow] = useState(false);
  const [tempoColorClass, setTempoColorClass] = useState(
    getRangeColor(song?.tempo || 3),
  );
  const [author, setAuthor] = useState(song?.author || "");
  const { band } = useMatchesData("routes/$bandId") as {
    band: { name: string };
  };
  const [isAuthorDisabled, setIsAuthorDisabled] = useState(
    song?.author === band.name,
  );

  // Select's portal needs window in this component. Without this check, page crashes on reload
  useEffect(() => {
    setIsWindow(true);
  }, []);

  if (!isWindow) {
    return null;
  }

  const handleTempoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setTempoColorClass(getRangeColor(parseInt(value)));
  };
  const handleOriginalPieceChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setIsAuthorDisabled(checked);
    if (checked) {
      setAuthor(band.name);
    }
  };

  const base100 = getColor("base-100");
  const base200 = getColor("base-200");
  const baseContent = getColor("base-content");
  const border = getColor("base-content", 0.2);

  return (
    <FlexList pad={4}>
      <Field name="name" label="Name" isRequired>
        <Input
          name="name"
          defaultValue={song?.name}
          placeholder="Song name..."
        />
        {errors?.name ? <ErrorMessage message={errors.name} /> : null}
      </Field>
      <Field name="length" label="Length (in minutes)" isRequired>
        <Input
          name="length"
          defaultValue={song?.length}
          type="number"
          placeholder="Song length..."
        />
        {errors?.length ? <ErrorMessage message={errors.length} /> : null}
      </Field>

      <FlexList gap={2}>
        <Label>Key</Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            instanceId="keyLetter"
            defaultValue={{
              value: song?.keyLetter ?? "C",
              label: song?.keyLetter ?? "C",
            }}
            name="keyLetter"
            options={keyLetters.map((letter) => ({
              value: letter,
              label: letter,
            }))}
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
              menuList: (baseStyles) => ({ ...baseStyles, color: baseContent }),
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
                color: baseContent,
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: baseContent,
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: baseContent,
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
          <Select
            instanceId="isMinor"
            defaultValue={{
              label: song?.isMinor ? "Minor" : "Major",
              value: song?.isMinor,
            }}
            name="isMinor"
            options={majorMinorOptions}
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
              menuList: (baseStyles) => ({ ...baseStyles, color: baseContent }),
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
                color: baseContent,
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: baseContent,
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: baseContent,
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
        </div>
      </FlexList>

      <Field name="tempo" label="Tempo" isRequired>
        <input
          defaultValue={song?.tempo}
          onChange={handleTempoChange}
          className={`range ${tempoColorClass}`}
          type="range"
          min={1}
          max={5}
          name="tempo"
        />
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
            onChange={(e) => setAuthor(e.target.value)}
            value={author}
          />
        </Field>
        <Checkbox
          name="isOriginal"
          onChange={handleOriginalPieceChange}
          label="Original piece"
          checked={isAuthorDisabled}
        />
        <input type="hidden" hidden name="author" value={author || undefined} />
      </FlexList>

      <FlexList gap={2}>
        <Label>Notes/Lyrics</Label>
        <textarea
          placeholder="Add a note or some lyrics..."
          className="textarea textarea-bordered"
          name="note"
          id="note"
          rows={5}
          defaultValue={song?.note || ""}
        />
      </FlexList>

      <FlexList gap={0}>
        <FlexList direction="row" items="center" gap={2}>
          <Label>External links</Label>
          <Button
            type="button"
            kind="ghost"
            size="xs"
            isRounded
            onClick={() => setShowLinksInfo(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </FlexList>
        <ExternalLinksInputs links={song?.links} errors={errors?.links} />
      </FlexList>

      <FlexList gap={2}>
        <FlexList direction="row" items="center" gap={2}>
          <Label>Position</Label>
          <Button
            type="button"
            kind="ghost"
            size="xs"
            isRounded
            onClick={() => setShowPositionInfo(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </FlexList>
        <RadioGroup
          name="position"
          options={[
            { label: positionEnums.opener, value: "opener" },
            { label: positionEnums.closer, value: "closer" },
            { label: positionEnums.other, value: "other" },
          ]}
          isChecked={(val) => song?.position === val}
        />
      </FlexList>

      <FlexList gap={2}>
        <FlexList direction="row" items="center" gap={2}>
          <Label>Setlist auto-generation importance</Label>
          <Button
            type="button"
            kind="ghost"
            size="xs"
            isRounded
            onClick={() => setShowAutoGenInfo(true)}
          >
            <FontAwesomeIcon icon={faInfoCircle} />
          </Button>
        </FlexList>
        <RadioGroup
          name="rank"
          options={[
            { label: setlistAutoGenImportanceEnums.exclude, value: "exclude" },
            // { label: setlistAutoGenImportanceEnums.include, value: 'include' },
            {
              label: setlistAutoGenImportanceEnums.no_preference,
              value: "no_preference",
            },
          ]}
          isChecked={(val) => song?.rank === val}
        />
      </FlexList>

      <Modal
        open={showpositionInfo}
        onClose={() => setShowPositionInfo(false)}
        isPortal
      >
        <Navbar>
          <FlexHeader>
            <Title>Song position</Title>
            <Button
              kind="ghost"
              isRounded
              onClick={() => setShowPositionInfo(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </FlexHeader>
        </Navbar>
        <FlexList pad={4} gap={0}>
          <p>
            A song's position helps us determine where it should be placed
            during our "auto-magical" setlist creation.
          </p>
          <p>
            We prioritize openers and closers to be placed at the beginner and
            end of sets as seen in the example below.
          </p>
          <Divider />
          <Label>Example setlist:</Label>
          <FlexList items="center">
            <FlexHeader>
              <Title>My Sample Setlist</Title>
            </FlexHeader>
            <div className="bg-base-300 w-full h-12 rounded">
              <FlexList direction="row" items="center" gap={4} pad={2}>
                <Title>Strong opener</Title>
                <Badge>Opener</Badge>
              </FlexList>
            </div>
            <div className="bg-base-300 w-full h-12 rounded">
              <FlexList direction="row" items="center" gap={4} pad={2}>
                <Title>Mid-set song</Title>
              </FlexList>
            </div>
            <div className="bg-base-300 w-full h-12 rounded">
              <FlexList direction="row" items="center" gap={4} pad={2}>
                <Title>The ballad</Title>
              </FlexList>
            </div>
            <div className="bg-base-300 w-full h-12 rounded">
              <FlexList direction="row" items="center" gap={4} pad={2}>
                <Title>Closing song</Title>
                <Badge>Closer</Badge>
              </FlexList>
            </div>
          </FlexList>
        </FlexList>
      </Modal>

      <Modal
        open={showAutoGenInfo}
        onClose={() => setShowAutoGenInfo(false)}
        isPortal
      >
        <Navbar>
          <FlexHeader>
            <Title>Setlist auto-generation importance</Title>
            <Button
              kind="ghost"
              isRounded
              onClick={() => setShowAutoGenInfo(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </FlexHeader>
        </Navbar>
        <FlexList pad={4}>
          <p>
            When attempting to auto-magically generate a setlist for you, we
            take many variables into concideration.
          </p>
          <p>
            It is possible that certain songs should never be included in our
            auto-magical generation, perhaps your band is still fine tuning the
            bridge for example. In this case we don't want it accidentally
            slipping into sets and scaring the singer.
          </p>
        </FlexList>
      </Modal>

      <Modal
        open={showLinksInfo}
        onClose={() => setShowLinksInfo(false)}
        isPortal
      >
        <Navbar>
          <FlexHeader>
            <Title>External links</Title>
            <Button
              kind="ghost"
              isRounded
              onClick={() => setShowLinksInfo(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </FlexHeader>
        </Navbar>
        <FlexList pad={4}>
          <p>
            External links might be used for quick linking to lyrics, chord
            changes, wiki articles, etc.
          </p>
        </FlexList>
      </Modal>
    </FlexList>
  );
};
