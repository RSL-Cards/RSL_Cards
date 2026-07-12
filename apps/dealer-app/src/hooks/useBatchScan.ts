import { useMutation, useQuery } from "@tanstack/react-query";
import { batchService } from "../services/cardService";
import Toast from "react-native-toast-message";

export function useBatchUpload() {
  return useMutation({
    mutationFn: (rawText: string) => batchService.uploadFile(rawText),
    onSuccess: () => {
      Toast.show({
        type: "info",
        text1: "Batch Upload Started",
        text2: "RSL agent is working on this task in background, we will notify after completes.",
      });
    },
    onError: (error: any) => {
      Toast.show({ type: "error", text1: "Upload failed", text2: error?.message });
    }
  });
}

export function useBatchScanMulti() {
  return useMutation({
    mutationFn: (imageBase64: string) => batchService.scanMulti(imageBase64),
    onSuccess: () => {
      Toast.show({
        type: "info",
        text1: "Multi-Card Scan Started",
        text2: "RSL agent is working on this task in background, we will notify after completes.",
      });
    },
    onError: (error: any) => {
      Toast.show({ type: "error", text1: "Scan failed", text2: error?.message });
    }
  });
}

export function useBatchJobs() {
  return useQuery({
    queryKey: ["batch_jobs"],
    queryFn: () => batchService.getJobs(),
  });
}
