import { Link } from "@remix-run/react"
import type { ReactNode } from "react";

type Breadcrumb = {
  label: ReactNode;
  to: string;
}

export const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) => {
  return (
    <div className="breadcrumbs p-0">
      <ul>
        {breadcrumbs.map(link => (
          <li key={link.to}>
            <Link to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}