import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
  json,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FlexList } from "~/components";
import { MultiSelectFeel } from "~/components/multi-select-feel";
import { H1, Muted } from "~/components/typography";
import { getBandWithFeels } from "~/models/band.server";
import {
  EditSongSchema,
  getSong,
  updateSongWithLinksAndFeels,
} from "~/models/song.server";
import { requireUser } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { keyLetters } from "~/utils/songConstants";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUser(request);
  const { bandId, songId } = params;
  invariant(bandId, "bandId is required");
  invariant(songId, "songId is required");

  const response = await getSong(songId, bandId);
  const band = await getBandWithFeels(bandId);
  const song = response?.song;
  const setlists = response?.setlists;
  if (!band) {
    throw new Response("Band not found", { status: 404 });
  }
  if (!song) {
    throw new Response("Song not found", { status: 404 });
  }
  return json({ song, setlists, band });
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `Edit ${data?.song.name || "Song"}` }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId, songId } = params;
  invariant(bandId, "bandId is required");
  invariant(songId, "songId is required");

  const searchParams = new URL(request.url).searchParams;
  const redirectTo = searchParams.get("redirectTo");

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: EditSongSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }
  const song = await updateSongWithLinksAndFeels(songId, submission.value);
  if (!song) {
    throw new Response("Song not found", { status: 404 });
  }
  emitter.emit(emitterKeys.songs);
  emitter.emit(emitterKeys.dashboard);
  return redirectWithToast(redirectTo ?? `/${bandId}/songs/${songId}`, {
    title: "Song updated!",
    description: "This song has been updated successfully.",
    type: "success",
  });
}

export default function EditSong() {
  const lastResult = useActionData<typeof action>();
  const {
    song,
    band: { feels },
  } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: EditSongSchema });
    },
    defaultValue: {
      name: song.name,
      length: song.length,
      keyLetter: song.keyLetter,
      isMinor: String(song.isMinor),
      tempo: song.tempo,
      feels: song.feels.map((f) => f.id),
      author: song.author,
      note: song.note,
      links: song.links.map((l) => l.href),
      position: song.position,
      rank: song.rank,
      isCover: song.isCover,
      showTempo: Boolean(song.tempo),
    },
  });
  const tempoControl = useInputControl(fields.tempo);
  const feelControl = useInputControl(fields.feels);
  const showTempo = useInputControl(fields.showTempo);
  const linksControl = useInputControl(fields.links);

  return (
    <div className="p-2 space-y-2">
      <H1>Edit Song</H1>
      <Form
        className="space-y-2"
        method="put"
        id={form.id}
        onSubmit={form.onSubmit}
        noValidate={form.noValidate}
      >
        <Card>
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
            <CardDescription>
              Update basic details to your song that make it easy to identify
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
            <div className="py-4 space-y-2">
              <FlexList direction="row" gap={2} items="center">
                <Checkbox
                  id="show-tempo"
                  checked={Boolean(showTempo.value)}
                  onCheckedChange={(checked) =>
                    showTempo.change(checked ? "true" : "")
                  }
                  onFocus={showTempo.focus}
                  onBlur={showTempo.blur}
                />
                <Label htmlFor="show-tempo">Add tempo</Label>
              </FlexList>
              {showTempo.value ? (
                <FlexList gap={2}>
                  <Label>Tempo</Label>
                  <Input
                    placeholder="Tempo"
                    type="number"
                    value={tempoControl.value}
                    onChange={(e) => tempoControl.change(e.target.value)}
                    onFocus={tempoControl.focus}
                    onBlur={tempoControl.blur}
                    max={420}
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
                    max={420}
                    step={1}
                  />
                  <div
                    id={fields.tempo.errorId}
                    className="text-sm text-destructive"
                  >
                    {fields.tempo.errors}
                  </div>
                </FlexList>
              ) : null}
            </div>
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
              your bandmates, but these fields are optional if you want to skip
              this section for now.
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
                  {Array.isArray(linksControl.value)
                    ? linksControl.value?.map((link, index) => {
                        if (linksControl.value)
                          return (
                            <div key={index}>
                              <FlexList direction="row" gap={2}>
                                <Input
                                  placeholder="Link"
                                  defaultValue={linksControl.value[index]}
                                  name={fields.links.name[index]}
                                  onChange={(e) => {
                                    if (
                                      !linksControl.value ||
                                      !Array.isArray(linksControl.value)
                                    ) {
                                      return;
                                    }
                                    linksControl.change(
                                      linksControl.value.map((v, i) =>
                                        i === index ? e.target.value : v,
                                      ),
                                    );
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    if (
                                      !linksControl.value ||
                                      !Array.isArray(linksControl.value)
                                    ) {
                                      return;
                                    }
                                    linksControl.change(
                                      linksControl.value.filter(
                                        (_, i) => i !== index,
                                      ),
                                    );
                                  }}
                                >
                                  Remove
                                </Button>
                              </FlexList>
                              <div className="text-sm text-destructive">
                                {form.allErrors[
                                  `${fields.links.name}[${index}]`
                                ]?.join(", ")}
                              </div>
                            </div>
                          );
                      })
                    : null}
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (!linksControl.value) {
                        linksControl.change([""]);
                        return;
                      }
                      if (!Array.isArray(linksControl.value)) {
                        return;
                      }
                      linksControl.change([...linksControl.value, ""]);
                    }}
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
                      <RadioGroupItem id="exclude" value="include" />
                      <Label htmlFor="exclude">Always include</Label>
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
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 justify-start sm:flex-row-reverse">
              <Button type="submit">Update Song</Button>
              <Button variant="ghost" asChild>
                <Link to={redirectTo ?? `/${song.bandId}/songs/${song.id}`}>
                  Cancel
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </Form>
    </div>
  );
}
