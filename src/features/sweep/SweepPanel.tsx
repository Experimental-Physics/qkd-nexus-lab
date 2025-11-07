import { useState } from "react";
import { FormCard } from "@/components/FormCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSweep, SweepParams, SweepResult } from "@/api/queries";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Play, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export function SweepPanel() {
  const { toast } = useToast();
  const sweep = useSweep();
  
  const [params, setParams] = useState<SweepParams>({
    noise_min: 0.0,
    noise_max: 0.12,
    num: 25,
    n_bits: 256,
    eve: false,
    protocol: "bb84",
  });

  const [history, setHistory] = useState<Array<{ params: SweepParams; result: SweepResult; timestamp: number }>>([]);

  const handleRun = () => {
    sweep.mutate(params, {
      onSuccess: (result) => {
        setHistory((prev) => [{ params, result, timestamp: Date.now() }, ...prev].slice(0, 5));
        toast({ title: "Sweep Complete", description: `Analyzed ${result.noise.length} noise levels` });
      },
      onError: (error) => {
        toast({ title: "Sweep Failed", description: error.message, variant: "destructive" });
      },
    });
  };

  const handleExport = () => {
    if (!sweep.data) return;
    const csv = [
      ["Noise", "QBER", "Success"],
      ...sweep.data.noise.map((n, i) => [n, sweep.data!.qber[i], sweep.data!.success[i]]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sweep_${Date.now()}.csv`;
    a.click();
    toast({ title: "Exported", description: "CSV downloaded successfully" });
  };

  const chartData = sweep.data
    ? sweep.data.noise.map((n, i) => ({
        noise: n.toFixed(4),
        qber: sweep.data!.qber[i],
        success: sweep.data!.success[i] ? 1 : 0,
      }))
    : [];

  const stats = sweep.data
    ? {
        minQber: Math.min(...sweep.data.qber),
        maxQber: Math.max(...sweep.data.qber),
        successRate: (sweep.data.success.filter(Boolean).length / sweep.data.success.length) * 100,
      }
    : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <FormCard title="Sweep Parameters" description="Configure QBER vs Noise analysis">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Points</Label>
              <Input
                type="number"
                min="2"
                max="400"
                value={params.num}
                onChange={(e) => setParams({ ...params, num: parseInt(e.target.value) })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Key Bits</Label>
              <Input
                type="number"
                min="8"
                max="8192"
                value={params.n_bits}
                onChange={(e) => setParams({ ...params, n_bits: parseInt(e.target.value) })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch checked={params.eve} onCheckedChange={(checked) => setParams({ ...params, eve: checked })} />
            <Label>Enable Eve (Eavesdropper)</Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleRun}
              disabled={sweep.isPending}
              className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
            >
              {sweep.isPending ? (
                "Running..."
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Sweep
                </>
              )}
            </Button>
            <Button
              onClick={handleExport}
              disabled={!sweep.data}
              variant="outline"
              className="border-quantum-purple/30 hover:bg-quantum-purple/10"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </FormCard>

      <div className="space-y-6">
        {sweep.isPending && <LoadingSkeleton />}
        
        {sweep.data && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Badge variant="outline" className="p-3 justify-center border-quantum-cyan/30 bg-quantum-cyan/5">
                <div className="text-center">
                  <TrendingDown className="h-4 w-4 mx-auto mb-1 text-quantum-cyan" />
                  <div className="text-xs text-muted-foreground">Min QBER</div>
                  <div className="text-lg font-bold text-quantum-cyan">{stats?.minQber.toFixed(4)}</div>
                </div>
              </Badge>
              <Badge variant="outline" className="p-3 justify-center border-destructive/30 bg-destructive/5">
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" />
                  <div className="text-xs text-muted-foreground">Max QBER</div>
                  <div className="text-lg font-bold text-destructive">{stats?.maxQber.toFixed(4)}</div>
                </div>
              </Badge>
              <Badge variant="outline" className="p-3 justify-center border-quantum-purple/30 bg-quantum-purple/5">
                <div className="text-center">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-quantum-purple" />
                  <div className="text-xs text-muted-foreground">Success</div>
                  <div className="text-lg font-bold text-quantum-purple">{stats?.successRate.toFixed(1)}%</div>
                </div>
              </Badge>
            </div>

            <ChartCard title="QBER vs Noise" description="Quantum Bit Error Rate analysis">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorQber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--quantum-cyan))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--quantum-cyan))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="noise" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="qber" stroke="hsl(var(--quantum-cyan))" fill="url(#colorQber)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Success Rate" description="Key establishment success by noise level">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="noise" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="stepAfter" dataKey="success" stroke="hsl(var(--quantum-purple))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
