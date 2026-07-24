"use client";

import type { Editor } from "@tiptap/react";
import { Highlighter, Palette } from "lucide-react";

import { ToolbarButton } from "@/components/admin/blog/editor/toolbar-primitives";
import { DropdownMenu } from "@/components/ui/dropdown-menu";

// Curated, brand-consistent swatches — not a free color picker, so authors
// can't pick something that clashes with the design system.
const TEXT_COLORS = [
  { label: "Foreground", value: "#17211d" },
  { label: "Brand", value: "#257a6f" },
  { label: "Sand", value: "#b3742c" },
  { label: "Seal", value: "#ab4f2d" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#15803d" },
  { label: "Red", value: "#dc2626" },
];

const HIGHLIGHT_COLORS = [
  { label: "Sand", value: "#f9efdd" },
  { label: "Brand", value: "#dbf2ed" },
  { label: "Yellow", value: "#fef9c3" },
  { label: "Pink", value: "#fee2e2" },
  { label: "Blue", value: "#dbeafe" },
  { label: "Green", value: "#dcfce7" },
];

function SwatchGrid({
  swatches,
  onPick,
  onReset,
}: {
  swatches: { label: string; value: string }[];
  onPick: (color: string) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex w-44 flex-col gap-2 p-1.5">
      <div className="grid grid-cols-7 gap-1.5">
        {swatches.map((swatch) => (
          <button
            key={swatch.value}
            type="button"
            onClick={() => onPick(swatch.value)}
            aria-label={swatch.label}
            title={swatch.label}
            style={{ backgroundColor: swatch.value }}
            className="h-6 w-6 rounded-full border border-border transition-transform duration-200 ease-spring hover:scale-110 active:scale-95"
          />
        ))}
      </div>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg px-2 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
      >
        Reset
      </button>
    </div>
  );
}

export function TextColorPicker({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <ToolbarButton icon={Palette} label="Text color" onClick={toggle} />
      )}
    >
      {(close) => (
        <SwatchGrid
          swatches={TEXT_COLORS}
          onPick={(color) => {
            editor.chain().focus().setColor(color).run();
            close();
          }}
          onReset={() => {
            editor.chain().focus().unsetColor().run();
            close();
          }}
        />
      )}
    </DropdownMenu>
  );
}

export function HighlightPicker({ editor }: { editor: Editor }) {
  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <ToolbarButton icon={Highlighter} label="Highlight" onClick={toggle} />
      )}
    >
      {(close) => (
        <SwatchGrid
          swatches={HIGHLIGHT_COLORS}
          onPick={(color) => {
            editor.chain().focus().toggleHighlight({ color }).run();
            close();
          }}
          onReset={() => {
            editor.chain().focus().unsetHighlight().run();
            close();
          }}
        />
      )}
    </DropdownMenu>
  );
}
