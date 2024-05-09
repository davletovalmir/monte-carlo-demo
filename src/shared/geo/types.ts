export type GeoProperties = {
  name: string;
};

export type GeoPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

export type GeoFeature = {
  type: "Feature";
  id: string;
  properties: GeoProperties;
  geometry: GeoPolygon;
  rsmKey: string;
  svgPath: string;
};
