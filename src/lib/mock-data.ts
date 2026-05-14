import { Client } from "@/types/client";

export const mockClients: Client[] = [
  { 
    id: "c_1", 
    name: "MrBeast Gaming", 
    niche: "Gaming", 
    status: "Active", 
    monthlyPrice: 1500, 
    email: "contact@mrbeast.com", 
    joinedDate: "Jan 2023" 
  },
  { 
    id: "c_2", 
    name: "TechLead", 
    niche: "Tech & Coding", 
    status: "Active", 
    monthlyPrice: 800, 
    email: "hello@techlead.com", 
    joinedDate: "Mar 2023" 
  },
  { 
    id: "c_3", 
    name: "Ali Abdaal", 
    niche: "Productivity", 
    status: "Paused", 
    monthlyPrice: 1200, 
    email: "team@aliabdaal.com", 
    joinedDate: "Feb 2023" 
  },
  { 
    id: "c_4", 
    name: "Marques Brownlee", 
    niche: "Tech Reviews", 
    status: "Active", 
    monthlyPrice: 2000, 
    email: "business@mkbhd.com", 
    joinedDate: "May 2023" 
  },
  { 
    id: "c_5", 
    name: "Iman Gadzhi", 
    niche: "Business", 
    status: "Active", 
    monthlyPrice: 1800, 
    email: "contact@iman.com", 
    joinedDate: "Aug 2023" 
  },
  { 
    id: "c_6", 
    name: "Alex Hormozi", 
    niche: "Business", 
    status: "Inactive", 
    monthlyPrice: 1500, 
    email: "team@acquisition.com", 
    joinedDate: "Sep 2023" 
  },
];
