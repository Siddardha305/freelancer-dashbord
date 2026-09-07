import { getClientByIdAction } from "@/dashboard/clients/client-actions";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { ClientProfileClient } from "./ClientProfileClient";

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  const isOwner = user?.role === 'admin' || user?.teamRole === 'owner';
  if (!isOwner && (user?.teamRole === 'editor' || user?.teamRole === 'viewer')) {
    redirect('/dashboard/work');
  }

  const { id } = await params;
  const client = await getClientByIdAction(id);

  if (!client) {
    notFound();
  }

  return <ClientProfileClient initialClient={client} />;
}
