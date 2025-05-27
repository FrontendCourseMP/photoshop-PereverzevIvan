import clsx from "clsx";
import {
  TLayer,
  useLayers,
} from "../../../../contexts/LayersContext/LayersContext";
import s from "./LayerInfo.module.scss";

type TLayerInfoProps = {
  layersCount: number;
  layer: TLayer;
};

export function LayerInfo(props: TLayerInfoProps) {
  const {
    removeLayer,
    activeLayerId,
    setActiveLayerId,
    setOpacity,
    toggleAlphaVisibility,
    deleteAlphaChannel,
    setVisible,
    changeBlendMode,
    moveLayer,
  } = useLayers();

  const opacities = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const blendModes = ["normal", "multiply", "screen", "overlay"];

  return (
    <div
      className={clsx(s.LayerInfo, {
        [s.active]: activeLayerId === props.layer.id,
      })}
    >
      {/* Название слоя */}
      <p className={s.LayerName}>Слой номер {props.layer.id}</p>

      <button onClick={() => setActiveLayerId(props.layer.id)}>Выбрать</button>

      {/* Удаление и скрытие/показ слоя */}
      <div className={s.ButtonBox}>
        <button
          onClick={() => removeLayer(props.layer.id)}
          className={s.DeleteLayer}
        >
          Удалить
        </button>
        <button
          onClick={() => setVisible(props.layer.id, !props.layer.visible)}
          className={s.HideLayer}
        >
          {props.layer.visible ? "Скрыть" : "Показать"}
        </button>
      </div>

      {/* Предпросмотр слоя и предпросмотр альфа-канала */}
      <div className={s.previewBlock}>
        {props.layer.preview != "" && (
          <img src={props.layer.preview} alt="preview" />
        )}
        {props.layer.alphaChannelPreview != "" && (
          <img src={props.layer.alphaChannelPreview} alt="alpha preview" />
        )}
      </div>

      {/* Изменение прозрачности */}
      <select
        onChange={(e) => setOpacity(props.layer.id, parseFloat(e.target.value))}
        name="opacity"
        value={`${props.layer.opacity}`}
      >
        {opacities.map((opacity, index) => (
          <option key={index} value={opacity}>
            {opacity * 100}%
          </option>
        ))}
      </select>

      {/* Изменение режима наложения */}
      <select
        onChange={(e) => changeBlendMode(props.layer.id, e.target.value)}
        name="blendMode"
        value={props.layer.blendMode}
      >
        {blendModes.map((mode, index) => (
          <option key={index} value={mode}>
            {mode}
          </option>
        ))}
      </select>

      {props.layer.hasAlphaChannel && props.layer.editedImageData && (
        <div className={s.ButtonBox}>
          <button
            onClick={() => toggleAlphaVisibility(props.layer.id)}
            className={s.hideAlpha}
          >
            Скрыть альфа-канал
          </button>
          <button
            onClick={() => deleteAlphaChannel(props.layer.id)}
            className={s.deleteAlpha}
          >
            Удалить альфа-канал
          </button>
        </div>
      )}

      {/* Перемещение слоя */}
      <div className={s.ButtonBox}>
        <button
          onClick={() => moveLayer(props.layer.id, props.layer.id + 1)}
          disabled={props.layer.id === props.layersCount - 1}
          className={s.MoveLayer}
        >
          Ниже
        </button>
        <button
          onClick={() => moveLayer(props.layer.id, props.layer.id - 1)}
          disabled={props.layer.id === 0}
          className={s.MoveLayer}
        >
          Выше
        </button>
      </div>
    </div>
  );
}
