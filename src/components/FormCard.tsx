import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormCard({ title, description, children, className = "" }: FormCardProps) {
  return (
    <Card className={`backdrop-quantum border-quantum-cyan/20 ${className}`}>
      <CardHeader>
        <CardTitle className="text-quantum-cyan glow-text">{title}</CardTitle>
        {description && <CardDescription className="text-muted-foreground">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
