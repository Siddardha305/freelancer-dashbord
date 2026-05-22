import { getClientByIdAction } from "@/dashboard/clients/actions/client-actions";
import { notFound } from "next/navigation";
import { ClientProfileClient } from "./ClientProfileClient";

export default async function ClientProfilePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const client = await getClientByIdAction(id);

  if (!client) {
    notFound();
  }

  return <ClientProfileClient initialClient={client} />;
}
