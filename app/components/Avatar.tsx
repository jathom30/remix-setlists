import type { BandIcon } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"

export const Avatar = ({ icon, bandName, size = 'md' }: { icon?: SerializeFrom<BandIcon> | null; bandName: string; size?: 'sm' | 'md' | 'lg' }) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return {
          width: 'w-8',
          text: 'text-md'
        }
      case 'md':
        return {
          width: 'w-12',
          text: 'text-xl'
        }
      case 'lg':
        return {
          width: 'w-20',
          text: 'text-3xl'
        }
      default:
        return {
          width: 'w-12',
          text: 'text-xl'
        }
    }
  }
  return (
    <div className={`${getSize().width} aspect-square`}>
      {icon?.path ? (
        <img src={icon?.path} alt={`${bandName} icon`} />
      ) : (
        <div
          className={`h-full flex items-center justify-center bg-primary ${getSize().text} rounded-md font-bold`}
          style={{ backgroundColor: icon?.backgroundColor || undefined, color: icon?.textColor || undefined }}
        >
          <span>{bandName[0]}</span>
        </div>
      )}
    </div>
  )
}