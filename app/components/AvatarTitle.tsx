import { Link, useNavigation } from "@remix-run/react";
import type { ReactNode } from "react";
import { useSpinDelay } from "spin-delay";

import { useBandIcon } from "~/utils";

import { Avatar } from "./Avatar";
import { FlexList } from "./FlexList";
import { Loader } from "./Loader";
import { Title } from "./Title";

export const AvatarTitle = ({ title }: { title: ReactNode }) => {
  const navigation = useNavigation();
  const isSubmitting = useSpinDelay(navigation.state !== "idle");
  const band = useBandIcon();
  return (
    <FlexList direction="row" items="center" gap={2}>
      <div className="sm:hidden">
        {band ? (
          <Link to="/home">
            <Avatar size="sm" bandName={band.bandName} icon={band.icon} />
          </Link>
        ) : null}
      </div>
      <Title>{title}</Title>
      {isSubmitting ? <Loader /> : null}
    </FlexList>
  );
};
