export type VertexPressHandler = (key: string) => void;

type PressEventsCallbacks = {
  onVertexLongPress?: VertexPressHandler;
  onVertexPress?: VertexPressHandler;
};

export type GraphEventsSettings = PressEventsCallbacks;
