import React, { useEffect, useRef, useState } from "react";

/*
  Advanced workflow builder (n8n-style) with:
  - Nodes with icons inside (Slack, AI, DB, etc.)
  - Ports for input/output/condition
  - Bezier curve edges
  - Conditional branching with true/false labels
  - Solid and dashed edges
*/

type PortType = "input" | "output" | "condition";
type NodeType = "task" | "decision" | "service";

type NodeItem = {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  title: string;
  icon?: string; // optional icon URL or emoji
};

type Edge = {
  id: string;
  from: { node: string; port: string };
  to: { node: string; port: string };
  dashed?: boolean;
  label?: string;
};

const uid = (prefix = "n") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<{ node: string; port: string } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Add node
  const addNode = (type: NodeType) => {
    const iconMap: Record<NodeType, string> = {
      task: "📦",
      decision: "❓",
      service: "⚙️",
    };
    const newNode: NodeItem = {
      id: uid("node"),
      x: 200 - offset.x,
      y: 150 - offset.y,
      type,
      title: type === "task" ? "Task" : type === "decision" ? "Decision" : "Service",
      icon: iconMap[type],
    };
    setNodes((s) => [...s, newNode]);
  };

  // Handle port click to connect
  const handlePortClick = (nodeId: string, port: string) => {
    if (!connectFrom) {
      setConnectFrom({ node: nodeId, port });
    } else {
      if (connectFrom.node !== nodeId) {
        const newEdge: Edge = {
          id: uid("e"),
          from: connectFrom,
          to: { node: nodeId, port },
          dashed: port === "memory" || port === "tool",
          label: connectFrom.port === "true" ? "true" : connectFrom.port === "false" ? "false" : undefined,
        };
        setEdges((e) => [...e, newEdge]);
      }
      setConnectFrom(null);
    }
  };

  // Draw curved edge
  const curvePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Toolbar */}
      <aside className="w-56 bg-gray-800 border-r border-gray-700 p-3 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Workflow</h2>
        <button onClick={() => addNode("task")} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm">
          + Task
        </button>
        <button onClick={() => addNode("decision")} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm">
          + Decision
        </button>
        <button onClick={() => addNode("service")} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-sm">
          + Service
        </button>
      </aside>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
        {/* Background grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            transform: `translate(${offset.x}px, ${offset.y}px)`,
          }}
        />

        {/* Edges */}
        <svg className="absolute inset-0 w-full h-full">
          {edges.map((ed) => {
            const fromNode = nodes.find((n) => n.id === ed.from.node);
            const toNode = nodes.find((n) => n.id === ed.to.node);
            if (!fromNode || !toNode) return null;

            const fromX = fromNode.x + offset.x + 140;
            const fromY = fromNode.y + offset.y + 30;
            const toX = toNode.x + offset.x;
            const toY = toNode.y + offset.y + 30;

            return (
              <g key={ed.id}>
                <path
                  d={curvePath(fromX, fromY, toX, toY)}
                  stroke="white"
                  strokeWidth={2}
                  strokeDasharray={ed.dashed ? "6 4" : ""}
                  fill="none"
                />
                {ed.label && (
                  <text
                    x={(fromX + toX) / 2}
                    y={(fromY + toY) / 2 - 4}
                    textAnchor="middle"
                    className="text-xs fill-white"
                  >
                    {ed.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} className="absolute inset-0">
          {nodes.map((n) => (
            <div
              key={n.id}
              onClick={() => setSelectedId(n.id)}
              className={`absolute w-40 p-3 rounded-lg border shadow-md bg-gray-800 border-gray-600 cursor-pointer ${selectedId === n.id ? "ring-2 ring-blue-400" : ""}`}
              style={{ left: n.x, top: n.y }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{n.icon}</span>
                <span className="font-medium text-sm">{n.title}</span>
              </div>
              {/* Ports */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-400 rounded-full cursor-crosshair" onClick={() => handlePortClick(n.id, "input")} />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full cursor-crosshair" onClick={() => handlePortClick(n.id, "output")} />
              {n.type === "decision" && (
                <>
                  <div className="absolute bottom-0 left-1/4 w-3 h-3 bg-yellow-400 rounded-full cursor-crosshair" onClick={() => handlePortClick(n.id, "true")} title="True" />
                  <div className="absolute bottom-0 right-1/4 w-3 h-3 bg-red-400 rounded-full cursor-crosshair" onClick={() => handlePortClick(n.id, "false")} title="False" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Inspector 
      <aside className="w-80 bg-gray-800 border-l border-gray-700 p-4 text-sm">
        {selectedId ? (
          <div>
            <h3 className="font-semibold mb-2">Inspector</h3>
            {JSON.stringify(nodes.find((n) => n.id === selectedId), null, 2)}
          </div>
        ) : (
          <div className="text-gray-400">Select a node to inspect</div>
        )}
      </aside>
    </div>*/}
    </div>
  );
}
