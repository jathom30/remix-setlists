import React from "react";

export function MaxWidth({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-5xl w-full m-auto my-0 ${className ?? ""}`}>
      {children}
    </div>
  );
}
