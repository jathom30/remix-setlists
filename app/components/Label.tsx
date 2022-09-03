type LabelProps = { required?: boolean; children?: React.ReactNode }

export const Label = ({ required, children }: LabelProps) => {
  return (
    <span className="text-xs font-bold text-text-subdued">
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