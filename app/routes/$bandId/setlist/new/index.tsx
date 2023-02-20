import { faHammer, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@remix-run/react";
import { FlexList } from "~/components";
import { hoverAndFocusContainerStyles } from "~/styleUtils";

export default function NewSetlist() {

  return (
    <FlexList pad="md">
      <FlexList gap="sm">
        <Link to="manual" className={hoverAndFocusContainerStyles}>
          <FlexList pad="md" gap="sm" items="center">
            <FontAwesomeIcon icon={faHammer} />
            <span>Manual</span>
          </FlexList>
        </Link>
        <span className="text-sm">Manually add, remove, and move songs as you please.</span>
      </FlexList>
      <FlexList gap="sm">
        <Link to="auto" className={hoverAndFocusContainerStyles}>
          <FlexList pad="md" gap="sm" items="center">
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            <span>Auto-magical</span>
          </FlexList>
        </Link>
        <span className="text-sm">Let the app auto-generate a setlist to your specifications. Then, edit the list to add your finishing touches.</span>
      </FlexList>
    </FlexList>
  )
}
