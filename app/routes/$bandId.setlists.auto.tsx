import { getInputProps, useForm, useInputControl } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { Form, Link, useParams } from "@remix-run/react";
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { FlexList } from "~/components";
import { H1, Muted } from "~/components/typography";
import { createAutoSetlist } from "~/models/setlist.server";
import { requireNonSubMember, requireUserId } from "~/session.server";
import { emitterKeys } from "~/utils/emitter-keys";
import { emitter } from "~/utils/emitter.server";
import { AutoSetlistSchema, TAutoSetlist } from "~/utils/setlists";
import { redirectWithToast } from "~/utils/toast.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  await requireNonSubMember(request, bandId);
  return null;
}

export const meta: MetaFunction<typeof loader> = () => {
  return [{ title: "Auto Gen Setlist" }];
};

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserId(request);
  const { bandId } = params;
  invariant(bandId, "bandId is required");
  const formData = await request.formData();

  const submission = parseWithZod(formData, { schema: AutoSetlistSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }
  const setlist = await createAutoSetlist(bandId, submission.value);

  emitter.emit(emitterKeys.setlists, "hello");
  emitter.emit(emitterKeys.dashboard);
  return redirectWithToast(`/${bandId}/setlists/${setlist.id}`, {
    title: "Setlist Created",
    description: "Your setlist has been created successfully.",
    type: "success",
  });
}

export default function SetlistAuto() {
  const { bandId } = useParams();
  const [form, fields] = useForm<TAutoSetlist>({
    id: "auto-setlist-create",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: AutoSetlistSchema });
    },
    defaultValue: {
      name: "",
      numSets: 1,
      setLength: 50,
      artistPreference: "no-preference",
      showMinTempo: false,
      minTempo: 35,
      wildCard: false,
    },
    shouldValidate: "onBlur",
  });

  const artistPreference = useInputControl(fields.artistPreference);
  const showMinTempo = useInputControl(fields.showMinTempo);
  const minTempo = useInputControl(fields.minTempo);
  const wildCard = useInputControl(fields.wildCard);

  return (
    <Form
      method="post"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <div className="p-2 space-y-2">
        <H1>Auto Generate</H1>
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              With some simple inputs, we can generate a setlist for you.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label htmlFor={fields.name.id}>Setlist Name</Label>
              <Input
                placeholder="Setlist name"
                {...getInputProps(fields.name, { type: "text" })}
              />
              <div
                className="text-sm text-destructive"
                id={fields.name.errorId}
              >
                {fields.name.errors}
              </div>
            </div>
            <div>
              <Label htmlFor={fields.numSets.id}>Number of sets</Label>
              <Input
                placeholder="Number of sets needed"
                {...getInputProps(fields.numSets, { type: "number" })}
              />
              <div
                className="text-sm text-destructive"
                id={fields.numSets.errorId}
              >
                {fields.numSets.errors}
              </div>
            </div>
            <div>
              <Label htmlFor={fields.setLength.id}>
                Set length (in minutes)
              </Label>
              <Input
                placeholder="Length of each set"
                {...getInputProps(fields.setLength, { type: "number" })}
              />
              <div
                className="text-sm text-destructive"
                id={fields.setLength.errorId}
              >
                {fields.setLength.errors}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Extra settings to help customize the setlist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-1">
              <Label htmlFor={fields.artistPreference.id}>
                Artist preference
              </Label>
              <RadioGroup
                className="flex gap-4"
                id={fields.artistPreference.id}
                name={fields.artistPreference.name}
                value={artistPreference.value}
                onValueChange={artistPreference.change}
                onBlur={artistPreference.blur}
                onFocus={artistPreference.focus}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="covers" id="r1" />
                  <Label className="font-normal" htmlFor="r1">
                    Covers Only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no-covers" id="r2" />
                  <Label className="font-normal" htmlFor="r2">
                    Originals Only
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="no-preference" id="r3" />
                  <Label className="font-normal" htmlFor="r3">
                    No Preference
                  </Label>
                </div>
              </RadioGroup>
              <div
                className="text-sm text-destructive"
                id={fields.artistPreference.errorId}
              >
                {fields.artistPreference.errors}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={fields.showMinTempo.id}
                  name={fields.showMinTempo.name}
                  value={showMinTempo.value}
                  onCheckedChange={(checked) => {
                    if (typeof checked !== "boolean") return;
                    showMinTempo.change(checked ? "true" : "");
                  }}
                  onBlur={showMinTempo.blur}
                  onFocus={showMinTempo.focus}
                />
                <Label htmlFor={fields.showMinTempo.id}>
                  Minimum Tempo Threshold
                </Label>
              </div>
              <Muted>
                Set a minimum tempo you'd like your setlist to reach. Leave
                unchecked to allow all tempos.
              </Muted>
              <div
                className="text-sm text-destructive"
                id={fields.showMinTempo.errorId}
              >
                {fields.showMinTempo.errors}
              </div>
            </div>
            {showMinTempo.value ? (
              <FlexList gap={2}>
                <Input
                  type="number"
                  value={minTempo.value}
                  onChange={(e) => minTempo.change(e.target.value)}
                  onFocus={minTempo.focus}
                  onBlur={minTempo.blur}
                  min={0}
                  max={420}
                  step={1}
                />
                <Slider
                  name={fields.minTempo.name}
                  value={[Number(minTempo.value)]}
                  onValueChange={(val) => minTempo.change(String(val[0]))}
                  onFocus={minTempo.focus}
                  onBlur={minTempo.blur}
                  min={0}
                  max={420}
                  step={1}
                />
                <div
                  className="text-sm text-destructive"
                  id={fields.minTempo.errorId}
                >
                  {fields.minTempo.errors}
                </div>
              </FlexList>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Wild Card</CardTitle>
            <CardDescription>
              Choosing the wild card option will completely randomize the
              setlist. It will ignore all other settings (except for the set
              length and number of sets).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={fields.wildCard.id}
                  name={fields.wildCard.name}
                  value={wildCard.value}
                  onCheckedChange={(checked) =>
                    wildCard.change(checked ? "true" : "")
                  }
                  onFocus={wildCard.focus}
                  onBlur={wildCard.blur}
                />
                <Label htmlFor={fields.wildCard.id}>Wild Card Mode</Label>
              </div>
              <div
                className="text-sm text-destructive"
                id={fields.wildCard.errorId}
              >
                {fields.wildCard.errors}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button type="submit">Generate Setlist</Button>
              <Button variant="outline" asChild>
                <Link to={`/${bandId}/setlists`}>Cancel</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </Form>
  );
}
