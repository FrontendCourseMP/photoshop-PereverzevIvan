import {
  newEmptyLayer,
  useLayers,
} from "../../contexts/LayersContext/LayersContext";
import { LayerInfo } from "./components/LayerInfo/LayerInfo";
import s from "./LayerPanel.module.scss";

export function LayerPanel() {
  const { layers, addLayer } = useLayers();

  return (
    <div className={s.layerPanel}>
      {layers.map((layer) => (
        <LayerInfo key={layer.id} layer={layer} layersCount={layers.length} />
      ))}

      {/* Добавление слоя */}
      {layers.length < 2 && (
        <button onClick={() => addLayer(newEmptyLayer())}>Добавить слой</button>
      )}
    </div>
  );
}
