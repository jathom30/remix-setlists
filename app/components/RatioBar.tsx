import { motion } from "framer-motion";

import { FlexHeader } from "./FlexHeader";
import { FlexList } from "./FlexList";

export const RatioBar = ({
  ratio,
}: {
  ratio: Record<"start" | "stop" | "unset", { label: string; amount: number }>;
}) => {
  const { start, stop, unset } = ratio;
  const startPercent =
    (start.amount / (start.amount + stop.amount + unset.amount)) * 100;
  const stopPercent =
    (stop.amount / (start.amount + stop.amount + unset.amount)) * 100;
  const unsetPercent =
    (unset.amount / (start.amount + stop.amount + unset.amount)) * 100;
  return (
    <FlexList gap={2}>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: 32 }}
        transition={{ delay: 0.3 }}
        className="relative w-full bg-base-300 rounded overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stopPercent + startPercent}%` }}
          transition={{ delay: 0.5 }}
          className="absolute left-0 inset-y-0 bg-accent-focus h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${startPercent}%` }}
          transition={{ delay: 0.5 }}
          className="absolute left-0 inset-y-0 bg-accent h-full"
        />
      </motion.div>

      <FlexHeader>
        {startPercent ? (
          <FlexList gap={2} direction="row" items="center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-4 h-4 bg-accent rounded"
            />
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {start.label} {Math.round(startPercent)}%
            </motion.span>
          </FlexList>
        ) : null}
        {stopPercent ? (
          <FlexList gap={2} direction="row" items="center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-4 h-4 bg-accent-focus rounded"
            />
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {stop.label} {Math.round(stopPercent)}%
            </motion.span>
          </FlexList>
        ) : null}
        {unsetPercent ? (
          <FlexList gap={2} direction="row" items="center">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="w-4 h-4 bg-base-300 rounded"
            />
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {unset.label} {Math.round(unsetPercent)}%
            </motion.span>
          </FlexList>
        ) : null}
      </FlexHeader>
    </FlexList>
  );
};
