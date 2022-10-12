import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/server-runtime";
import { FlexList, ItemBox, Label, MaxHeightContainer, SaveButtons, Input, Checkbox, ErrorMessage, Field } from "~/components";
import { getFields } from "~/utils/form";
import invariant from "tiny-invariant";
import { createSetlistAuto } from "~/models/setlist.server";

type AutoFormType = {
  setLength: number;
  setCount: number;
  originalsOnly?: boolean;
  coversOnly?: boolean;
  excludeBallads?: boolean;
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const formData = await request.formData()

  const { fields, errors } = getFields<AutoFormType>(formData, [
    { name: 'setLength', type: 'number', isRequired: true },
    { name: 'setCount', type: 'number', isRequired: true },
    { name: 'originalsOnly', type: 'boolean', isRequired: false },
    { name: 'coversOnly', type: 'boolean', isRequired: false },
    { name: 'excludeBallads', type: 'boolean', isRequired: false },
  ])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  const settings = {
    setLength: fields.setLength,
    setCount: fields.setCount,
    filters: {
      noBallads: fields.excludeBallads || false,
      noCovers: fields.originalsOnly || false,
      onlyCovers: fields.coversOnly || false,
    }
  }

  const setlistId = await createSetlistAuto(bandId, settings)

  return redirect(`/${bandId}/setlists/${setlistId}/rename`)
}

export default function AutoSetlistCreation() {
  const actionData = useActionData<typeof action>()
  const errors = actionData?.errors

  return (
    <Form className="h-full" method="post">
      <MaxHeightContainer
        fullHeight
        footer={
          <SaveButtons saveLabel="Generate setlist" cancelTo=".." />
        }
      >
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>1. Set details</Label>
            <ItemBox>
              <FlexList>
                <Field name="setLength" label="Set length (in minutes)" isRequired>
                  <Input name="setLength" type="number" />
                  {errors?.setLength ? <ErrorMessage message="Set length required" /> : null}
                </Field>
                <Field name="setCount" label="Number of sets" isRequired>
                  <Input name="setCount" type="number" />
                  {errors?.setCount ? <ErrorMessage message="Number of sets required" /> : null}
                </Field>
              </FlexList>
            </ItemBox>
          </FlexList>

          <FlexList gap={2}>
            <Label>2. Auto-generation settings</Label>
            <ItemBox>
              <FlexList>
                <Checkbox name="originalsOnly" label="Originals only" />
                <Checkbox name="coversOnly" label="Covers only" />
                <Checkbox name="excludeBallads" label="Exclude ballads" />
              </FlexList>
            </ItemBox>
          </FlexList>
        </FlexList>
      </MaxHeightContainer>
    </Form>
  )
}