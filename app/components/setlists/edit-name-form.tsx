import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { IntentSchema, SetlistNameSchema } from "./form-schemas";

export const EditNameForm = ({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["update-name"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SetlistNameSchema });
    },
    defaultValue: {
      setlist_name: name,
      intent: IntentSchema.Enum["update-name"],
    },
  });

  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <div>
        <Label htmlFor={fields.setlist_name.name}>Setlist Name</Label>
        <Input
          {...getInputProps(fields.setlist_name, { type: "text" })}
          placeholder="Setlist name"
        />
        <div
          className="text-sm text-destructive"
          id={fields.setlist_name.errorId}
        >
          {fields.setlist_name.errors}
        </div>
      </div>
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};
