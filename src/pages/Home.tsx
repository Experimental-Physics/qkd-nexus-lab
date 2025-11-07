import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Activity, Network, Microscope, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-quantum-cyan/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-quantum-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-quantum-blue/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-quantum-cyan via-quantum-blue to-quantum-purple glow-text animate-fade-in">
              QKD Playground
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Explore Quantum Key Distribution protocols in an interactive environment
            </p>
            <p className="text-muted-foreground/80 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.3s" }}>
              Dive into BB84 & E91 protocols, analyze network security, and visualize quantum cryptography in real-time
            </p>
          </div>

          <div className="flex gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Link to="/dashboard">
              <Button className="bg-quantum-cyan hover:bg-quantum-cyan/80 text-background glow-border text-lg px-8 py-6">
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-quantum-purple/20 hover:border-quantum-purple/50 transition-all hover:scale-105 glow-border">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-quantum-purple/20 flex items-center justify-center">
                <Microscope className="h-7 w-7 text-quantum-purple" />
              </div>
              <h3 className="text-2xl font-bold text-quantum-purple">Protocol Workbench</h3>
              <p className="text-muted-foreground">
                Step through BB84 and E91 protocols bit-by-bit. Visualize quantum states, basis choices, and key generation with interactive timelines.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-quantum-cyan/20 hover:border-quantum-cyan/50 transition-all hover:scale-105 glow-border">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-quantum-cyan/20 flex items-center justify-center">
                <Activity className="h-7 w-7 text-quantum-cyan" />
              </div>
              <h3 className="text-2xl font-bold text-quantum-cyan">Sweep Analysis</h3>
              <p className="text-muted-foreground">
                Run parameter sweeps to analyze QBER vs noise relationships. Export results and understand how environmental factors affect key security.
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-quantum-blue/20 hover:border-quantum-blue/50 transition-all hover:scale-105 glow-border">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-lg bg-quantum-blue/20 flex items-center justify-center">
                <Network className="h-7 w-7 text-quantum-blue" />
              </div>
              <h3 className="text-2xl font-bold text-quantum-blue">Network & Chat</h3>
              <p className="text-muted-foreground">
                Explore quantum networks with multiple nodes. Establish secure keys, send encrypted messages, and monitor network-wide security metrics.
              </p>
            </div>
          </Card>
        </div>

        {/* Features List */}
        <div className="mt-20 text-center space-y-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-3xl font-bold text-foreground">What You'll Discover</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-quantum-cyan mt-2 pulse-glow" />
              <p className="text-muted-foreground">Understand quantum entanglement and basis measurement</p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-quantum-purple mt-2 pulse-glow" />
              <p className="text-muted-foreground">Analyze QBER thresholds and eavesdropping detection</p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-quantum-blue mt-2 pulse-glow" />
              <p className="text-muted-foreground">Simulate realistic noise and channel conditions</p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 rounded-full bg-quantum-cyan mt-2 pulse-glow" />
              <p className="text-muted-foreground">Build and secure multi-node quantum networks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border mt-20">
        <p>Powered by quantum entanglement and classical computation ⚛️</p>
      </footer>
    </div>
  );
};

export default Home;
