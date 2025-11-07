import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({ title, description, children, className = "" }: ChartCardProps) {
  return (
    <Card className={`backdrop-quantum border-quantum-purple/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-quantum-purple glow-text">{title}</CardTitle>
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-4">{children}</CardContent>
    </Card>
  );
}
