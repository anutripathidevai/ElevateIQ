import {
  Bot,
  Braces,
  Brain,
  ClipboardCheck,
  FlaskConical,
  Layers,
  MessageSquareText,
  Network,
  Plug,
  Rocket,
  Search,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolve a serialisable icon name (stored on lab metadata) to a Lucide
 * component. Keeping icons out of the registry lets lab metadata stay a plain
 * serialisable object that can cross the server→client boundary.
 */
const LAB_ICONS: Record<string, LucideIcon> = {
  MessageSquareText,
  Braces,
  Search,
  Layers,
  Wrench,
  Plug,
  Bot,
  Brain,
  Network,
  ClipboardCheck,
  ShieldCheck,
  Rocket,
  FlaskConical,
};

export function resolveLabIcon(name: string): LucideIcon {
  return LAB_ICONS[name] ?? FlaskConical;
}
