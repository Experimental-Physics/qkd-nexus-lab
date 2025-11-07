import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MiniSparklineProps {
  data: number[];
  color?: string;
  className?: string;
}

export function MiniSparkline({ data, color = "hsl(var(--quantum-cyan))", className = "" }: MiniSparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));

  return (
    <div className={`h-12 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
