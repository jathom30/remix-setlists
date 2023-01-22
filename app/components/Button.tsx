import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useButton } from "@react-aria/button";
import { FocusRing } from "@react-aria/focus";
import React, { useRef } from "react"
import { buttonKind, buttonSize } from "~/utils/buttonStyles";

export type ButtonKind = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'outline' | 'active' | 'disabled'

export type ButtonProps = {
  onClick?: () => void
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
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

export function Button({ isSaving = false, isCollapsing = false, isOutline = false, onClick, size, tabIndex, icon, name, value, isDisabled = false, isRounded = false, type = 'button', kind, children }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  let { buttonProps } = useButton({ onPress: onClick, isDisabled: isDisabled || isSaving, type }, ref);

  return (
    <FocusRing focusRingClass="ring ring-offset-transparent">
      <button
        ref={ref}
        name={name}
        className={`btn ${buttonKind(kind)} ${icon ? 'gap-2' : ''} ${buttonSize(size)} ${isOutline ? 'btn-outline' : ''} ${isDisabled ? 'btn-disabled' : ''} ${isRounded ? 'btn-circle' : ''} ${isSaving ? 'loading' : ''} touch-none select-none flex-nowrap focus-visible:outline-none`}
        {...buttonProps}
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