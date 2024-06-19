import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Feel } from "@prisma/client";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { Jsonify } from "@remix-run/server-runtime/dist/jsonify";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FlexList } from "~/components";
import { H1, Muted } from "~/components/typography";
import { getBandWithFeels } from "~/models/band.server";
import { createSongWithFeels } from "~/models/song.server";
import { requireNonSubMember } from "~/session.server";
import { keyLetters } from "~/utils/songConstants";

export const meta: MetaFunction = () => [
  {
    title: "New song",
  },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  const band = await getBandWithFeels(bandId);
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  return json({ band });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: CreateSongSchema });
  console.log(submission);
  if (submission.status !== "success") {
    return submission.reply();
  }
  const song = await createSongWithFeels(bandId, {
    ...submission.value,
    author: submission.value.author || null,
    note: submission.value.note || null,
  });

  return redirect(`/${bandId}/songs/${song.id}`);
}

const CreateSongSchema = z.object({
  name: z.string().min(1),
  length: z.coerce.number().min(1).default(3),
  keyLetter: z.string().min(1).max(2).default("C"),
  isMinor: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean()),
  tempo: z.coerce.number().min(1).max(320).default(120),
  feels: z.array(z.string()),
  author: z.string().nullish(),
  note: z.string().nullish(),
  links: z.array(
    z
      .string()
      .refine(
        (value) =>
          /^(https?):\/\/(?=.*\.[a-z]{2,})[^\s$.?#].[^\s]*$/i.test(value),
        {
          message: "Please enter a valid URL",
        },
      ),
  ),
  position: z.enum(["opener", "closer", "other"]).default("other"),
  rank: z.enum(["exclude", "no_preference"]).default("no_preference"),
  isCover: z.boolean().default(false),
});

