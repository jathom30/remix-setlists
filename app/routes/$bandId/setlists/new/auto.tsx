import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { ActionArgs } from "@remix-run/server-runtime";
import { FlexList, ItemBox, Label, MaxHeightContainer, SaveButtons, Input, Checkbox, ErrorMessage } from "~/components";
import { getFields } from "~/utils/form";
import invariant from "tiny-invariant";

type AutoFormType = {
  setLength: number;
  setCount: number;
}

export async function action({ request, params }: ActionArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  const formData = await request.formData()

  const { fields, errors } = getFields<AutoFormType>(formData, [
    { name: 'setLength', type: 'number', isRequired: true },
    { name: 'setCount', type: 'number', isRequired: true },
  ])

  if (Object.keys(errors).length) {
    return json({ errors })
  }

  console.log(fields)

  const setlistId = ''

  return redirect(`/${bandId}/setlists/${setlistId}`)
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
                <FlexList gap={0}>
                  <Label required>Set length (in minutes)</Label>
                  <Input name="setLength" />
                  {errors?.setLength ? <ErrorMessage message="Set length required" /> : null}
                </FlexList>
                <FlexList gap={0}>
                  <Label required>Number of sets</Label>
                  <Input name="setCount" />
                  {errors?.setCount ? <ErrorMessage message="Number of sets required" /> : null}
                </FlexList>
              </FlexList>
            </ItemBox>
          </FlexList>

          <FlexList gap={2}>
            <Label>2. Auto-generation settings</Label>
            <ItemBox>
              <FlexList>
                <Checkbox name="originalsOnly" label="Originals only" />
                <Checkbox name="covesOnly" label="Covers only" />
                <Checkbox name="excludeBallads" label="Exclude ballads" />
              </FlexList>
            </ItemBox>
          </FlexList>

        </FlexList>
      </MaxHeightContainer>
    </Form>
  )
}