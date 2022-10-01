import { faHammer, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { FlexList } from "~/components";

const linkClasses = "rounded-lg w-full bg-slate-200 text-3xl font-bold"

export default function NewSetlist() {

  return (
    <FlexList pad={4}>
      <FlexList gap={2}>
        <Link to="manual" className={linkClasses}>
          <FlexList pad={4} gap={2} items="center">
            <FontAwesomeIcon icon={faHammer} />
            <span>Manual</span>
          </FlexList>
        </Link>
        <span className="text-sm">Manually add, remove, and move songs as you please.</span>
      </FlexList>
      <FlexList gap={2}>
        <Link to="auto" className={linkClasses}>
          <FlexList pad={4} gap={2} items="center">
            <FontAwesomeIcon icon={faMagicWandSparkles} />
            <span>Auto-magical</span>
          </FlexList>
        </Link>
        <span className="text-sm">Let the app auto-generate a setlist to your specifications. Then, edit the list to add your finishing touches.</span>
      </FlexList>
    </FlexList>
  )
}
