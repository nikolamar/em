export type Callback = (state: any) => void;

export type ProviderProps = {
  children: React.ReactNode;
  states: Map<string, any>;
  onChange?: Callback;
  consolelog?: boolean;
  persistent?: boolean;
  enableMapSet?: boolean;
  serializeStates?: (states: any) => void;
  deserializeStates?: (states: string) => Map<string, any>;
};

export type SetStateByKey = (key: string, callback: Handler) => void;

export type EM = {
  consolelog?: boolean;
  persistent?: boolean;
  enableMapSet: boolean;
};

type CompWithStateProps = {
  children?: React.ReactNode;
};
