import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "./client";

// Types
export interface SweepParams {
  noise_min: number;
  noise_max: number;
  num: number;
  n_bits: number;
  eve: boolean;
  protocol: "bb84" | "e91";
}

export interface SweepResult {
  noise: number[];
  qber: number[];
  success: boolean[];
}

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

// Hooks
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
    queryFn: () => api<Record<string, { qber: number[]; noise: number[] }>>(`/metrics/${nodeId}`),
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
