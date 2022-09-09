export const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <span className="text-danger text-sm">{message}</span>
  )
}