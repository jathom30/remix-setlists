import { FlexList } from "./FlexList"
import { Link } from "./Link"

export const ErrorContainer = ({ error }: { error: Error }) => {
  return (
    <FlexList pad={4}>
      <h1 className="text-3xl">Oops</h1>
      <p>{error.message}</p>
      <Link to=".">Try again?</Link>
    </FlexList>
  )
}