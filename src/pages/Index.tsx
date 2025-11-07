import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SweepPanel } from "@/features/sweep/SweepPanel";
import { NetworkPanel } from "@/features/network/NetworkPanel";
import { WorkbenchPanel } from "@/features/workbench/WorkbenchPanel";
import { Activity, Network, Microscope } from "lucide-react";
import { API_URL } from "@/api/client";

const Index = () => {
  const [activeTab, setActiveTab] = useState("workbench");

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="text-center space-y-4 py-6 relative">
          <div className="absolute inset-0 -z-10 opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-quantum-cyan/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-quantum-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          </div>
          
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-quantum-cyan via-quantum-blue to-quantum-purple glow-text">
            QKD Playground
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Quantum Key Distribution Dashboard — Explore BB84 & E91 protocols, analyze network security, and visualize quantum cryptography in real-time
          </p>
          <Badge variant="outline" className="border-quantum-cyan/30 text-xs">
            API: {API_URL}
          </Badge>
        </header>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border border-quantum-cyan/20 h-auto p-1">
            <TabsTrigger
              value="workbench"
              className="data-[state=active]:bg-quantum-purple/20 data-[state=active]:text-quantum-purple transition-all"
            >
              <Microscope className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Protocol Workbench</span>
              <span className="sm:hidden">Workbench</span>
            </TabsTrigger>
            <TabsTrigger
              value="sweep"
              className="data-[state=active]:bg-quantum-cyan/20 data-[state=active]:text-quantum-cyan transition-all"
            >
              <Activity className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Sweep Analysis</span>
              <span className="sm:hidden">Sweep</span>
            </TabsTrigger>
            <TabsTrigger
              value="network"
              className="data-[state=active]:bg-quantum-blue/20 data-[state=active]:text-quantum-blue transition-all"
            >
              <Network className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Network & Chat</span>
              <span className="sm:hidden">Network</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="workbench" className="m-0">
              <WorkbenchPanel />
            </TabsContent>

            <TabsContent value="sweep" className="m-0">
              <SweepPanel />
            </TabsContent>

            <TabsContent value="network" className="m-0">
              <NetworkPanel />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm py-6 border-t border-border">
          <p>Powered by quantum entanglement and classical computation ⚛️</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
