export const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <span className="text-error text-sm">{message}</span>
  )
}