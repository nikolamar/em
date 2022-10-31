import type { IProduce } from "immer/dist/internal";

export type Producer = (producer: IProduce) => void;

export type EMStoreProps = {
  persist?: boolean;
  consoleLog?: boolean;
  onSetState?: (key: string, prevState: any, nextState: any) => void;
  enableMapAndSet?: boolean;
  handleLocalStorageDataSave?: (
    key: string,
    prevState: any,
    nextState: any
  ) => void;
  handleLocalStorageDataLoad?: (states: Record<string, any>) => void;
} | null;
