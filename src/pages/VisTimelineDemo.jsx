import React, { useRef, useEffect } from "react";
import { DataSet, Timeline } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";

export default function VisTimelineDemo({ groups, items, options }) {
  const containerRef = useRef();

  useEffect(() => {
    const timeline = new Timeline(containerRef.current, new DataSet(items), new DataSet(groups), options);
    return () => {
      timeline.destroy();
    };
  }, [groups, items, options]);

  return <div ref={containerRef} style={{ height: 400 }} />;
}
