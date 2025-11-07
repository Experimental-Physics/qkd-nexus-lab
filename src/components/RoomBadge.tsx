import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";

interface RoomBadgeProps {
  room: string | null;
  connected: boolean;
}

export function RoomBadge({ room, connected }: RoomBadgeProps) {
  if (!room) return null;

  return (
    <Badge
      variant={connected ? "default" : "secondary"}
      className={`${
        connected
          ? "bg-quantum-cyan/20 text-quantum-cyan border-quantum-cyan/40 pulse-glow"
          : "bg-muted text-muted-foreground"
      } transition-all`}
    >
      {connected ? <Wifi className="mr-1 h-3 w-3" /> : <WifiOff className="mr-1 h-3 w-3" />}
      Room: {room}
    </Badge>
  );
}
