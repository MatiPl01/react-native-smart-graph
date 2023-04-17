type SharedGraphVertexSettings = {
  radius?: number;
};

export type GraphVertexSettings = SharedGraphVertexSettings;

export type EdgeArrowSettings = {
  scale?: number; // scale relative to vertex radius
};

export type DirectedEdgeSettings = {
  arrow?: EdgeArrowSettings;
};

export type UndirectedEdgeSettings = never; // TODO - maybe add some settings later

export type DirectedGraphComponentsSettings = {
  vertex?: GraphVertexSettings;
  edge?: DirectedEdgeSettings;
};

export type UndirectedGraphComponentsSettings = {
  vertex?: GraphVertexSettings;
  edge?: UndirectedEdgeSettings;
};
