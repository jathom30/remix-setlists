import { LoaderCircle } from "lucide-react";

export const Loader = () => {
  return (
    <div className={`animate-spin text-base-content`}>
      <LoaderCircle />
    </div>
  );
};
