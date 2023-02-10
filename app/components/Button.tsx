import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FocusRing } from "@react-aria/focus";
import type { MouseEvent } from "react";
import React from "react"
import { buttonKind, buttonSize } from "~/utils/buttonStyles";

export type ButtonKind = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'outline' | 'active' | 'disabled'

export type ButtonProps = {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  icon?: IconDefinition;
  isDisabled?: boolean
  isRounded?: boolean
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
  kind?: ButtonKind
  name?: string
  value?: string
  children?: React.ReactNode
  tabIndex?: number
  isOutline?: boolean
  isCollapsing?: boolean
  isSaving?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg',
  ariaLabel?: string
}

export function Button({ ariaLabel, isSaving = false, isCollapsing = false, isOutline = false, onClick, size, tabIndex, icon, name, value, isDisabled = false, isRounded = false, type = 'button', kind, children }: ButtonProps) {

  const btnSize = buttonSize(size) ?? 'sm:btn-md'
  return (
    <FocusRing focusRingClass="ring ring-offset-transparent">
      <button
        type={type}
        aria-label={ariaLabel}
        name={name}
        className={`btn ${buttonKind(kind)} ${icon ? 'gap-2' : ''} btn-sm ${btnSize} ${isOutline ? 'btn-outline' : ''} ${isDisabled ? 'btn-disabled' : ''} ${isRounded ? 'btn-circle' : ''} ${isSaving ? 'loading' : ''} touch-none select-none flex-nowrap focus-visible:outline-none`}
        onClick={onClick}
        value={value}
        style={{
          WebkitTapHighlightColor: 'transparent'
        }}
        tabIndex={tabIndex}
      >
        {(icon && !isSaving) ? <FontAwesomeIcon icon={icon} /> : null}
        <div className={isCollapsing ? 'hidden md:block' : ''}>{children}</div>
      </button>
    </FocusRing>
  )
}