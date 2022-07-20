export type Callback = (state: any) => void;

export type StateProviderProps = {
  children: React.ReactNode;
  value: Map<string, any>;
  onChange?: Callback;
  eventlog?: boolean;
  statelog?: boolean;
  persistent?: boolean;
};

export type Handler = (...val: any) => void;

export type SetStateByKey = (key: string, callback: Handler) => void;

export type EM = {
  state?: Record<string, any>;
  setStateByKey?: SetStateByKey;
  event: Record<string, Handler>;
  eventlog: boolean;
  statelog: boolean;
  persistent: boolean;
  lineHeight: string;
  valColor: string;
  eveColor: string;
  keyColor: string;
};

type CompWithStateProps = {
  children?: React.ReactNode;
};
