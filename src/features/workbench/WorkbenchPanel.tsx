import { useState, useEffect } from "react";
import { FormCard } from "@/components/FormCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { KeyPill } from "@/components/KeyPill";
import { useWorkbench, WorkbenchParams, WorkbenchResult } from "@/api/queries";
import { Play, Download, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { BitInspector } from "./BitInspector";
import { Timeline } from "./Timeline";
import defaultWorkbench from "@/assets/default-workbench.json";

export function WorkbenchPanel() {
  const { toast } = useToast();
  const workbench = useWorkbench();
  const [bitIndex, setBitIndex] = useState(0);
  const [defaultData, setDefaultData] = useState<WorkbenchResult | null>(null);

  const [params, setParams] = useState<WorkbenchParams>({
    protocol: "bb84",
    key_len: 64,
    noise: 0.1,
    eve_prob: 0.2,
    sample_frac: 0.5,
    seed: undefined,
  });

  useEffect(() => {
    // Transform the default JSON to match WorkbenchResult format
    const transformed: WorkbenchResult = {
      protocol: defaultWorkbench.protocol,
      params: {
        protocol: defaultWorkbench.protocol as "bb84" | "e91",
        key_len: defaultWorkbench.params.key_len,
        noise: defaultWorkbench.params.noise_level,
        eve_prob: defaultWorkbench.params.eve_prob,
        sample_frac: defaultWorkbench.params.sample_frac,
        seed: defaultWorkbench.params.seed ?? undefined,
      },
      trace: defaultWorkbench.trace
    };
    setDefaultData(transformed);
  }, []);

  const handleRun = () => {
    workbench.mutate(params, {
      onSuccess: () => {
        setBitIndex(0);
        toast({ title: "Workbench Complete", description: "Protocol trace generated successfully" });
      },
      onError: (error) => {
        toast({ title: "Workbench Failed", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleDownload = () => {
    const data = workbench.data || defaultData;
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workbench_${Date.now()}.json`;
    a.click();
    toast({ title: "Downloaded", description: "Trace saved as JSON" });
  };

  const displayData = workbench.data || defaultData;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      <FormCard title="Protocol Parameters" description="Configure step-by-step simulation" className="lg:col-span-1">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Protocol</Label>
            <Select value={params.protocol} onValueChange={(v) => setParams({ ...params, protocol: v as "bb84" | "e91" })}>
              <SelectTrigger className="bg-muted/50 border-quantum-cyan/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bb84">BB84</SelectItem>
                <SelectItem value="e91">E91</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Key Length (bits)</Label>
            <Input
              type="number"
              min="8"
              max="4096"
              value={params.key_len}
              onChange={(e) => setParams({ ...params, key_len: parseInt(e.target.value) })}
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>

          <div className="space-y-2">
            <Label>Noise Level: {params.noise.toFixed(2)}</Label>
            <Slider
              value={[params.noise]}
              onValueChange={([v]) => setParams({ ...params, noise: v })}
              min={0}
              max={1}
              step={0.01}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Eve Probability: {params.eve_prob.toFixed(2)}</Label>
            <Slider
              value={[params.eve_prob]}
              onValueChange={([v]) => setParams({ ...params, eve_prob: v })}
              min={0}
              max={1}
              step={0.01}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Sample Fraction: {params.sample_frac.toFixed(2)}</Label>
            <Slider
              value={[params.sample_frac]}
              onValueChange={([v]) => setParams({ ...params, sample_frac: v })}
              min={0}
              max={0.9}
              step={0.01}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Seed (optional)</Label>
            <Input
              type="number"
              value={params.seed ?? ""}
              onChange={(e) => setParams({ ...params, seed: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Random"
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleRun}
              disabled={workbench.isPending}
              className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
            >
              {workbench.isPending ? (
                "Running..."
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Workbench
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
        </div>
      </FormCard>

      <div className="lg:col-span-2 space-y-6">
        {workbench.isPending && <LoadingSkeleton />}

        {displayData && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Badge variant="outline" className="p-3 justify-center border-quantum-cyan/30 bg-quantum-cyan/5">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">QBER</div>
                  <div className="text-2xl font-bold text-quantum-cyan">{displayData.trace.qber.toFixed(4)}</div>
                </div>
              </Badge>
              <Badge variant="outline" className="p-3 justify-center border-quantum-purple/30 bg-quantum-purple/5">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Final Key Length</div>
                  <div className="text-2xl font-bold text-quantum-purple">
                    {displayData.trace.final_key_alice.length}
                  </div>
                </div>
              </Badge>
              <Badge
                variant="outline"
                className={`p-3 justify-center ${
                  displayData.trace.keys_match
                    ? "border-quantum-cyan/30 bg-quantum-cyan/5"
                    : "border-destructive/30 bg-destructive/5"
                }`}
              >
                <div className="text-center">
                  {displayData.trace.keys_match ? (
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-quantum-cyan" />
                  ) : (
                    <XCircle className="h-6 w-6 mx-auto mb-1 text-destructive" />
                  )}
                  <div className="text-xs font-medium">
                    {displayData.trace.keys_match ? "Keys Match" : "Keys Mismatch"}
                  </div>
                </div>
              </Badge>
            </div>

            <ChartCard title="Bit Inspector" description="Scrub through the protocol execution">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bit Index: {bitIndex}</Label>
                  <Slider
                    value={[bitIndex]}
                    onValueChange={([v]) => setBitIndex(v)}
                    min={0}
                    max={displayData.trace.alice_bits.length - 1}
                    step={1}
                    className="py-2"
                  />
                </div>
                <BitInspector trace={displayData.trace} bitIndex={bitIndex} />
              </div>
            </ChartCard>

            <Timeline trace={displayData.trace} currentIndex={bitIndex} />

            <ChartCard title="Final Keys" description="Generated quantum keys">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Alice's Key</Label>
                  <KeyPill
                    value={displayData.trace.final_key_alice.join("")}
                    className="w-full justify-start text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Bob's Key</Label>
                  <KeyPill
                    value={displayData.trace.final_key_bob.join("")}
                    className="w-full justify-start text-sm"
                  />
                </div>
              </div>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
