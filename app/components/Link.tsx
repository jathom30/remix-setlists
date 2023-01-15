import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as RemixLink } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { buttonKind, buttonSize } from "~/utils/buttonStyles";
import type { ButtonProps } from "./Button";

export function Link(props: ButtonProps & RemixLinkProps) {
  const { to, prefetch, children, icon, isSaving, isOutline = false, size, isCollapsing, isDisabled = false, kind, isRounded, className, ...rest } = props

  return (
    <RemixLink
      {...rest}
      to={to}
      prefetch={prefetch}
      className={`btn ${buttonKind(kind)} ${buttonSize(size)} ${isOutline ? 'btn-outline' : ''} ${icon ? 'gap-2' : ''} ${isDisabled ? 'btn-disabled' : ''} ${isSaving ? 'loading' : ''} ${isRounded ? 'btn-circle' : ''} flex-nowrap`}
    >
      {icon && !isSaving ? <FontAwesomeIcon icon={icon} /> : null}
      <div className={`${isCollapsing ? 'hidden md:block' : ''}`}>{children}</div>
    </RemixLink>
  )
}