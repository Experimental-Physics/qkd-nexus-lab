import { Badge } from "@/components/ui/badge";
import { WorkbenchResult } from "@/api/queries";

interface BitInspectorProps {
  trace: WorkbenchResult["trace"];
  bitIndex: number;
}

export function BitInspector({ trace, bitIndex }: BitInspectorProps) {
  const aliceBit = trace.alice_bits[bitIndex];
  const aliceBasis = trace.alice_bases[bitIndex];
  const bobBasis = trace.bob_bases[bitIndex];
  const bobResult = trace.bob_results[bitIndex];

  const isSifted = trace.sift_indices.includes(bitIndex);
  const isSampled = trace.sample_indices.includes(bitIndex);
  const isEve = trace.eve_indices.includes(bitIndex);
  const eveBasis = trace.eve_bases[bitIndex.toString()];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="p-3 rounded-lg border border-quantum-cyan/20 bg-quantum-cyan/5">
        <div className="text-xs text-muted-foreground mb-1">Alice</div>
        <div className="text-2xl font-bold text-quantum-cyan font-mono">
          {aliceBit} <span className="text-sm">({aliceBasis})</span>
        </div>
      </div>

      <div className="p-3 rounded-lg border border-quantum-blue/20 bg-quantum-blue/5">
        <div className="text-xs text-muted-foreground mb-1">Bob Basis</div>
        <div className="text-2xl font-bold text-quantum-blue font-mono">{bobBasis}</div>
      </div>

      <div className="p-3 rounded-lg border border-quantum-purple/20 bg-quantum-purple/5">
        <div className="text-xs text-muted-foreground mb-1">Bob Result</div>
        <div className="text-2xl font-bold text-quantum-purple font-mono">{bobResult}</div>
      </div>

      <div className="p-3 rounded-lg border border-border bg-muted/20 flex flex-col gap-1">
        <Badge variant={isSifted ? "default" : "secondary"} className="text-xs justify-center">
          {isSifted ? "✓ Sifted" : "✗ Discarded"}
        </Badge>
        {isSampled && (
          <Badge variant="secondary" className="text-xs justify-center bg-quantum-purple/20 border-quantum-purple/30">
            Sampled
          </Badge>
        )}
        {isEve && (
          <Badge variant="destructive" className="text-xs justify-center">
            Eve ({eveBasis})
          </Badge>
        )}
      </div>
    </div>
  );
}
