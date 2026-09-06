import { getClientByIdAction } from "@/dashboard/clients/client-actions";
import { getSessionUser } from "@/lib/session";
import { notFound, redirect } from "next/navigation";
import { ClientProfileClient } from "./ClientProfileClient";

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (user?.teamRole === 'editor' || user?.workspaceType === 'corporate') {
    redirect('/dashboard/work');
  }

  const { id } = await params;
  const client = await getClientByIdAction(id);

  if (!client) {
    notFound();
  }

  return <ClientProfileClient initialClient={client} />;
}
