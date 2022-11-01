import { motion } from "framer-motion";
import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList"

export const RatioBar = ({ ratio }: { ratio: Record<'start' | 'stop', { label: string; amount: number }> }) => {
  const { start, stop } = ratio
  const percent = (start.amount / (start.amount + stop.amount)) * 100
  return (
    <FlexList gap={2}>
      <motion.div initial={{ height: 0 }} animate={{ height: 32 }} transition={{ delay: .3 }} className="relative w-full bg-teal-400 rounded overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ delay: .5 }} className="absolute left-0 inset-y-0 bg-teal-600 h-full" />
      </motion.div>
      <FlexHeader>
        <FlexList gap={2} direction="row" items="center">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 }} className="w-4 h-4 bg-teal-600 rounded" />
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}>{start.label} {Math.round(percent)}%</motion.span>
        </FlexList>
        <FlexList gap={2} direction="row" items="center">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .3 }} className="w-4 h-4 bg-teal-400 rounded" />
          <motion.span initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}>{stop.label} {Math.round(100 - percent)}%</motion.span>
        </FlexList>
      </FlexHeader>
    </FlexList>
  )
}
