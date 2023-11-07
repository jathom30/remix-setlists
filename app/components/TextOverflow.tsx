import type { ReactNode } from "react";

export const TextOverflow = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`text-ellipsis whitespace-nowrap overflow-hidden ${className}`}
    >
      {children}
    </span>
  );
};
