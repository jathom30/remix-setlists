import { useCatch } from "@remix-run/react"
import { NotFound } from "./NotFound"
import { RestrictedAlert } from "./RestrictedAlert"

export const CatchContainer = () => {
  const caught = useCatch()
  if (caught.status === 403) {
    return <RestrictedAlert dismissTo={`..`} />
  }
  if (caught.status === 404) {
    return <NotFound dismissTo=".." message={caught.data} />
  }
  throw new Error(`Unhandled error: ${caught.status}`)
}