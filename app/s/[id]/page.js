import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ShortShareRedirect({ params }) {
  const id = String(params?.id || "").trim();

  if (!/^[A-Za-z0-9_-]{8,32}$/.test(id)) {
    redirect("/share");
  }

  redirect(`/share?id=${encodeURIComponent(id)}`);
}
