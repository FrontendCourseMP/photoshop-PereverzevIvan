import { LayerPanel } from "../LayerPanel/LayerPanel";
import s from "./RightPanel.module.scss";

export function RightPanel() {
  return (
    <div className={s.rightPanel}>
      <LayerPanel />
    </div>
  );
}
