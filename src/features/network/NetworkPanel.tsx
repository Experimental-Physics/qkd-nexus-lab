import { useState, useEffect } from "react";
import { FormCard } from "@/components/FormCard";
import { GraphView } from "./GraphView";
import { MetricsView } from "./MetricsView";
import { ChatView } from "./ChatView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRebuild, useNetwork, RebuildParams, NetworkData } from "@/api/queries";
import { RefreshCw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import defaultNetwork from "@/assets/default-network.json";

export function NetworkPanel() {
  const { toast } = useToast();
  const rebuild = useRebuild();
  const network = useNetwork(false); // Disable auto-fetch, we'll use default data
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const [defaultData, setDefaultData] = useState<NetworkData | null>(null);

  const [params, setParams] = useState<RebuildParams>({
    num_nodes: 6,
    noise_min: 0.0,
    noise_max: 0.05,
    eve_prob: 0.0,
    protocol: "mixed",
  });

  useEffect(() => {
    // Transform default data to match NetworkData interface
    const transformed: NetworkData = {
      num_nodes: defaultNetwork.num_nodes,
      edges: defaultNetwork.edges.map(e => [e[0], e[1]] as [number, number]),
      keys: defaultNetwork.keys as Record<string, number[]>,
      metrics: defaultNetwork.metrics as Record<string, Record<string, { qber: number[]; noise: number[] }>>
    };
    setDefaultData(transformed);
  }, []);

  const handleRebuild = () => {
    rebuild.mutate(params, {
      onSuccess: () => {
        network.refetch();
        toast({ title: "Network Rebuilt", description: `Created network with ${params.num_nodes} nodes` });
      },
      onError: (error) => {
        toast({ title: "Rebuild Failed", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleDownload = () => {
    if (!displayData) return;
    const json = JSON.stringify(displayData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network_${Date.now()}.json`;
    a.click();
    toast({ title: "Downloaded", description: "Network data saved as JSON" });
  };

  const displayData = network.data || defaultData;

  return (
    <div className="space-y-6 animate-fade-in">
      <FormCard title="Network Configuration" description="Build and configure the QKD network">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Nodes</Label>
            <Input
              type="number"
              min="2"
              max="20"
              value={params.num_nodes}
              onChange={(e) => setParams({ ...params, num_nodes: parseInt(e.target.value) })}
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>
          <div className="space-y-2">
            <Label>Noise Min</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.noise_min}
              onChange={(e) => setParams({ ...params, noise_min: parseFloat(e.target.value) })}
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>
          <div className="space-y-2">
            <Label>Noise Max</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.noise_max}
              onChange={(e) => setParams({ ...params, noise_max: parseFloat(e.target.value) })}
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>
          <div className="space-y-2">
            <Label>Eve Probability</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={params.eve_prob}
              onChange={(e) => setParams({ ...params, eve_prob: parseFloat(e.target.value) })}
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>
          <div className="space-y-2">
            <Label>Protocol</Label>
            <Select value={params.protocol} onValueChange={(v) => setParams({ ...params, protocol: v as any })}>
              <SelectTrigger className="bg-muted/50 border-quantum-cyan/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bb84">BB84</SelectItem>
                <SelectItem value="e91">E91</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleRebuild}
            disabled={rebuild.isPending || network.isLoading}
            className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
          >
            {rebuild.isPending ? (
              "Rebuilding..."
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Rebuild Network
              </>
            )}
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!displayData}
            variant="outline"
            className="border-quantum-purple/30 hover:bg-quantum-purple/10"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </FormCard>

      {network.isLoading && <LoadingSkeleton />}

      {displayData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphView data={displayData} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
            <MetricsView nodeId={selectedNode} metricsData={selectedNode !== null ? displayData.metrics[selectedNode.toString()] : undefined} />
          </div>

          <ChatView />
        </>
      )}
    </div>
  );
}
