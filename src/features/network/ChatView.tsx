import { useState, useEffect } from "react";
import { FormCard } from "@/components/FormCard";
import { RoomBadge } from "@/components/RoomBadge";
import { KeyPill } from "@/components/KeyPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useChatSend, useChatDecrypt } from "@/api/queries";
import { createSocket, WSMessage } from "@/ws/socket";
import { Send, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: "sent" | "received";
  sender: number;
  receiver: number;
  blob_hex?: string;
  plaintext?: string;
  timestamp: number;
}

export function ChatView() {
  const { toast } = useToast();
  const chatSend = useChatSend();
  const chatDecrypt = useChatDecrypt();

  const [room, setRoom] = useState<string>("");
  const [joined, setJoined] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sender, setSender] = useState<number>(0);
  const [receiver, setReceiver] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = createSocket();
    setConnected(true);

    socket.on("joined", (msg: WSMessage) => {
      if (msg.room === room) {
        setJoined(true);
        toast({ title: "Joined Room", description: `Connected to room ${msg.room}` });
      }
    });

    socket.on("secure_msg", (msg: WSMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `recv-${Date.now()}`,
          type: "received",
          sender: msg.sender!,
          receiver: parseInt(room),
          blob_hex: msg.blob_hex,
          timestamp: Date.now(),
        },
      ]);
    });

    socket.on("delivered", (msg: WSMessage) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sent-${Date.now()}`,
          type: "sent",
          sender: parseInt(room),
          receiver: msg.to!,
          blob_hex: msg.blob_hex,
          timestamp: Date.now(),
        },
      ]);
    });

    return () => socket.close();
  }, [room, toast]);

  const handleJoin = () => {
    if (room) {
      const socket = createSocket();
      socket.join(room);
    }
  };

  const handleSend = () => {
    if (!message.trim()) return;

    chatSend.mutate(
      { sender, receiver, message },
      {
        onSuccess: () => {
          setMessage("");
          toast({ title: "Message Sent", description: "Encrypted message delivered" });
        },
        onError: (error) => {
          toast({ title: "Send Failed", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  const handleDecrypt = (msg: ChatMessage) => {
    if (!msg.blob_hex) return;

    chatDecrypt.mutate(
      { owner: msg.receiver, peer: msg.sender, blob_hex: msg.blob_hex },
      {
        onSuccess: (result) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, plaintext: result.plaintext } : m))
          );
          toast({ title: "Decrypted", description: "Message decrypted successfully" });
        },
        onError: (error) => {
          toast({ title: "Decrypt Failed", description: error.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <FormCard title="Secure Chat" description="WebSocket-based encrypted messaging">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>My Node ID</Label>
            <Input
              type="number"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="0"
              className="bg-muted/50 border-quantum-cyan/20"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleJoin}
              disabled={!room || joined}
              className="w-full bg-quantum-purple hover:bg-quantum-purple/80 text-background"
            >
              {joined ? "Joined" : "Join Room"}
            </Button>
          </div>
          <div className="flex items-end">
            <RoomBadge room={room || null} connected={connected && joined} />
          </div>
        </div>

        {joined && (
          <>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input
                  type="number"
                  value={sender}
                  onChange={(e) => setSender(parseInt(e.target.value))}
                  className="bg-muted/50 border-quantum-cyan/20"
                />
              </div>
              <div className="space-y-2">
                <Label>Receiver ID</Label>
                <Input
                  type="number"
                  value={receiver}
                  onChange={(e) => setReceiver(parseInt(e.target.value))}
                  className="bg-muted/50 border-quantum-cyan/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-muted/50 border-quantum-cyan/20 min-h-[80px]"
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={chatSend.isPending || !message.trim()}
              className="w-full bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border"
            >
              <Send className="mr-2 h-4 w-4" />
              {chatSend.isPending ? "Sending..." : "Send Encrypted Message"}
            </Button>

            <div className="space-y-2 pt-4 border-t border-border">
              <Label>Message Log</Label>
              <ScrollArea className="h-[300px] rounded-lg border border-quantum-cyan/20 bg-muted/20 p-4">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm py-8">No messages yet</div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg border ${
                        msg.type === "sent"
                          ? "border-quantum-purple/30 bg-quantum-purple/5"
                          : "border-quantum-cyan/30 bg-quantum-cyan/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {msg.type === "sent" ? `${msg.sender} → ${msg.receiver}` : `${msg.sender} → ${msg.receiver}`}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        {msg.type === "received" && msg.blob_hex && !msg.plaintext && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDecrypt(msg)}
                            className="h-6 text-xs"
                          >
                            <Unlock className="mr-1 h-3 w-3" />
                            Decrypt
                          </Button>
                        )}
                      </div>
                      {msg.blob_hex && <KeyPill value={msg.blob_hex} label="Encrypted" className="mb-2" />}
                      {msg.plaintext && (
                        <div className="text-sm text-foreground bg-background/50 p-2 rounded">
                          <Lock className="inline h-3 w-3 mr-1 text-quantum-cyan" />
                          {msg.plaintext}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </FormCard>
  );
}
