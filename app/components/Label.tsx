type LabelProps = { required?: boolean; children?: React.ReactNode; isDanger?: boolean; align?: 'left' | 'center' | 'right' }

export const Label = ({ required, children, isDanger = false, align = 'left' }: LabelProps) => {
  const getAlign = () => {
    switch (align) {
      case 'left':
        return 'text-left'
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }
  return (
    <span className={`text-sm ${getAlign()} font-bold ${isDanger ? 'text-error' : ''}`}>
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