import {
  CheckCircle,
  CircleAlert,
  CircleEllipsis,
  Info,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const EpicToaster = ({ theme, ...props }: ToasterProps) => {
  return (
    <Sonner
      theme={theme}
      richColors
      icons={{
        success: <CheckCircle />,
        error: <CircleAlert />,
        info: <Info />,
        loading: <CircleEllipsis />,
        warning: <TriangleAlert />,
      }}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { EpicToaster };
