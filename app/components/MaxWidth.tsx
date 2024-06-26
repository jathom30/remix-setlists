import React from "react";

export function MaxWidth({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-4xl w-full m-auto my-0 ${className ?? ""}`}>
      {children}
    </div>
  );
}
