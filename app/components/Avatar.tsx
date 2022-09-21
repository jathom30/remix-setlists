import type { Band, BandIcon } from "@prisma/client"
import type { SerializeFrom } from "@remix-run/node"

export const Avatar = ({ band, size = 'md' }: { band: SerializeFrom<Band & { icon: BandIcon | null }>; size?: 'sm' | 'md' | 'lg' }) => {
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
      {band.icon?.path ? (
        <img src={band.icon?.path} alt={`${band.name} icon`} />
      ) : (
        <div
          className={`h-full flex items-center justify-center bg-primary ${getSize().text} rounded-md font-bold`}
          style={{ backgroundColor: band.icon?.backgroundColor || undefined, color: band.icon?.textColor || undefined }}
        >
          <span>{band.name[0]}</span>
        </div>
      )}
    </div>
  )
}