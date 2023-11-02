import { faHammer, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@remix-run/react";
import { FlexList, MaxWidth } from "~/components";
import { hoverAndFocusContainerStyles } from "~/styleUtils";

export default function NewSetlist() {

  return (
    <MaxWidth>
      <FlexList pad={4}>
        <FlexList gap={2}>
          <Link to="fresh" className={hoverAndFocusContainerStyles}>
            <FlexList pad={4} gap={2} items="center">
              <FontAwesomeIcon icon={faHammer} />
              <span>Manual</span>
            </FlexList>
          </Link>
          <span className="text-sm">Manually add, remove, and move songs as you please.</span>
        </FlexList>
        <FlexList gap={2}>
          <Link to="auto" className={hoverAndFocusContainerStyles}>
            <FlexList pad={4} gap={2} items="center">
              <FontAwesomeIcon icon={faMagicWandSparkles} />
              <span>Auto-magical</span>
            </FlexList>
          </Link>
          <span className="text-sm">Let the app auto-generate a setlist to your specifications. Then, edit the list to add your finishing touches.</span>
        </FlexList>
      </FlexList>
    </MaxWidth>
  )
}
