import { getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form } from "react-router";
import { ReactNode } from "react";

import { Input } from "@/components/ui/input";

import { CreatePublicLinkSchema, IntentSchema } from "./form-schemas";

export const CreatePublicLinkForm = ({ children }: { children: ReactNode }) => {
  const [form, fields] = useForm({
    id: IntentSchema.Enum["create-public-link"],
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: CreatePublicLinkSchema });
    },
    defaultValue: {
      intent: IntentSchema.Enum["create-public-link"],
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
