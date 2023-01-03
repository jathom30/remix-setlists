import { redirect } from "@remix-run/node";

export async function loader() {
  return redirect("/home")
}

// redirects to band select incase a user ever finds themselves at route