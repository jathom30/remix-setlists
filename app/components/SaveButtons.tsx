import { faSave } from "@fortawesome/free-solid-svg-icons"
import type { ReactNode } from "react"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"

export const SaveButtons = ({ saveLabel, cancelTo, isDisabled = false }: { saveLabel: ReactNode; cancelTo: string; isDisabled?: boolean }) => {
  return (
    <div className="border-t border-slate-300 w-full">
      <FlexList gap={2} pad={4} items="stretch">
        <Button icon={faSave} kind="primary" type="submit" isDisabled={isDisabled}>{saveLabel}</Button>
        <Link to={cancelTo} type="submit">Cancel</Link>
      </FlexList>
    </div>
  )
}