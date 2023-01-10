type LabelProps = { required?: boolean; children?: React.ReactNode; isDanger?: boolean }

export const Label = ({ required, children, isDanger = false }: LabelProps) => {
  return (
    <span className={`text-sm font-bold ${isDanger ? 'text-error' : ''}`}>
      {children}
      {required && (
        <>
          {' '}
          <span className="font-normal">[Required]</span>
        </>
      )}
    </span>
  )
}