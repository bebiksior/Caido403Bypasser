import { FrontendSDK } from "./types/types";
import { init as initMain } from "./main";

export const init = (sdk: FrontendSDK) => {
  initMain(sdk);
};
