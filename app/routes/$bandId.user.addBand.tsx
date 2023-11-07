import { useNavigate } from "@remix-run/react";
import { AddBand } from "~/components/AddBand";

export default function AddABand() {
  const navigate = useNavigate();
  return <AddBand onClose={() => navigate("..")} onSubmit={() => undefined} />;
}
