import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as RemixLink } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { additionalStyles, defaultButtonStyles } from "~/styleUtils";
import type { ButtonProps } from "./Button";

export function Link(props: ButtonProps & RemixLinkProps) {
  const { to, prefetch, children, icon, isCollapsing, isDisabled = false, kind = 'default', isRounded, ...rest } = props

  return (
    <RemixLink
      {...rest}
      to={to}
      prefetch={prefetch}
      className={`${defaultButtonStyles} ${additionalStyles({ isDisabled, kind })} ${isRounded ? 'rounded-full' : ''}`}
    >
      {icon ? <FontAwesomeIcon icon={icon} /> : null}
      <div className={`${isCollapsing ? 'hidden md:block' : ''}`}>{children}</div>
    </RemixLink>
  )
}