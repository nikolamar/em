export type Callback = (state: any) => void;

export type ProviderProps = {
  children: React.ReactNode;
  value: Map<string, any>;
  onChange?: Callback;
  consoleLog?: boolean;
  persistent?: boolean;
  enableMapSet?: boolean;
  performanceLog?: boolean;
  serializeStates?: ((states: any) => void) | null;
  deserializeStates?: ((states: string) => Map<string, any>) | null;
};

export type SetStateByKey = (key: string, callback: Handler) => void;

export type EM = {
  consoleLog?: boolean;
  persistent?: boolean;
  enableMapSet: boolean;
  performanceLog?: boolean;
};

type CompWithStateProps = {
  children?: React.ReactNode;
};
