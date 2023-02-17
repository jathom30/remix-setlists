import { FlexList } from "./FlexList"
import { Link } from "./Link"
import { MaxWidth } from "./MaxWidth"

export const RestrictedAlert = ({ dismissTo }: { dismissTo: string }) => {
  return (
    <MaxWidth>
      <FlexList pad={4}>
        <h1 className="text-3xl font-bold">Restricted Access</h1>
        <div>
          <p>You do not have proper access to perform this action.</p>
          <p>To gain access, have an <b>Admin</b> adjust your role in the band.</p>
        </div>
        <Link to={dismissTo}>Ok</Link>
      </FlexList>
    </MaxWidth>
  )
}