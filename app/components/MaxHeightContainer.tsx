import type { ReactNode } from "react";

interface MaxHeightContainerType {
  header?: ReactNode;
  footer?: ReactNode;
  fullHeight?: boolean;
  children?: ReactNode;
}

export const MaxHeightContainer = ({
  children,
  header,
  footer,
  fullHeight,
}: MaxHeightContainerType) => {
  return (
    <div className={`flex flex-col w-full ${fullHeight ? "h-full" : ""}`}>
      {header ? <div className="sticky top-0 z-10">{header}</div> : null}
      <div className="overflow-auto flex-grow relative z-0 h-full">
        {children}
      </div>
      {footer ? <div className="sticky bottom-0 z-10">{footer}</div> : null}
    </div>
  );
};
