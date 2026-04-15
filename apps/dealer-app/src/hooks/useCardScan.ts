import { useMutation } from "@tanstack/react-query";
import { cardService, type ScanResponse, type CompsResponse } from "../services/cardService";
import { useDealTabStore } from "../stores/dealTabStore";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export function useCardScan() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation({
    mutationFn: async (imageBase64: string): Promise<ScanResponse> => {
      // Remove data URI prefix if present (e.g., "data:image/jpeg;base64,")
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      return cardService.scanImage(base64Data);
    },
    onSuccess: (data) => {
      // Add card to deal tab and navigate to comps
      addTab({
        type: "buy",
        step: 2,
        cardData: data.card,
      });
      
      Toast.show({
        type: "success",
        text1: "Card identified!",
        text2: `${data.card.player_name} — ${Math.round(data.confidence * 100)}% confidence`,
      });

      router.push("/buy/comps");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Could not identify card. Try again.";
      Toast.show({
        type: "error",
        text1: "Scan failed",
        text2: message,
      });
    },
  });
}

export function useBarcodeScan() {
  const router = useRouter();
  const addTab = useDealTabStore((s) => s.addTab);

  return useMutation({
    mutationFn: (barcode: string) => cardService.scanBarcode(barcode),
    onSuccess: (data) => {
      addTab({
        type: "buy",
        step: 2,
        cardData: data.card,
      });

      Toast.show({
        type: "success",
        text1: "Card found!",
        text2: data.card.player_name,
      });

      router.push("/buy/comps");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Could not find card. Try again.";
      Toast.show({
        type: "error",
        text1: "Barcode scan failed",
        text2: message,
      });
    },
  });
}

export function useCardComps(cardId: string) {
  return useMutation({
    mutationFn: () => cardService.getComps(cardId),
  });
}
