import { ChartCard } from "@/components/ChartCard";
import { WorkbenchResult } from "@/api/queries";
import { useMemo } from "react";

interface TimelineProps {
  trace: WorkbenchResult["trace"];
  currentIndex: number;
}

export function Timeline({ trace, currentIndex }: TimelineProps) {
  const siftSet = useMemo(() => new Set(trace.sift_indices), [trace.sift_indices]);
  const sampleSet = useMemo(() => new Set(trace.sample_indices), [trace.sample_indices]);
  const eveSet = useMemo(() => new Set(trace.eve_indices), [trace.eve_indices]);

  const displayCount = Math.min(trace.alice_bits.length, 128);

  return (
    <ChartCard title="Sifting Visualization" description="Alice and Bob basis matching">
      <div className="space-y-2">
        <div className="flex gap-1 flex-wrap">
          {trace.alice_bits.slice(0, displayCount).map((bit, i) => {
            const isSifted = siftSet.has(i);
            const isSampled = sampleSet.has(i);
            const isEve = eveSet.has(i);
            const isCurrent = i === currentIndex;
            const basesMatch = trace.alice_bases[i] === trace.bob_bases[i];

            return (
              <div
                key={i}
                className={`w-6 h-6 flex items-center justify-center text-xs font-mono rounded transition-all ${
                  isCurrent
                    ? "ring-2 ring-quantum-cyan scale-110"
                    : isSampled
                    ? "opacity-40 bg-quantum-purple/20 border border-quantum-purple/40"
                    : isSifted
                    ? basesMatch
                      ? "bg-quantum-cyan/20 border border-quantum-cyan/40"
                      : "bg-destructive/20 border border-destructive/40"
                    : "bg-muted/20 border border-border opacity-30"
                } ${isEve ? "border-destructive border-2" : ""}`}
                title={`${i}: Alice ${bit} (${trace.alice_bases[i]}) → Bob ${trace.bob_results[i]} (${trace.bob_bases[i]})`}
              >
                {bit}
              </div>
            );
          })}
        </div>

        {trace.alice_bits.length > displayCount && (
          <div className="text-xs text-muted-foreground text-center">
            Showing first {displayCount} of {trace.alice_bits.length} bits
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2 border-t border-border text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-quantum-cyan/20 border border-quantum-cyan/40 rounded" />
            <span>Sifted (match)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-destructive/20 border border-destructive/40 rounded" />
            <span>Error (mismatch)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-quantum-purple/20 border border-quantum-purple/40 rounded" />
            <span>Sampled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-muted/20 border border-border rounded opacity-30" />
            <span>Discarded</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 border-2 border-destructive rounded" />
            <span>Eve interception</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
