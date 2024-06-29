import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { ReactNode } from "react";

import { CloneSetlistSchema, IntentSchema } from "./form-schemas";

export const CloneSetlistForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["clone-setlist"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CloneSetlistSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["clone-setlist"],
    },
  });

  return (
    <Form
      method="post"
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
