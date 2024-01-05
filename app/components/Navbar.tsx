import type { ReactNode } from "react";

export const Navbar = ({
  children,
  shrink = false,
}: {
  children: ReactNode;
  shrink?: boolean;
}) => {
  return (
    <div
      className={`flex items-center w-full min-h-[4rem] p-2 bg-background shadow-lg border-b border-border ${
        shrink ? "min-h-[2.5rem] py-1" : ""
      }`}
    >
      {children}
    </div>
  );
};
