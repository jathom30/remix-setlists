import { Link } from "@remix-run/react"

type Breadcrumb = {
  label: string;
  to: string;
}

export const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) => {
  return (
    <div className="breadcrumbs">
      <ul>
        {breadcrumbs.map(link => (
          <li key={link.label}>
            <Link to={link.to}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}