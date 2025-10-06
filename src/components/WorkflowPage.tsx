import React, { useEffect, useRef, useState } from "react";
import { Plus, Play, Trash2, Settings, Download, Upload } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type PortType = "input" | "output" | "condition";
type NodeType = "task" | "decision" | "service" | "start" | "end";

type NodeItem = {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  title: string;
  icon?: string;
  color?: string;
};

type Edge = {
  id: string;
  from: { node: string; port: string };
  to: { node: string; port: string };
  dashed?: boolean;
  label?: string;
};

const uid = (prefix = "n") => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

const NODE_STYLES = {
  start: { icon: "▶️", color: "from-green-500/20 to-green-600/30 border-green-500" },
  end: { icon: "⏹️", color: "from-red-500/20 to-red-600/30 border-red-500" },
  task: { icon: "📦", color: "from-blue-500/20 to-blue-600/30 border-blue-500" },
  decision: { icon: "❓", color: "from-yellow-500/20 to-yellow-600/30 border-yellow-500" },
  service: { icon: "⚙️", color: "from-purple-500/20 to-purple-600/30 border-purple-500" },
};

export default function WorkflowPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<{ node: string; port: string } | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadWorkflow();
  }, []);

  const loadWorkflow = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('title', 'workflow_data')
      .maybeSingle();

    if (data?.content) {
      try {
        const workflow = JSON.parse(data.content);
        setNodes(workflow.nodes || []);
        setEdges(workflow.edges || []);
      } catch (e) {
        console.error('Failed to parse workflow', e);
      }
    }
  };

  const saveWorkflow = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to save", variant: "destructive" });
      return;
    }

    const workflow = { nodes, edges };
    const { error } = await supabase
      .from('pages')
      .upsert({
        user_id: user.id,
        title: 'workflow_data',
        content: JSON.stringify(workflow),
        order_index: 0,
      });

    if (error) {
      toast({ title: "Error", description: "Failed to save workflow", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Workflow saved successfully" });
    }
  };

  const addNode = (type: NodeType) => {
    const style = NODE_STYLES[type];
    const newNode: NodeItem = {
      id: uid("node"),
      x: 200 - offset.x,
      y: 150 - offset.y,
      type,
      title: type.charAt(0).toUpperCase() + type.slice(1),
      icon: style.icon,
      color: style.color,
    };
    setNodes((s) => [...s, newNode]);
  };

  const deleteNode = () => {
    if (!selectedId) return;
    setNodes((s) => s.filter((n) => n.id !== selectedId));
    setEdges((e) => e.filter((ed) => ed.from.node !== selectedId && ed.to.node !== selectedId));
    setSelectedId(null);
  };

  const handlePortClick = (nodeId: string, port: string) => {
    if (!connectFrom) {
      setConnectFrom({ node: nodeId, port });
    } else {
      if (connectFrom.node !== nodeId) {
        const newEdge: Edge = {
          id: uid("e"),
          from: connectFrom,
          to: { node: nodeId, port },
          dashed: port === "condition",
          label: connectFrom.port === "true" ? "✓" : connectFrom.port === "false" ? "✗" : undefined,
        };
        setEdges((e) => [...e, newEdge]);
      }
      setConnectFrom(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragNodeId(nodeId);
      setSelectedId(nodeId);
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (isDragging && dragNodeId) {
      setNodes((ns) =>
        ns.map((n) =>
          n.id === dragNodeId
            ? { ...n, x: e.clientX - offset.x - 70, y: e.clientY - offset.y - 30 }
            : n
        )
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDragging(false);
    setDragNodeId(null);
  };

  const curvePath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  };

  const selectedNode = nodes.find((n) => n.id === selectedId);

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-background via-background to-muted">
      {/* Top Toolbar */}
      <div className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Workflow Builder
        </h1>
        <div className="flex gap-2">
          <Button onClick={saveWorkflow} variant="default" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={loadWorkflow} variant="outline" size="sm">
            <Upload className="w-4 h-4 mr-2" />
            Load
          </Button>
          {selectedId && (
            <Button onClick={deleteNode} variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-card/30 backdrop-blur-sm p-4 space-y-3">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Flow Controls</h2>
            <Button onClick={() => addNode("start")} variant="outline" className="w-full justify-start" size="sm">
              <span className="mr-2">▶️</span> Start
            </Button>
            <Button onClick={() => addNode("end")} variant="outline" className="w-full justify-start" size="sm">
              <span className="mr-2">⏹️</span> End
            </Button>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</h2>
            <Button onClick={() => addNode("task")} variant="outline" className="w-full justify-start" size="sm">
              <span className="mr-2">📦</span> Task
            </Button>
            <Button onClick={() => addNode("service")} variant="outline" className="w-full justify-start" size="sm">
              <span className="mr-2">⚙️</span> Service
            </Button>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Logic</h2>
            <Button onClick={() => addNode("decision")} variant="outline" className="w-full justify-start" size="sm">
              <span className="mr-2">❓</span> Decision
            </Button>
          </div>

          {selectedNode && (
            <div className="pt-4 mt-4 border-t space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Selected Node</h2>
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <div className="text-xs text-muted-foreground">Type</div>
                <div className="font-medium">{selectedNode.type}</div>
                <div className="text-xs text-muted-foreground mt-2">Title</div>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    setNodes((ns) =>
                      ns.map((n) => (n.id === selectedId ? { ...n, title: e.target.value } : n))
                    );
                  }}
                  className="w-full px-2 py-1 text-sm bg-background border rounded"
                />
              </div>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <div
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--muted-foreground) / 0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              transform: `translate(${offset.x}px, ${offset.y}px)`,
            }}
          />

          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {edges.map((ed) => {
              const fromNode = nodes.find((n) => n.id === ed.from.node);
              const toNode = nodes.find((n) => n.id === ed.to.node);
              if (!fromNode || !toNode) return null;

              const fromX = fromNode.x + offset.x + 160;
              const fromY = fromNode.y + offset.y + 40;
              const toX = toNode.x + offset.x;
              const toY = toNode.y + offset.y + 40;

              return (
                <g key={ed.id}>
                  <path
                    d={curvePath(fromX, fromY, toX, toY)}
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray={ed.dashed ? "6 4" : ""}
                    fill="none"
                    opacity={0.6}
                  />
                  {ed.label && (
                    <text
                      x={(fromX + toX) / 2}
                      y={(fromY + toY) / 2 - 8}
                      textAnchor="middle"
                      className="text-xs fill-primary font-semibold"
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
                onMouseDown={(e) => handleMouseDown(e, n.id)}
                className={`absolute w-40 p-4 rounded-xl border-2 shadow-lg cursor-move transition-all hover:shadow-xl ${
                  selectedId === n.id ? "ring-4 ring-primary/50 scale-105" : ""
                } bg-gradient-to-br ${n.color} backdrop-blur-sm`}
                style={{ left: n.x, top: n.y }}
              >
                <div className="flex items-center gap-2 pointer-events-none">
                  <span className="text-2xl">{n.icon}</span>
                  <span className="font-semibold text-sm truncate">{n.title}</span>
                </div>

                {/* Ports */}
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-crosshair pointer-events-auto hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePortClick(n.id, "input");
                  }}
                />
                <div
                  className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full cursor-crosshair pointer-events-auto hover:scale-125 transition-transform"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePortClick(n.id, "output");
                  }}
                />
                {n.type === "decision" && (
                  <>
                    <div
                      className="absolute bottom-0 left-1/4 w-4 h-4 bg-green-500 rounded-full cursor-crosshair pointer-events-auto hover:scale-125 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortClick(n.id, "true");
                      }}
                      title="True"
                    />
                    <div
                      className="absolute bottom-0 right-1/4 w-4 h-4 bg-red-500 rounded-full cursor-crosshair pointer-events-auto hover:scale-125 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePortClick(n.id, "false");
                      }}
                      title="False"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
