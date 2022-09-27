import { Form } from "@remix-run/react";
import { FlexList, Input, Label, SaveButtons } from "~/components";

export default function ExisitingBand() {
  return (
    <Form method="post">
      <FlexList gap={0} pad={4}>
        <Label>Band Code</Label>
        <Input name="bandCode" placeholder="Enter your band code here..." />
      </FlexList>
      <SaveButtons
        saveLabel="Add me to this band"
        cancelTo="/bandSelect"
      />
    </Form>
  )
}