import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "@remix-run/react";
import { ReactNode } from "react";

import { Input } from "@/components/ui/input";

import { IntentSchema, RemovePublicLinkSchema } from "./form-schemas";

export const RemovePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["remove-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: RemovePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["remove-public-link"],
    },
  });
  return (
    <Form
      method="put"
      id={form.id}
      onSubmit={form.onSubmit}
      noValidate={form.noValidate}
    >
      <Input {...getInputProps(fields.intent, { type: "hidden" })} />
      {children}
    </Form>
  );
};
