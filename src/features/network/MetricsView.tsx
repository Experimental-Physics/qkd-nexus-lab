import { ChartCard } from "@/components/ChartCard";
import { MiniSparkline } from "@/components/MiniSparkline";
import { useMetrics } from "@/api/queries";
import { Badge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface MetricsViewProps {
  nodeId: number | null;
}

export function MetricsView({ nodeId }: MetricsViewProps) {
  const metrics = useMetrics(nodeId);

  if (nodeId === null) {
    return (
      <ChartCard title="Node Metrics" description="Select a node to view metrics">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Click a node on the graph to view its metrics
        </div>
      </ChartCard>
    );
  }

  if (metrics.isLoading) {
    return (
      <ChartCard title={`Node ${nodeId} Metrics`}>
        <LoadingSkeleton />
      </ChartCard>
    );
  }

  if (!metrics.data || Object.keys(metrics.data).length === 0) {
    return (
      <ChartCard title={`Node ${nodeId} Metrics`}>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No metrics available for this node
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title={`Node ${nodeId} Metrics`} description="Per-neighbor QBER and noise levels">
      <div className="space-y-4">
        {Object.entries(metrics.data).map(([neighbor, data]) => (
          <div key={neighbor} className="p-4 rounded-lg border border-quantum-cyan/20 bg-quantum-cyan/5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="border-quantum-cyan/30">
                Neighbor: Node {neighbor}
              </Badge>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Avg QBER: {(data.qber.reduce((a, b) => a + b, 0) / data.qber.length).toFixed(4)}</span>
                <span>Avg Noise: {(data.noise.reduce((a, b) => a + b, 0) / data.noise.length).toFixed(4)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">QBER History</div>
                <MiniSparkline data={data.qber} color="hsl(var(--quantum-cyan))" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Noise History</div>
                <MiniSparkline data={data.noise} color="hsl(var(--quantum-purple))" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
