import type { ReactNode } from "react";

import { NotFound } from "./NotFound";
import { RestrictedAlert } from "./RestrictedAlert";

export const CatchContainer = ({
  status,
  data,
}: {
  status: number;
  data: ReactNode;
}) => {
  if (status === 403) {
    return <RestrictedAlert dismissTo={`..`} />;
  }
  if (status === 404) {
    return <NotFound dismissTo=".." message={data} />;
  }
  throw new Error(`Unhandled error: ${status}`);
};
