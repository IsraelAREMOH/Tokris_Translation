import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    columns: {
      setColumns: () => ReturnType;
    };
  }
}

/** A single column's block content — always a child of columnSet. */
export const Column = Node.create({
  name: "column",
  content: "block+",

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column", class: "blog-column" }),
      0,
    ];
  },
});

/**
 * Fixed 2-column layout — "if practical" per the brief, so no add/remove
 * column UI; just a CSS grid wrapper with exactly two column children.
 */
export const ColumnSet = Node.create({
  name: "columnSet",
  group: "block",
  content: "column column",
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="column-set"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "column-set", class: "blog-columns" }),
      0,
    ];
  },

  addCommands() {
    return {
      setColumns:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              { type: "column", content: [{ type: "paragraph" }] },
              { type: "column", content: [{ type: "paragraph" }] },
            ],
          }),
    };
  },
});
