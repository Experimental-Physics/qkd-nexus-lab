import { useState } from "react";
import { FormCard } from "@/components/FormCard";
import { GraphView } from "./GraphView";
import { MetricsView } from "./MetricsView";
import { ChatView } from "./ChatView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRebuild, useNetwork, RebuildParams } from "@/api/queries";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function NetworkPanel() {
  const { toast } = useToast();
  const rebuild = useRebuild();
  const network = useNetwork();
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const [params, setParams] = useState<RebuildParams>({
    num_nodes: 6,
    noise_min: 0.0,
    noise_max: 0.05,
    eve_prob: 0.0,
    protocol: "mixed",
  });

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
        <Button
          onClick={handleRebuild}
          disabled={rebuild.isPending || network.isLoading}
          className="w-full mt-4 bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
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
      </FormCard>

      {network.isLoading && <LoadingSkeleton />}

      {network.data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraphView data={network.data} selectedNode={selectedNode} onSelectNode={setSelectedNode} />
            <MetricsView nodeId={selectedNode} />
          </div>

          <ChatView />
        </>
      )}
    </div>
  );
}
