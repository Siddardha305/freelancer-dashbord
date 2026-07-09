'use client';

import React, { createContext, useContext, useState } from 'react';

export type WorkspaceType = 'video_editing' | 'digital_marketing' | 'photography' | 'general' | 'corporate';

export interface WorkspaceTerms {
  singular: string;      // e.g. "Thumbnail"
  plural: string;        // e.g. "Thumbnails"
  delivery: string;      // e.g. "Thumbnail Deliveries"
  placeholderTask: string; // e.g. "GTA 5 Mod Thumbnail"
  unitName: string;      // e.g. "/Thumbnail"
  unitShort: string;     // e.g. "thumbnail"
  perUnitText: string;   // e.g. "Pay Per Delivery" or "Pay Per Thumbnail"
}

interface WorkspaceContextType {
  workspaceType: WorkspaceType;
  terms: WorkspaceTerms;
  setWorkspaceType: (type: WorkspaceType) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const termsMap: Record<WorkspaceType, WorkspaceTerms> = {
  video_editing: {
    singular: 'Thumbnail',
    plural: 'Thumbnails',
    delivery: 'Thumbnail Deliveries',
    placeholderTask: 'GTA 5 Mod Thumbnail',
    unitName: '/Thumbnail',
    unitShort: 'thumbnail',
    perUnitText: 'Pay Per Delivery',
  },
  digital_marketing: {
    singular: 'Campaign',
    plural: 'Campaigns',
    delivery: 'Marketing Campaigns',
    placeholderTask: 'Facebook Ad Lead Generation',
    unitName: '/Campaign',
    unitShort: 'campaign',
    perUnitText: 'Pay Per Campaign',
  },
  photography: {
    singular: 'Photoshoot',
    plural: 'Photoshoots',
    delivery: 'Photo Deliveries',
    placeholderTask: 'Outdoor Portrait Session',
    unitName: '/Photoshoot',
    unitShort: 'shoot',
    perUnitText: 'Pay Per Photoshoot',
  },
  general: {
    singular: 'Deliverable',
    plural: 'Deliverables',
    delivery: 'Project Deliverables',
    placeholderTask: 'Website UI Design Prototype',
    unitName: '/Deliverable',
    unitShort: 'deliverable',
    perUnitText: 'Pay Per Deliverable',
  },
  corporate: {
    singular: 'Deliverable',
    plural: 'Deliverables',
    delivery: 'Corporate Deliveries',
    placeholderTask: 'Annual Financial Audit Report',
    unitName: '/Task',
    unitShort: 'task',
    perUnitText: 'Pay Per Task',
  },
};

export function WorkspaceProvider({
  children,
  initialWorkspaceType = 'video_editing',
}: {
  children: React.ReactNode;
  initialWorkspaceType?: string;
}) {
  const [workspaceType, setWorkspaceState] = useState<WorkspaceType>(
    (initialWorkspaceType as WorkspaceType) || 'video_editing'
  );
  const [prevInitial, setPrevInitial] = useState(initialWorkspaceType);

  if (initialWorkspaceType !== prevInitial) {
    setPrevInitial(initialWorkspaceType);
    setWorkspaceState((initialWorkspaceType as WorkspaceType) || 'video_editing');
  }

  const setWorkspaceType = (type: WorkspaceType) => {
    setWorkspaceState(type);
  };

  const terms = termsMap[workspaceType] || termsMap.general;

  return (
    <WorkspaceContext.Provider value={{ workspaceType, terms, setWorkspaceType }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspaceType: 'video_editing' as WorkspaceType,
      terms: termsMap.video_editing,
      setWorkspaceType: () => {},
    };
  }
  return context;
}
