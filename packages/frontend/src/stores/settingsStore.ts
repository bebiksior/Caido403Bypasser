import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type Settings } from "shared";

import { useSDKStore } from "@/stores/sdkStore";
import { handleBackendCall } from "@/utils/utils";

export const useSettings = () => {
  const sdk = useSDKStore.getState().getSDK();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => handleBackendCall(sdk.backend.getSettings(), sdk),
  });

  return { data, isLoading, isError, error };
};

export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  const sdk = useSDKStore.getState().getSDK();

  const { mutate, isPending, error } = useMutation<
    Settings,
    Error,
    { newSettings: Settings }
  >({
    mutationFn: ({ newSettings }) =>
      handleBackendCall(sdk.backend.updateSettings(newSettings), sdk),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { updateSettings: mutate, isPending, error };
};
