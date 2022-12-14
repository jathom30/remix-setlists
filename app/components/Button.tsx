import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { buttonKind, buttonSize } from "~/utils/buttonStyles";

export type ButtonKind = 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'ghost' | 'link' | 'outline' | 'active' | 'disabled'

export type ButtonProps = {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
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
  return (
    <button
      name={name}
      className={`btn ${buttonKind(kind)} ${icon ? 'gap-2' : ''} ${buttonSize(size)} ${isOutline ? 'btn-outline' : ''} ${isDisabled ? 'btn-disabled' : ''} ${isRounded ? 'btn-circle' : ''} ${isSaving ? 'loading' : ''}`}
      onClick={onClick}
      disabled={isDisabled || isSaving}
      type={type}
      value={value}
      tabIndex={tabIndex}
    >
      {(icon && !isSaving) ? <FontAwesomeIcon icon={icon} /> : null}
      <div className={isCollapsing ? 'hidden md:block' : ''}>{children}</div>
    </button>
  )
}