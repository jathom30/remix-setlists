import { faSave } from "@fortawesome/free-solid-svg-icons"
import { useNavigation } from "@remix-run/react"
import type { ReactNode } from "react"
import { useSpinDelay } from "spin-delay"
import { Button } from "./Button"
import { FlexList } from "./FlexList"
import { Link } from "./Link"

export const SaveButtons = ({ onCancel, onSave, saveLabel, saveTo, cancelTo, isSaving = false, isDisabled = false }: { onCancel?: () => void; onSave?: () => void; saveLabel: ReactNode; saveTo?: string; cancelTo?: string; isSaving?: boolean; isDisabled?: boolean }) => {
  const navigation = useNavigation()
  const isSubmitting = useSpinDelay(navigation.state !== 'idle')
  const submitting = typeof isSaving !== 'undefined' ? isSaving : isSubmitting
  return (
    <div className="bg-base-100 shadow-2xl w-full">
      <FlexList direction={{ none: 'col', sm: 'row-reverse' }} pad="md" gap="sm">
        {saveTo ? (
          <Link onClick={onSave} size="md" isSaving={submitting} icon={faSave} kind="primary" to={saveTo} isDisabled={isDisabled || isSaving}>{submitting ? 'Saving...' : saveLabel}</Link>
        ) : (
          <Button onClick={onSave} size="md" isSaving={submitting} icon={faSave} kind="primary" type="submit" isDisabled={isDisabled || isSaving}>{submitting ? 'Saving...' : saveLabel}</Button>
        )}
        {onCancel ? (
          <Button onClick={onCancel}>Cancel</Button>
        ) : (
          <Link to={cancelTo || '..'}>Cancel</Link>
        )}
      </FlexList>
    </div>
  )
}