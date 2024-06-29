import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { ReactNode } from "react";

import { DeleteSetlistSchema, IntentSchema } from "./form-schemas";

export const DeleteSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["delete-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: DeleteSetlistSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["delete-setlist"],
    },
  });

  return (
    <Form
      method="delete"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
      className="space-y-4"
    >
      <input hidden {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};
