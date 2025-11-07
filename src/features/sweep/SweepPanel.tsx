import { useEffect, useMemo, useState } from "react";
import { FormCard } from "@/components/FormCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useSweep, SweepParams, SweepResult } from "@/api/queries";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Download, Play, TrendingDown, TrendingUp, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import defaultSweepCSV from "@/assets/default-sweep.csv?raw";

function parseCSVToSweepResult(csv: string): SweepResult {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  const data = lines.slice(1).map(line => line.split(','));
  
  return {
    noise: data.map(row => parseFloat(row[0])),
    qber_ideal: data.map(row => parseFloat(row[1])),
    qber_hardware: data.map(row => parseFloat(row[2])),
    qber_theoretical: data.map(row => parseFloat(row[3])),
    success_ideal: data.map(row => row[4] === '1'),
    success_hardware: data.map(row => row[5] === '1')
  };
}

export function SweepPanel() {
  const { toast } = useToast();
  const sweep = useSweep();
  const [defaultData, setDefaultData] = useState<SweepResult | null>(null);

  const [params, setParams] = useState<SweepParams>({
    noise_min: 0.0,      // interpreted as P(Eve) min
    noise_max: 1.0,      // interpreted as P(Eve) max
    num: 15,
    n_bits: 256,
    protocol: "bb84",
    hardware_noise: 0.03, // depolarizing prob on single-qubit gates
    runs: 3,              // average runs per point
    include_theory: true, // show 0.25 * P(Eve) for BB84
  });

  useEffect(() => {
    const data = parseCSVToSweepResult(defaultSweepCSV);
    setDefaultData(data);
  }, []);

  // If protocol is E91, force theoretical curve off
  useEffect(() => {
    if (params.protocol === "e91" && params.include_theory) {
      setParams((p) => ({ ...p, include_theory: false }));
    }
  }, [params.protocol]);

  const handleRun = () => {
    sweep.mutate(params, {
      onSuccess: (result) => {
        toast({
          title: "Sweep Complete",
          description: `Analyzed ${result.noise.length} noise levels`,
        });
      },
      onError: (error: any) => {
        toast({
          title: "Sweep Failed",
          description: error?.message ?? "Unknown error",
          variant: "destructive",
        });
      },
    });
  };

  const handleExport = () => {
    const data = sweep.data || defaultData;
    if (!data) return;

    const header = [
      "noise",
      "qber_ideal",
      "qber_hardware",
      ...(data.qber_theoretical ? ["qber_theoretical"] : []),
      "success_ideal",
      "success_hardware",
    ];

    const rows = data.noise.map((n, i) => {
      const base = [
        n,
        data.qber_ideal[i],
        data.qber_hardware[i],
      ];
      const theory = data.qber_theoretical ? [data.qber_theoretical[i]] : [];
      const tail = [
        data.success_ideal[i] ? 1 : 0,
        data.success_hardware[i] ? 1 : 0,
      ];
      return [...base, ...theory, ...tail];
    });

    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sweep_${Date.now()}.csv`;
    a.click();
    toast({ title: "Exported", description: "CSV downloaded successfully" });
  };

  const displayData = sweep.data || defaultData;

  const chartData = useMemo(() => {
    const d = displayData;
    if (!d) return [];
    return d.noise.map((n, i) => ({
      noise: Number(n).toFixed(3),
      qberIdeal: d.qber_ideal[i],
      qberHardware: d.qber_hardware[i],
      qberTheory: d.qber_theoretical ? d.qber_theoretical[i] : undefined,
      successIdeal: d.success_ideal[i] ? 1 : 0,
      successHardware: d.success_hardware[i] ? 1 : 0,
    }));
  }, [displayData]);

  const stats = useMemo(() => {
    const d = displayData;
    if (!d) return null;
    const minQhw = Math.min(...d.qber_hardware);
    const maxQhw = Math.max(...d.qber_hardware);
    const successHw = d.success_hardware.filter(Boolean).length / d.success_hardware.length * 100;
    return {
      minQberHardware: minQhw,
      maxQberHardware: maxQhw,
      successRateHardware: successHw,
    };
  }, [displayData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <FormCard title="Sweep Parameters" description="Configure BB84/E91 QBER vs P(Eve) analysis with hardware noise">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Protocol</Label>
            <Select
              value={params.protocol}
              onValueChange={(v) => setParams({ ...params, protocol: v as "bb84" | "e91" })}
            >
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
              <Label>P(Eve) Min</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={params.noise_min}
                onChange={(e) => setParams({ ...params, noise_min: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label>P(Eve) Max</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={params.noise_max}
                onChange={(e) => setParams({ ...params, noise_max: parseFloat(e.target.value) || 0 })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label># Points</Label>
              <Input
                type="number"
                min="2"
                max="400"
                value={params.num}
                onChange={(e) => setParams({ ...params, num: parseInt(e.target.value) || 2 })}
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
                onChange={(e) => setParams({ ...params, n_bits: parseInt(e.target.value) || 8 })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label>Runs / point</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={params.runs}
                onChange={(e) => setParams({ ...params, runs: Math.max(1, parseInt(e.target.value) || 1) })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hardware Noise (depolarizing)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={params.hardware_noise}
                onChange={(e) => setParams({ ...params, hardware_noise: Math.min(1, Math.max(0, parseFloat(e.target.value) || 0)) })}
                className="bg-muted/50 border-quantum-cyan/20"
              />
            </div>
            <div className="space-y-2">
              <Label className={params.protocol === "e91" ? "text-muted-foreground" : ""}>
                Include theoretical curve (0.25·P(Eve))
              </Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={params.include_theory}
                  onCheckedChange={(checked) => setParams({ ...params, include_theory: checked })}
                  disabled={params.protocol === "e91"}
                />
                {params.protocol === "e91" && (
                  <span className="text-xs text-muted-foreground">Unavailable for E91</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleRun}
              disabled={sweep.isPending}
              className="flex-1 bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
            >
              {sweep.isPending ? "Running..." : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Sweep
                </>
              )}
            </Button>
            <Button
              onClick={handleExport}
              disabled={!displayData}
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

        {displayData && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Badge variant="outline" className="p-3 justify-center border-quantum-cyan/30 bg-quantum-cyan/5">
                <div className="text-center">
                  <TrendingDown className="h-4 w-4 mx-auto mb-1 text-quantum-cyan" />
                  <div className="text-xs text-muted-foreground">Min QBER (HW)</div>
                  <div className="text-lg font-bold text-quantum-cyan">
                    {stats?.minQberHardware.toFixed(4)}
                  </div>
                </div>
              </Badge>
              <Badge variant="outline" className="p-3 justify-center border-destructive/30 bg-destructive/5">
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 mx-auto mb-1 text-destructive" />
                  <div className="text-xs text-muted-foreground">Max QBER (HW)</div>
                  <div className="text-lg font-bold text-destructive">
                    {stats?.maxQberHardware.toFixed(4)}
                  </div>
                </div>
              </Badge>
              <Badge variant="outline" className="p-3 justify-center border-quantum-purple/30 bg-quantum-purple/5">
                <div className="text-center">
                  <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-quantum-purple" />
                <div className="text-xs text-muted-foreground">Success (HW)</div>
                  <div className="text-lg font-bold text-quantum-purple">
                    {stats?.successRateHardware.toFixed(1)}%
                  </div>
                </div>
              </Badge>
            </div>

            <ChartCard
              title="QBER vs P(Eve)"
              description={`Comparison of simulated curves (ideal vs hardware noise = ${(params.hardware_noise * 100).toFixed(1)}%)${params.protocol === "bb84" && params.include_theory ? " with theoretical bound" : ""}`}
            >
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="noise" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 0.5]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="qberIdeal"
                    name="Simulated — Ideal HW"
                    stroke="hsl(var(--quantum-cyan))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="qberHardware"
                    name={`Simulated — HW noise = ${(params.hardware_noise * 100).toFixed(1)}%`}
                    stroke="hsl(var(--quantum-purple))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {displayData.qber_theoretical && (
                    <Line
                      type="monotone"
                      dataKey="qberTheory"
                      name="Theoretical (0.25·P(Eve))"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="6 6"
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Success by P(Eve)" description="Key establishment success (1) / fail (0) for each curve">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="noise" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 1]} allowDecimals={false} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="stepAfter"
                    dataKey="successIdeal"
                    name="Success — Ideal HW"
                    stroke="hsl(var(--quantum-cyan))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="successHardware"
                    name="Success — Hardware"
                    stroke="hsl(var(--quantum-purple))"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>
    </div>
  );
}
