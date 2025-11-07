import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./client";

/* =============================
 * Types — UPDATED SWEEP CONTRACT
 * ============================= */

// Request sent to POST /sweep
export interface SweepParams {
  // X-axis interpreted as P(Eve)
  noise_min: number;         // e.g., 0.0
  noise_max: number;         // e.g., 1.0
  num: number;               // e.g., 15
  n_bits: number;            // e.g., 256
  protocol: "bb84" | "e91";  // protocol

  // NEW fields
  hardware_noise: number;    // depolarizing prob on 1q gates, e.g., 0.03
  runs: number;              // averages per X-point, e.g., 3
  include_theory: boolean;   // include 0.25 * P(Eve) (BB84 only)
}

// Response from POST /sweep
export interface SweepResult {
  noise: number[];                 // X series (P(Eve))
  qber_ideal: number[];            // simulated, hardware ideal
  qber_hardware: number[];         // simulated, with hardware noise
  qber_theoretical?: number[];     // optional, BB84 only
  success_ideal: boolean[];        // key obtained (ideal HW)
  success_hardware: boolean[];     // key obtained (noisy HW)
}

/* =============================
 * Other API Types (unchanged)
 * ============================= */

export interface RebuildParams {
  num_nodes: number;
  noise_min: number;
  noise_max: number;
  eve_prob: number;
  protocol: "bb84" | "e91" | "mixed";
}

export interface NetworkData {
  num_nodes: number;
  edges: [number, number][];
  keys: Record<string, number[]>;
  metrics: Record<string, Record<string, { qber: number[]; noise: number[] }>>;
}

export interface EstablishParams {
  src: number;
  dst: number;
  protocol: "bb84" | "e91";
  n_bits: number;
  noise: number;
  eve_prob: number;
  qber_threshold: number;
}

export interface EstablishResult {
  ok: boolean;
  qber: number;
  protocol: string;
  message?: string;
}

export interface ChatSendParams {
  sender: number;
  receiver: number;
  message: string;
}

export interface ChatDecryptParams {
  owner: number;
  peer: number;
  blob_hex: string;
}

export interface WorkbenchParams {
  protocol: "bb84" | "e91";
  key_len: number;
  noise: number;
  eve_prob: number;
  sample_frac: number;
  seed?: number;
}

export interface WorkbenchResult {
  protocol: string;
  params: WorkbenchParams;
  trace: {
    alice_bits: number[];
    alice_bases: string[];
    bob_bases: string[];
    eve_indices: number[];
    eve_bases: Record<string, string>;
    bob_results: number[];
    sift_indices: number[];
    sample_indices: number[];
    qber: number;
    final_key_alice: number[];
    final_key_bob: number[];
    keys_match: boolean;
  };
}

/* =============================
 * Hooks
 * ============================= */

export const useSweep = () =>
  useMutation({
    mutationFn: (params: SweepParams) =>
      api<SweepResult>("/sweep", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });

export const useRebuild = () =>
  useMutation({
    mutationFn: (params: RebuildParams) =>
      api<{ ok: boolean; num_nodes: number }>("/rebuild", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });

export const useNetwork = (enabled = true) =>
  useQuery({
    queryKey: ["network"],
    queryFn: () => api<NetworkData>("/network"),
    staleTime: 5000,
    enabled,
  });

export const useMetrics = (nodeId: number | null) =>
  useQuery({
    queryKey: ["metrics", nodeId],
    queryFn: () => api<Record<string, { qber: number[]; noise: number[] }>>(
      `/metrics/${nodeId}`
    ),
    enabled: nodeId !== null,
    staleTime: 5000,
  });

export const useEstablish = () =>
  useMutation({
    mutationFn: (params: EstablishParams) =>
      api<EstablishResult>("/establish", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });

export const useChatSend = () =>
  useMutation({
    mutationFn: (params: ChatSendParams) =>
      api<{ ok: boolean }>("/chat/send", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });

export const useChatDecrypt = () =>
  useMutation({
    mutationFn: (params: ChatDecryptParams) =>
      api<{ ok: boolean; plaintext: string }>("/chat/decrypt", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });

export const useWorkbench = () =>
  useMutation({
    mutationFn: (params: WorkbenchParams) =>
      api<WorkbenchResult>("/workbench/run", {
        method: "POST",
        body: JSON.stringify(params),
      }),
  });
