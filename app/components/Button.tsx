import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"
import { additionalStyles, defaultButtonStyles } from "~/styleUtils";

export type ButtonKind = 'default' | 'primary' | 'danger' | 'text' | 'secondary'

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
  isCollapsing?: boolean
}

export function Button({ isCollapsing = false, onClick, tabIndex, icon, name, value, isDisabled = false, isRounded = false, type = 'button', kind = 'default', children }: ButtonProps) {
  return (
    <button
      name={name}
      className={`${defaultButtonStyles} ${additionalStyles({ isDisabled, kind })} ${isRounded ? 'rounded-full' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      type={type}
      value={value}
      tabIndex={tabIndex}
    >
      {icon ? <FontAwesomeIcon icon={icon} /> : null}
      <div className={`${isCollapsing ? 'hidden md:block' : ''}`}>{children}</div>
    </button>
  )
}