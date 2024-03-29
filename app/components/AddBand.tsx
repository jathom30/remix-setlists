import { faBarcode, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

import { Button } from "./Button";
import { ErrorMessage } from "./ErrorMessage";
import { Field } from "./Field";
import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList";
import { Input } from "./Input";
import { Navbar } from "./Navbar";
import { SaveButtons } from "./SaveButtons";
import { Title } from "./Title";

export const AddBand = ({
  onSubmit,
  onClose,
}: {
  onSubmit: () => void;
  onClose: () => void;
}) => {
  const codeFetcher = useFetcher<{ error: string } | undefined>();
  const codeError = codeFetcher.data?.error;

  const newFetcher = useFetcher<{ error: string } | undefined>();
  const newError = newFetcher.data?.error;

  const [addType, setAddType] = useState<"code" | "new">();

  // Close modal when either form has been successfully submitted
  useEffect(() => {
    const codeSubmittedSuccessfully =
      codeFetcher.state === "loading" &&
      codeFetcher.formMethod != null &&
      codeFetcher.formMethod != "GET" &&
      // If we have no data we must have redirected
      codeFetcher.data == null;
    const newSubmittedSuccessfully =
      newFetcher.state === "loading" &&
      newFetcher.formMethod != null &&
      newFetcher.formMethod != "GET" &&
      // If we have no data we must have redirected
      newFetcher.data == null;

    if (codeSubmittedSuccessfully || newSubmittedSuccessfully) {
      onSubmit();
    }
  }, [codeFetcher, newFetcher, onSubmit]);

  return (
    <FlexList gap={0}>
      <Navbar>
        <FlexHeader>
          <Title>Add band</Title>
          <Button kind="ghost" isRounded onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </FlexHeader>
      </Navbar>
      {!addType ? (
        <FlexList pad={4}>
          <p>How do you want to add a band?</p>
          <Button
            onClick={() => setAddType("code")}
            size="md"
            kind="secondary"
            isOutline
            icon={faBarcode}
          >
            Add with code
          </Button>
          <Button
            onClick={() => setAddType("new")}
            size="md"
            kind="primary"
            icon={faPlus}
          >
            Create a new band
          </Button>
        </FlexList>
      ) : null}
      {addType === "code" ? (
        <codeFetcher.Form method="put" action="/resources/addExistingBand">
          <FlexList gap={0} pad={4}>
            <Field name="bandCode" label="Band code">
              <Input
                name="bandCode"
                placeholder="Enter your band code here..."
              />
              {codeError ? <ErrorMessage message={codeError} /> : null}
            </Field>
          </FlexList>
          <SaveButtons
            saveLabel="Add me to this band"
            onCancel={() => setAddType(undefined)}
          />
        </codeFetcher.Form>
      ) : null}
      {addType === "new" ? (
        <newFetcher.Form method="put" action="/resources/createNewBand">
          <FlexList pad={4} gap={0}>
            <Field name="name" label="Create a new band">
              <Input name="name" placeholder="Band name..." />
              {newError ? (
                <ErrorMessage message="Band name is required" />
              ) : null}
            </Field>
          </FlexList>
          <SaveButtons
            saveLabel="Create"
            onCancel={() => setAddType(undefined)}
          />
        </newFetcher.Form>
      ) : null}
    </FlexList>
  );
};
