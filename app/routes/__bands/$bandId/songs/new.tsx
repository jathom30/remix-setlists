import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Button } from "~/components";

export default function NewSong() {
  return (
    <div className="w-full">
      <header className="flex p-4 items-center justify-between">
        <h1 className="font-bold text-3xl">New Song</h1>
        <Button kind="danger" icon={faTrash} isCollapsing isRounded>Delete song</Button>
      </header>
    </div>
  )
}