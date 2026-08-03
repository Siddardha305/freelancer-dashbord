'use client'

import { useState } from "react";
import { ClientProfileView } from "@/dashboard/clients/ClientProfileView";

import { Client } from "@/types/client";

export function ClientProfileClient({ initialClient }: { initialClient: Client }) {
  const [client, setClient] = useState(initialClient);

  return (
    <ClientProfileView 
      initialClient={client} 
      onSuccess={(updatedClient) => {
        if (updatedClient) {
          setClient(updatedClient);
        }
      }}
      isDrawerMode={false} 
    />
  );
}

