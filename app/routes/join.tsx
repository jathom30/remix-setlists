import { Outlet } from "react-router";

export default function Join() {
  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Outlet />
      </div>
    </div>
  );
}
