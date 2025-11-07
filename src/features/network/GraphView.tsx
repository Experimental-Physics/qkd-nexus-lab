import { ChartCard } from "@/components/ChartCard";
import { NetworkData } from "@/api/queries";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

interface GraphViewProps {
  data: NetworkData;
  selectedNode: number | null;
  onSelectNode: (node: number) => void;
}

export function GraphView({ data, selectedNode, onSelectNode }: GraphViewProps) {
  const positions = useMemo(() => {
    const n = data.num_nodes;
    const radius = 120;
    const centerX = 180;
    const centerY = 180;
    
    return Array.from({ length: n }, (_, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [data.num_nodes]);

  return (
    <ChartCard title="Network Graph" description="Click nodes to view metrics">
      <svg viewBox="0 0 360 360" className="w-full h-[360px]">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--quantum-cyan))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--quantum-purple))" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {data.edges.map(([from, to], i) => {
          const hasKey = data.keys[from]?.includes(to) || data.keys[to]?.includes(from);
          return (
            <line
              key={i}
              x1={positions[from].x}
              y1={positions[from].y}
              x2={positions[to].x}
              y2={positions[to].y}
              stroke={hasKey ? "url(#edgeGradient)" : "hsl(var(--border))"}
              strokeWidth={hasKey ? 2 : 1}
              strokeDasharray={hasKey ? "0" : "4 2"}
              className="transition-all"
            />
          );
        })}

        {/* Nodes */}
        {positions.map((pos, i) => {
          const isSelected = selectedNode === i;
          const hasKeys = (data.keys[i]?.length || 0) > 0;
          
          return (
            <g key={i} className="cursor-pointer transition-all" onClick={() => onSelectNode(i)}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 20 : 16}
                fill={hasKeys ? "hsl(var(--quantum-cyan) / 0.2)" : "hsl(var(--muted))"}
                stroke={isSelected ? "hsl(var(--quantum-cyan))" : hasKeys ? "hsl(var(--quantum-blue))" : "hsl(var(--border))"}
                strokeWidth={isSelected ? 3 : 2}
                filter={isSelected ? "url(#glow)" : "none"}
                className="transition-all"
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--foreground))"
                fontSize="14"
                fontWeight="bold"
              >
                {i}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-4 flex flex-wrap gap-2">
        {positions.map((_, i) => {
          const keyCount = data.keys[i]?.length || 0;
          return (
            <Badge
              key={i}
              variant={selectedNode === i ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                selectedNode === i
                  ? "bg-quantum-cyan/20 border-quantum-cyan text-quantum-cyan"
                  : "border-quantum-cyan/20 hover:bg-quantum-cyan/10"
              }`}
              onClick={() => onSelectNode(i)}
            >
              Node {i} {keyCount > 0 && `(${keyCount} keys)`}
            </Badge>
          );
        })}
      </div>
    </ChartCard>
  );
}
