import { faBarcode, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FlexList, Link } from "~/components";

export default function CreateBandMenu() {
  return (
    <FlexList pad={4}>
      <p>How do you want to add a band?</p>
      <Link to="../existing" kind="secondary" isOutline icon={faBarcode}>
        Add with code
      </Link>
      <Link to="../new" kind="primary" icon={faPlus}>
        Create a new band
      </Link>
    </FlexList>
  );
}
