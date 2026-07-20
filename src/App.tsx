import { useState } from "react";
import { PropertySelect } from "./components/PropertySelect";
import { EXPERIMENTS, } from "./lib/data";
import "./App.css";
import { Scatterplot } from "./components/Scatterplot";

export default function App() {
  // Sensible defaults: two output measurements that actually vary.
  const [xKey, setXKey] = useState("Cure Time");
  const [yKey, setYKey] = useState("Tensile Strength");
  const [colorKey, setColorKey] = useState("Viscosity");

  return (
    <div className="app">
      <header className="app-header">
        <h1>Formulation Explorer</h1>
        <p className="subtitle">
          {EXPERIMENTS.length} experiments · pick any two properties to compare, and colour points by a
          third.
        </p>
      </header>

      <div className="controls">
        <PropertySelect label="X axis" value={xKey} onChange={setXKey} />
        <PropertySelect label="Y axis" value={yKey} onChange={setYKey} />
        <PropertySelect label="Colour by" value={colorKey} onChange={setColorKey} allowNone />
      </div>

      <Scatterplot xKey={xKey} yKey={yKey} colorKey={colorKey} />
    </div>
  );
}
