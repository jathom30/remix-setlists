import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as RemixLink } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { additionalStyles, defaultButtonStyles } from "~/styleUtils";
import type { ButtonProps } from "./Button";
import { Loader } from "./Loader";

export function Link(props: ButtonProps & RemixLinkProps) {
  const { to, prefetch, children, icon, isSaving, isCollapsing, isDisabled = false, kind = 'default', isRounded, className, ...rest } = props

  return (
    <RemixLink
      {...rest}
      to={to}
      prefetch={prefetch}
      className={`${defaultButtonStyles} ${additionalStyles({ isDisabled, kind })} ${isRounded ? 'rounded-full' : ''} ${className}`}
    >
      {icon && !isSaving ? <FontAwesomeIcon icon={icon} /> : null}
      {isSaving ? <Loader /> : null}
      <div className={`${isCollapsing ? 'hidden md:block' : ''}`}>{children}</div>
    </RemixLink>
  )
}