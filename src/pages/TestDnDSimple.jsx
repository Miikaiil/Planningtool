import React from "react";
import { DndProvider, useDragDropManager } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function TestDnDSimple() {
  const manager = useDragDropManager();
  return <div>DnD manager found? {manager ? "Yes" : "No"}</div>;
}
