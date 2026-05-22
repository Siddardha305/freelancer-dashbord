'use client'

import { useState } from "react";
import { ClientProfileView } from "@/dashboard/clients/components/ClientProfileView";

export function ClientProfileClient({ initialClient }: { initialClient: any }) {
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

