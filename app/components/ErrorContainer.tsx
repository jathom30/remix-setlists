import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { MaxWidth } from "./MaxWidth"

export const ErrorContainer = ({ error }: { error: Error }) => {
  console.error(error.message)
  return (
    <MaxWidth>
      <FlexList pad={4}>
        <h1 className="text-3xl">Oops</h1>
        <p>Looks like something is broken. We are as disappointed as you are. Feel free to <a href="mailto:support@setlists.pro">email us</a> to alert us to the issue.</p>
        <Link to=".">Try again?</Link>
      </FlexList>
    </MaxWidth>
  )
}