import { Badge } from "@/components/ui/badge";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KeyPillProps {
  value: string;
  label?: string;
  className?: string;
}

export function KeyPill({ value, label, className = "" }: KeyPillProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${label || "Value"} copied to clipboard`,
    });
  };

  const truncated = value.length > 20 ? `${value.slice(0, 10)}...${value.slice(-10)}` : value;

  return (
    <Badge
      variant="outline"
      className={`font-mono text-xs cursor-pointer hover:bg-quantum-cyan/10 border-quantum-cyan/30 transition-colors ${className}`}
      onClick={handleCopy}
    >
      {label && <span className="text-muted-foreground mr-1">{label}:</span>}
      <span className="text-quantum-cyan">{truncated}</span>
      <Copy className="ml-1 h-3 w-3" />
    </Badge>
  );
}