export default function CreateSongRoute() {
  const lastResult = useActionData<typeof action>();
  const {
    band: { feels, name },
  } = useLoaderData<typeof loader>();

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreateSongSchema });
    },
    defaultValue: {
      name: "",
      length: 3,
      keyLetter: "C",
      isMinor: "false",
      tempo: 120,
      feels: [],
      author: name,
      note: "",
      links: [],
      position: "other",
      rank: "no_preference",
      isCover: false,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  const tempoControl = useInputControl(fields.tempo);
  const feelControl = useInputControl(fields.feels);
  const links = fields.links.getFieldList();

  return (
    <div className="p-2 space-y-2">
      <H1>Create Song</H1>
      <Form
        method="post"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <div className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>
                Add basic details to your song that make it easy to identify
                throughout the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label htmlFor={fields.name.id}>Name</Label>
                <Input
                  placeholder="Name"
                  {...getInputProps(fields.name, { type: "text" })}
                />
                <div
                  id={fields.name.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.name.errors}
                </div>
              </div>
              <div>
                <Label htmlFor={fields.length.id}>Length (in minutes)</Label>
                <Input
                  placeholder="Length"
                  {...getInputProps(fields.length, { type: "number" })}
                />
                <div
                  id={fields.length.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.length.errors}
                </div>
              </div>
              <div>
                <Label>Key</Label>
                <FlexList direction="row" gap={2}>
                  <Select
                    name={fields.keyLetter.name}
                    defaultValue={fields.keyLetter.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {keyLetters.map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Select
                    name={fields.isMinor.name}
                    defaultValue={fields.isMinor.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Minor or Major" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="false">Major</SelectItem>
                        <SelectItem value="true">Minor</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FlexList>
              </div>
              <FlexList gap={2}>
                <Label>Tempo</Label>
                <Input
                  placeholder="Tempo"
                  type="number"
                  value={tempoControl.value}
                  onChange={(e) => tempoControl.change(e.target.value)}
                  onFocus={tempoControl.focus}
                  onBlur={tempoControl.blur}
                  max={320}
                  min={1}
                  step={1}
                />
                <Slider
                  name={fields.tempo.name}
                  value={[Number(tempoControl.value)]}
                  onValueChange={(val) => {
                    tempoControl.change(String(val[0]));
                  }}
                  onFocus={tempoControl.focus}
                  onBlur={tempoControl.blur}
                  min={1}
                  max={320}
                  step={1}
                />
                <div
                  id={fields.tempo.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.tempo.errors}
                </div>
              </FlexList>
              <FlexList gap={2}>
                <Label>Feels</Label>
                <MultiSelectFeel
                  feels={feels}
                  values={
                    Array.isArray(feelControl.value) ? feelControl.value : []
                  }
                  onChange={(val) => feelControl.change(val)}
                />
                <div
                  id={fields.feels.errorId}
                  className="text-sm text-destructive"
                >
                  {fields.feels.errors}
                </div>
              </FlexList>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Additional Details</CardTitle>
              <CardDescription>
                Adding additional details to your song will provide context to
                your bandmates, but these fields are optional if you want to
                skip this section for now.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlexList gap={2}>
                <div>
                  <Label>Artist</Label>
                  <Input
                    placeholder="Artist"
                    {...getInputProps(fields.author, { type: "text" })}
                  />
                  <div className="text-sm text-destructive">
                    {fields.author.errors}
                  </div>
                </div>
                <div>
                  <Label>Lyrics/Notes</Label>
                  <Textarea
                    placeholder="Add lyrics and/or notes here..."
                    {...getInputProps(fields.note, { type: "text" })}
                  />
                  <div className="text-sm text-destructive">
                    {fields.note.errors}
                  </div>
                </div>
                <div>
                  <Label>External Links</Label>
                  <FlexList gap={2}>
                    {links.map((link, index) => (
                      <div key={link.id}>
                        <FlexList direction="row" gap={2}>
                          <Input
                            placeholder="Link"
                            {...getInputProps(link, { type: "text" })}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            {...form.remove.getButtonProps({
                              name: fields.links.name,
                              index,
                            })}
                          >
                            Remove
                          </Button>
                        </FlexList>
                        <div className="text-sm text-destructive">
                          {link.errors}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      {...form.insert.getButtonProps({
                        name: fields.links.name,
                      })}
                    >
                      Add Link
                    </Button>
                  </FlexList>
                </div>
              </FlexList>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Setlist Creation Settings</CardTitle>
              <CardDescription>
                These settings will be used when you create setlists using our
                "auto-magic" feature.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FlexList>
                <FlexList gap={2}>
                  <Label htmlFor={fields.position.name}>Position</Label>
                  <RadioGroup
                    defaultValue={fields.position.value}
                    name={fields.position.name}
                  >
                    <FlexList direction="row">
                      <FlexList direction="row" gap={2}>
                        <RadioGroupItem id="opener" value="opener" />
                        <Label htmlFor="opener">Opener</Label>
                      </FlexList>
                      <FlexList direction="row" gap={2}>
                        <RadioGroupItem id="closer" value="closer" />
                        <Label htmlFor="closer">Closer</Label>
                      </FlexList>
                      <FlexList direction="row" gap={2}>
                        <RadioGroupItem id="other" value="other" />
                        <Label htmlFor="other">Other</Label>
                      </FlexList>
                    </FlexList>
                  </RadioGroup>
                  <Muted>
                    Adding a position will help place the song during auto-magic
                    setlist creation.
                  </Muted>
                </FlexList>
                <FlexList gap={2}>
                  <Label>Setlist auto-generation importance</Label>
                  <RadioGroup
                    defaultValue={fields.rank.value}
                    name={fields.rank.name}
                  >
                    <FlexList direction="row">
                      <FlexList direction="row" gap={2}>
                        <RadioGroupItem id="exclude" value="exclude" />
                        <Label htmlFor="exclude">Always Exclude</Label>
                      </FlexList>
                      <FlexList direction="row" gap={2}>
                        <RadioGroupItem
                          id="no_preference"
                          value="no_preference"
                        />
                        <Label htmlFor="no_preference">No preference</Label>
                      </FlexList>
                    </FlexList>
                  </RadioGroup>
                  <Muted>
                    This setting will help determine how often this song is
                    included in auto-magic setlists.
                  </Muted>
                </FlexList>
              </FlexList>
            </CardContent>
          </Card>
          <Button type="submit">Create Song</Button>
        </div>
      </Form>
    </div>
  );
}

const MultiSelectFeel = ({
  feels,
  values,
  onChange,
}: {
  feels: Jsonify<Feel>[];
  values: string[];
  onChange: (value: string[]) => void;
}) => {
  const [query, setQuery] = useState("");

  const displayValue = values.length
    ? values
        .map((val) => feels.find((feel) => feel.id === val)?.label)
        .join(", ")
    : "Select feel...";

  const filteredFeels = feels.filter((feel) =>
    feel.label.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={`justify-between font-normal ${
            values.length ? "" : "text-muted-foreground"
          }`}
        >
          {displayValue}
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-2 h-3 w-3 shrink-0 opacity-50"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search feels..."
            className=" focus-visible:ring-inset focus-visible:ring-0"
          />
          <CommandList>
            <CommandEmpty>No feels found.</CommandEmpty>
            <CommandGroup>
              {filteredFeels.map((feel) => (
                <CommandItem
                  key={feel.id}
                  value={feel.id}
                  onSelect={(currentValue) => {
                    const newValues = values.includes(currentValue)
                      ? values.filter((val) => val !== currentValue)
                      : [...values, currentValue];
                    onChange(newValues);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faCheck}
                    className={cn(
                      "mr-2 h-4 w-4",
                      values.includes(feel.id) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {feel.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
