import { isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { CatchContainer, ErrorContainer, FlexList } from "~/components";
import { useBandIcon } from "~/utils";
import { contrastColor } from "~/utils/assorted";

export default function ColorSelect() {
  const bandIcon = useBandIcon();
  const [color, setColor] = useState(bandIcon?.icon.backgroundColor || "");

  return (
    <FlexList>
      <div className="flex flex-row gap-4 items-center justify-center">
        <HexColorPicker color={color} onChange={setColor} />
        <div
          className={`h-full aspect-square flex items-center justify-center bg-primary w-24 text-3xl rounded font-bold`}
          style={{ backgroundColor: color, color: contrastColor(color) }}
        >
          <span>{bandIcon?.bandName[0].toUpperCase()}</span>
        </div>
      </div>
      <input hidden type="hidden" name="color" defaultValue={color} />
      <input hidden type="hidden" name="intent" defaultValue="color" />
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
