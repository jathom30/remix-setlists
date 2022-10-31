import { FlexList } from "./FlexList"
import { Link } from "./Link"

export const ErrorContainer = ({ error }: { error: Error }) => {
  console.error(error.message)
  return (
    <FlexList pad={4}>
      <h1 className="text-3xl">Oops</h1>
      <p>Looks like something is broken. We are as disappointed as you are and are working on a fix.</p>
      <Link to=".">Try again?</Link>
    </FlexList>
  )
}