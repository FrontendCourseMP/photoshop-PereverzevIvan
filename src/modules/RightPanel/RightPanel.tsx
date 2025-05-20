import { useLayerContext } from "../../contexts/LayerContext/LayerProvider";
import { TBlendMode } from "../../types/layer.type";
// import s from "./RightPanel.module.scss";

export function RightPanel() {
  const {
    layers,
    activeLayerId,
    setActiveLayer,
    removeLayer,
    toggleVisibility,
    setOpacity,
    setBlendMode,
    moveLayer,
  } = useLayerContext();

  return (
    <div className="p-2 bg-gray-100 rounded shadow">
      {layers.map((layer, index) => (
        <div key={layer.id} className="mb-2 border p-2 rounded bg-white">
          <div className="flex justify-between items-center">
            <input
              type="radio"
              checked={layer.id === activeLayerId}
              onChange={() => setActiveLayer(layer.id)}
              title="Активный слой"
            />
            <span>{layer.name}</span>
            <button onClick={() => toggleVisibility(layer.id)}>👁</button>
            <button onClick={() => removeLayer(layer.id)}>🗑</button>
          </div>

          <label>
            Непрозрачность:
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={layer.opacity}
              onChange={(e) => setOpacity(layer.id, parseFloat(e.target.value))}
            />
          </label>

          <label>
            Режим наложения:
            <select
              value={layer.blendMode}
              onChange={(e) =>
                setBlendMode(layer.id, e.target.value as TBlendMode)
              }
            >
              <option value="normal">Normal</option>
              <option value="multiply">Multiply</option>
              <option value="screen">Screen</option>
              <option value="overlay">Overlay</option>
            </select>
          </label>

          <div className="flex justify-between mt-1">
            <button
              disabled={index === 0}
              onClick={() => moveLayer(index, index - 1)}
            >
              ↑
            </button>
            <button
              disabled={index === layers.length - 1}
              onClick={() => moveLayer(index, index + 1)}
            >
              ↓
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
