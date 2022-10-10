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

export type Handler = (...val: any) => void;

export type SetStateByKey = (key: string, callback: Handler) => void;

export type EM = {
  events: Set;
  consolelog?: boolean;
  persistent?: boolean;
  enableMapSet: boolean;
};

type CompWithStateProps = {
  children?: React.ReactNode;
};
