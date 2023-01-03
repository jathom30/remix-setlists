import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link as RemixLink } from "@remix-run/react";
import type { RemixLinkProps } from "@remix-run/react/dist/components";
import { buttonKind, buttonSize } from "~/utils/buttonStyles";
import type { ButtonProps } from "./Button";

export function Link(props: ButtonProps & RemixLinkProps) {
  const { to, prefetch, children, icon, isSaving, size, isCollapsing, isDisabled = false, kind, isRounded, className, ...rest } = props

  return (
    <RemixLink
      {...rest}
      to={to}
      prefetch={prefetch}
      className={`btn ${buttonKind(kind)} ${buttonSize(size)} ${icon ? 'gap-2' : ''} ${isDisabled ? 'btn-disabled' : ''} ${isSaving ? 'loading' : ''} ${isRounded ? 'btn-circle' : ''}`}
    >
      {icon && !isSaving ? <FontAwesomeIcon icon={icon} /> : null}
      <div className={`${isCollapsing ? 'hidden md:block' : ''}`}>{children}</div>
    </RemixLink>
  )
}