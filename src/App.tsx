import { useState } from "react";
import { Container, Box, Stack, Typography, Tabs, Tab, Alert } from "@mui/material";
import { PropertySelect } from "./components/PropertySelect";
import { Scatterplot } from "./components/Scatterplot";
import { DataTable } from "./components/DataTable";
import { EXPERIMENTS, isDegenerate } from "./lib/data";

export default function App() {
  // Sensible defaults: two output measurements that actually vary.
  const [xKey, setXKey] = useState("Cure Time");
  const [yKey, setYKey] = useState("Tensile Strength");
  const [colorKey, setColorKey] = useState("Viscosity");
  const [tab, setTab] = useState(0);

  const warnings = [
    isDegenerate(xKey) ? `X axis "${xKey}" is constant across all experiments.` : null,
    isDegenerate(yKey) ? `Y axis "${yKey}" is constant across all experiments.` : null,
  ].filter(Boolean) as string[];

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 650, letterSpacing: "0.08em" }}>
        Formulation Explorer
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {EXPERIMENTS.length} experiments · pick any two properties to compare, and colour points by a third.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 3, mb: 2 }}>
        <Tab label="Chart" />
        <Tab label="Table" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Stack direction="row" spacing={2} useFlexGap sx={{ mb: 2, flexWrap: "wrap" }}>
            <PropertySelect label="X axis" value={xKey} onChange={setXKey} />
            <PropertySelect label="Y axis" value={yKey} onChange={setYKey} />
            <PropertySelect label="Colour by" value={colorKey} onChange={setColorKey} allowNone />
          </Stack>

          {warnings.map((w) => (
            <Alert key={w} severity="warning" sx={{ mb: 1 }}>
              {w}
            </Alert>
          ))}

          <Scatterplot xKey={xKey} yKey={yKey} colorKey={colorKey} />
        </Box>
      )}

      {tab === 1 && <DataTable />}
    </Container>
  );
}
