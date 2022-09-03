export const IntentInput = ({ value }: { value: string }) => {
  return (
    <input readOnly hidden value={value} name="intent" />
  )
}