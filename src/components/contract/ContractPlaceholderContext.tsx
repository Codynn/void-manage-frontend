import { createContext, useContext } from "react";

export type PlaceholderRenderMode = "template" | "fill";

export interface ContractPlaceholderContextValue {
  mode: PlaceholderRenderMode;
  // key -> filled value (string for text/date/number, url for image)
  values: Record<string, string | undefined>;
  // when provided (intern's pre-sign view), clicking an empty image placeholder opens a file picker
  onImageSelect?: (key: string, file: File) => void;
}

const ContractPlaceholderContext = createContext<ContractPlaceholderContextValue>({
  mode: "template",
  values: {},
});

export const ContractPlaceholderProvider = ContractPlaceholderContext.Provider;

export const useContractPlaceholder = () => useContext(ContractPlaceholderContext);
