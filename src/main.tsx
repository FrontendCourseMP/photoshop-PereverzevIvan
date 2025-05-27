import { createRoot } from "react-dom/client";
import "./scss/init.scss";
import App from "./app/App.tsx";
import { ImageProvider } from "./contexts/ImageContext/ImageContext.tsx";
import { ToolProvider } from "./contexts/ToolContext/ToolContext.tsx";
import { ColorPickerProvider } from "./contexts/ColorPickerContext/ColorPickerContext.tsx";
import { LayersProvider } from "./contexts/LayersContext/LayersContext.tsx";

createRoot(document.getElementById("root")!).render(
  <LayersProvider>
    <ImageProvider>
      <ToolProvider>
        <ColorPickerProvider>
          <App />
        </ColorPickerProvider>
      </ToolProvider>
    </ImageProvider>
  </LayersProvider>,
);
