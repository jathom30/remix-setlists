import type { ReactNode } from "react";
import { Link } from "./Link"
import { FlexList } from "./FlexList"
import { MaxWidth } from "./MaxWidth";

export const NotFound = ({ dismissTo, message }: { dismissTo: string; message: ReactNode }) => {
  return (
    <MaxWidth>
      <FlexList pad={4}>
        <h1 className="text-3xl font-bold">404 Not Found</h1>
        <p>{message}</p>
        <Link isOutline to={dismissTo}>Go back</Link>
        <Link to="/">Go home</Link>
      </FlexList>
    </MaxWidth>
  )
}