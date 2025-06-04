import React from "react";

type Point = { input: number; output: number };

type CurvesEditorProps = {
  histogram: number[];
  channel: "r" | "g" | "b" | "l" | "a";
  controlPoints: [Point, Point];
  onChange: (points: [Point, Point]) => void;
};

const SVG_SIZE = 256;

export const CurvesEditor: React.FC<CurvesEditorProps> = ({
  histogram,
  channel,
  controlPoints,
  onChange,
}) => {
  const maxValue = Math.max(...histogram);

  const getColor = () => {
    switch (channel) {
      case "r":
        return "red";
      case "g":
        return "green";
      case "b":
        return "blue";
      case "l":
        return "gray";
      case "a":
        return "black";
    }
  };

  const polylinePoints = histogram
    .map((value, x) => {
      const normY = value / maxValue;
      const y = SVG_SIZE - normY * SVG_SIZE;
      return `${x},${y}`;
    })
    .join(" ");

  const [p1, p2] = controlPoints;

  const updatePoint = (
    index: 0 | 1,
    field: "input" | "output",
    value: number,
  ) => {
    const clamped = Math.max(0, Math.min(255, value));
    const newPoints: [Point, Point] = [...controlPoints] as [Point, Point];

    // Обновим точку, затем проверим на допустимость
    const updatedPoint = { ...newPoints[index], [field]: clamped };

    if (field === "input") {
      if (
        (index === 0 && updatedPoint.input > newPoints[1].input - 1) ||
        (index === 1 && updatedPoint.input < newPoints[0].input + 1)
      ) {
        // Не даём p1.input > p2.input и наоборот
        return;
      }
    }

    newPoints[index] = updatedPoint;
    onChange(newPoints);
  };

  // const toSvg = (val: number) => val;
  // const fromSvg = (val: number) => val;

  return (
    <div style={{ display: "flex", flexDirection: "column", width: SVG_SIZE }}>
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        style={{ border: "1px solid #ccc" }}
      >
        {/* Диагональ */}
        <line
          x1={0}
          y1={SVG_SIZE}
          x2={SVG_SIZE}
          y2={0}
          stroke="blue"
          strokeWidth={1}
        />

        {/* Гистограмма */}
        <polyline
          fill="none"
          stroke={getColor()}
          strokeWidth="1"
          points={polylinePoints}
        />

        {/* Кривая (линия между точками) */}
        <line
          x1={p1.input}
          y1={SVG_SIZE - p1.output}
          x2={p2.input}
          y2={SVG_SIZE - p2.output}
          stroke="black"
          strokeWidth={1}
        />

        {/* Горизонтальные линии */}
        <line
          x1={0}
          x2={p1.input}
          y1={SVG_SIZE - p1.output}
          y2={SVG_SIZE - p1.output}
          stroke="black"
        />
        <line
          x1={p2.input}
          x2={SVG_SIZE}
          y1={SVG_SIZE - p2.output}
          y2={SVG_SIZE - p2.output}
          stroke="black"
        />

        {/* Точки */}
        <circle
          cx={p1.input}
          cy={SVG_SIZE - p1.output}
          r={4}
          fill="white"
          stroke="black"
        />
        <circle
          cx={p2.input}
          cy={SVG_SIZE - p2.output}
          r={4}
          fill="black"
          stroke="black"
        />
      </svg>

      {/* Поля ввода */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "8px",
          gap: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "4px",
          }}
        >
          <label>Точка 1:</label>
          <br />
          In:{" "}
          <input
            type="number"
            min={0}
            max={255}
            value={p1.input}
            onChange={(e) => updatePoint(0, "input", +e.target.value)}
          />
          Out:{" "}
          <input
            type="number"
            min={0}
            max={255}
            value={p1.output}
            onChange={(e) => updatePoint(0, "output", +e.target.value)}
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "4px",
          }}
        >
          <label>Точка 2:</label>
          <br />
          In:{" "}
          <input
            type="number"
            min={0}
            max={255}
            value={p2.input}
            onChange={(e) => updatePoint(1, "input", +e.target.value)}
          />
          Out:{" "}
          <input
            type="number"
            min={0}
            max={255}
            value={p2.output}
            onChange={(e) => updatePoint(1, "output", +e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
