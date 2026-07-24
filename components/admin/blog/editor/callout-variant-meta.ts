import { AlertOctagon, AlertTriangle, CheckCircle2, Info, type LucideIcon } from "lucide-react";

import type { CalloutVariant } from "@/lib/blog/editor/extensions/callout";

export const CALLOUT_VARIANT_META: Record<CalloutVariant, { label: string; icon: LucideIcon }> = {
  info: { label: "Info", icon: Info },
  success: { label: "Success", icon: CheckCircle2 },
  warning: { label: "Warning", icon: AlertTriangle },
  danger: { label: "Danger", icon: AlertOctagon },
};
