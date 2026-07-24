"use client";

import type { Editor } from "@tiptap/react";
import { MessageSquareWarning } from "lucide-react";

import { CALLOUT_VARIANT_META } from "@/components/admin/blog/editor/callout-variant-meta";
import { ToolbarButton } from "@/components/admin/blog/editor/toolbar-primitives";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { CALLOUT_VARIANTS } from "@/lib/blog/editor/extensions/callout";

export function CalloutInsertPopover({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <ToolbarButton icon={MessageSquareWarning} label="Insert callout" onClick={toggle} />
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          {CALLOUT_VARIANTS.map((variant) => {
            const meta = CALLOUT_VARIANT_META[variant];
            return (
              <DropdownMenuItem
                key={variant}
                onSelect={() => {
                  editor.chain().focus().setCallout(variant).run();
                  close();
                }}
              >
                <meta.icon className="h-4 w-4" />
                {meta.label}
              </DropdownMenuItem>
            );
          })}
        </div>
      )}
    </DropdownMenu>
  );
}
