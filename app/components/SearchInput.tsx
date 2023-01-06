import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Input } from "./Input"

export const SearchInput = ({ defaultValue }: { defaultValue?: string | null }) => {
  return (
    <div className="input-group">
      <Input name="query" placeholder="Search..." defaultValue={defaultValue || ''} />
      <button type="submit" className="btn btn-square">
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </button>
    </div>
  )
}