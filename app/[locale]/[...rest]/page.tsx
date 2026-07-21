import { notFound } from "next/navigation";

// Catches every unknown path inside a valid locale and renders not-found.tsx
export default function CatchAllPage() {
  notFound();
}
