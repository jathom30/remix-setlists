import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import {
  FlexList,
  ItemBox,
  Label,
  MaxHeightContainer,
  SaveButtons,
  Input,
  Checkbox,
  ErrorMessage,
  Field,
  RadioGroup,
} from "~/components";
import { getFields } from "~/utils/form";
import invariant from "tiny-invariant";
import { createSetlistAuto } from "~/models/setlist.server";

type AutoFormType = {
  setLength: number;
  setCount: number;
  songRole: string;
  excludeBallads?: string;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { bandId } = params;
  invariant(bandId, "bandId not found");
  const formData = await request.formData();

  const { fields, errors } = getFields<AutoFormType>(formData, [
    { name: "setLength", type: "number", isRequired: true },
    { name: "setCount", type: "number", isRequired: true },
    { name: "songRole", type: "string", isRequired: true },
    { name: "excludeBallads", type: "string", isRequired: false },
  ]);

  if (Object.keys(errors).length) {
    return json({ errors });
  }

  const settings = {
    setLength: fields.setLength,
    setCount: fields.setCount,
    filters: {
      noCovers: fields.songRole === "originals" || false,
      onlyCovers: fields.songRole === "covers" || false,
      noBallads: fields.excludeBallads === "excludeBallads" || false,
    },
  };

  const setlistId = await createSetlistAuto(bandId, settings);

  return redirect(`/${bandId}/setlist/creatingSetlist?setlistId=${setlistId}`);
}

export default function AutoSetlistCreation() {
  const actionData = useActionData<typeof action>();
  const errors = actionData?.errors;

  return (
    <Form className="h-full" method="post">
      <MaxHeightContainer
        fullHeight
        footer={<SaveButtons saveLabel="Generate setlist" cancelTo=".." />}
      >
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>1. Set details</Label>
            <ItemBox>
              <FlexList>
                <Field
                  name="setLength"
                  label="Set length (in minutes)"
                  isRequired
                >
                  <Input name="setLength" type="number" defaultValue={60} />
                  {errors?.setLength ? (
                    <ErrorMessage message="Set length required" />
                  ) : null}
                </Field>
                <Field name="setCount" label="Number of sets" isRequired>
                  <Input name="setCount" type="number" defaultValue={1} />
                  {errors?.setCount ? (
                    <ErrorMessage message="Number of sets required" />
                  ) : null}
                </Field>
              </FlexList>
            </ItemBox>
          </FlexList>

          <FlexList gap={2}>
            <Label>2. Auto-generation settings</Label>
            <ItemBox>
              <FlexList>
                <RadioGroup
                  direction="col"
                  name="songRole"
                  options={[
                    { label: "Originals only", value: "originals" },
                    { label: "Covers only", value: "covers" },
                    { label: "No preference", value: "no_preference" },
                  ]}
                  isChecked={(val) => val === "no_preference"}
                />
              </FlexList>
            </ItemBox>
          </FlexList>

          <FlexList gap={2}>
            <Label>3. Additional options</Label>
            <ItemBox>
              <Checkbox
                name="excludeBallads"
                value="excludeBallads"
                label="Exclude ballads"
              />
            </ItemBox>
          </FlexList>
        </FlexList>
      </MaxHeightContainer>
    </Form>
  );
}
