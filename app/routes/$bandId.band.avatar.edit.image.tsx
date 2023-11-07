import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { useRef, useState } from "react";
import { Button, CatchContainer, ErrorContainer, FlexList } from "~/components";

export default function EditBandAvatarImage() {
  const [image, setImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) {
      return;
    }
    setImage(URL.createObjectURL(e.target.files[0]));
  };
  return (
    <FlexList pad={4}>
      {image ? (
        <>
          <Button isOutline onClick={() => fileInputRef.current?.click()}>
            Replace image
          </Button>
          <div className="aspect-square max-h-64 rounded overflow-hidden flex flex-col items-center justify-center">
            <img
              className="max-w-xs w-full h-full object-cover"
              src={image}
              alt="band logo"
            />
          </div>
        </>
      ) : (
        <span>Max size: 10MB</span>
      )}
      <input hidden type="hidden" name="intent" defaultValue="image" />
      <input
        ref={fileInputRef}
        className="file-input file-input-bordered"
        hidden={!!image}
        type="file"
        name="path"
        accept="image/*"
        onChange={onImageChange}
      />
    </FlexList>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (!isRouteErrorResponse(error)) {
    return <ErrorContainer error={error as Error} />;
  }
  return <CatchContainer status={error.status} data={error.data} />;
}
