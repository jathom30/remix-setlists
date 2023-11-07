import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Divider,
  FlexHeader,
  FlexList,
  Label,
  Navbar,
  Title,
} from "~/components";

export function SongSettingsInfo({ onClose }: { onClose: () => void }) {
  return (
    <div>
      <Navbar>
        <FlexHeader>
          <Title>Settings info</Title>
          <Button onClick={onClose} kind="ghost" isRounded>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <Label>Position</Label>
        <p>
          Songs can be set as "openers", "closers", or "other". Our auto-magical
          setlist creation process will attempt to place songs with this
          positioning in mind.
        </p>
        <Divider />
        <Label>Importance</Label>
        <p>
          Songs can currently be either included or excluded from setlist
          creation. If a song is set to "Always exclude", we will never pick it
          during auto generation.
        </p>
      </FlexList>
    </div>
  );
}
