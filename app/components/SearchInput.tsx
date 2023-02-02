import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { ChangeEvent } from "react";
import { Button } from "./Button";
import { Input } from "./Input"

export const SearchInput = ({ value, onChange, onClear }: { value?: string | null; onChange: (e: ChangeEvent<HTMLInputElement>) => void; onClear: () => void }) => {
  return (
    <div className="input-group">
      <Input name="query" placeholder="Search..." value={value || ''} onChange={onChange} />
      {value ? (
        <Button type="button" isRounded onClick={onClear}>
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      ) : null}
    </div>
  )
}