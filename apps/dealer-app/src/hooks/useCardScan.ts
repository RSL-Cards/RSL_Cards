import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cardService,
  type ScanResponse,
  type EbaySoldResponse,
} from "../services/cardService";
import { useDealTabStore } from "../stores/dealTabStore";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export const QUERY_KEYS = {
  ebaySold: (query: string) => ["ebay", "sold", query] as const,
  ebaySearch: (query: string) => ["ebay", "search", query] as const,
};

export function useCardScan(type: "buy" | "sell" = "buy") {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation<ScanResponse, Error, string>({
    mutationFn: (imageBase64: string) => cardService.scanImage(imageBase64),
    onSuccess: (data) => {
      const tabId = addTab({ type, step: 2, cardData: data.card });
      Toast.show({
        type: "success",
        text1: "Card identified!",
        text2: `${data.card.player_name} — ${Math.round(data.confidence * 100)}% confidence`,
      });
      if (type === "buy") {
        router.push("/buy/comps");
      } else {
        router.push("/sell/price");
      }
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 429) {
        Toast.show({
          type: "error",
          text1: "Rate limit hit",
          text2: "Wait 30-60s and try again.",
        });
      } else {
        const message =
          error?.response?.data?.message ??
          "Could not identify card. Try again.";
        Toast.show({ type: "error", text1: "Scan failed", text2: message });
      }
    },
  });
}

export function useBarcodeScan() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation<ScanResponse, Error, string>({
    mutationFn: (barcode: string) => cardService.scanBarcode(barcode),
    onSuccess: (data) => {
      addTab({ type: "buy", step: 2, cardData: data.card });
      Toast.show({
        type: "success",
        text1: "Card found!",
        text2: data.card.player_name,
      });
      router.push("/buy/comps");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Could not find card. Try again.";
      Toast.show({
        type: "error",
        text1: "Barcode scan failed",
        text2: message,
      });
    },
  });
}

export function useEbaySold(
  query: string,
  options?: { enabled?: boolean; limit?: number },
) {
  return useQuery<EbaySoldResponse, Error>({
    queryKey: QUERY_KEYS.ebaySold(query),
    queryFn: () => cardService.getEbaySold(query, options?.limit ?? 10),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useEbaySearch(query: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: QUERY_KEYS.ebaySearch(query),
    queryFn: () => cardService.searchEbay(query),
    enabled: (options?.enabled ?? true) && query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
