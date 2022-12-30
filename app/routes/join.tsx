import { Outlet } from "@remix-run/react";

export default function Join() {
  return (
    <div className="max-w-lg mx-auto pt-8 min-h-screen">
      <Outlet />
    </div>
  )
}