import {
  Boxes,
  Cloud,
  Database,
  Gauge,
  Globe,
  HardDrive,
  Layers,
  ListOrdered,
  Network,
  Search,
  Server,
  Smartphone,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { AccentKey } from "@/lib/navigation";
import type { SDNodeKind } from "../types";

/** Visual mapping for architecture-diagram node kinds → icon + accent colour. */
export const SD_NODE_STYLES: Record<
  SDNodeKind,
  { icon: LucideIcon; accent: AccentKey; label: string }
> = {
  client: { icon: Smartphone, accent: "slate", label: "Client" },
  cdn: { icon: Globe, accent: "cyan", label: "CDN" },
  loadBalancer: { icon: Network, accent: "blue", label: "Load Balancer" },
  gateway: { icon: Workflow, accent: "blue", label: "Gateway" },
  service: { icon: Server, accent: "violet", label: "Service" },
  worker: { icon: Gauge, accent: "orange", label: "Worker" },
  cache: { icon: Zap, accent: "rose", label: "Cache" },
  database: { icon: Database, accent: "emerald", label: "Database" },
  queue: { icon: ListOrdered, accent: "orange", label: "Queue" },
  storage: { icon: HardDrive, accent: "emerald", label: "Storage" },
  search: { icon: Search, accent: "cyan", label: "Search" },
  monitoring: { icon: Gauge, accent: "rose", label: "Monitoring" },
  analytics: { icon: Layers, accent: "violet", label: "Analytics" },
  external: { icon: Cloud, accent: "slate", label: "External" },
};

/** Fallback icon for unknown/component kinds. */
export const SD_FALLBACK_ICON = Boxes;
