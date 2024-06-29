import { ReactNode } from "react";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const ResizableSetlistContainer = ({
  show,
  children,
  availableSongs,
}: {
  show: boolean;
  children: ReactNode;
  availableSongs: ReactNode;
}) => {
  if (!show) return children;
  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>{children}</ResizablePanel>
      <ResizableHandle withHandle className="bg-inherit" />
      <ResizablePanel defaultSize={40}>{availableSongs}</ResizablePanel>
    </ResizablePanelGroup>
  );
};
