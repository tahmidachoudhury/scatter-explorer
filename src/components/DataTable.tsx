import { useState } from "react";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import { EXPERIMENTS, PROPERTIES } from "../lib/data";

// DataTable shows every experiment as a row: its id, all ingredient inputs,
// and one selectable output measurement. Columns are derived from PROPERTIES
// so the table adapts to whatever inputs/outputs the dataset defines.
const INPUTS = PROPERTIES.filter((p) => p.kind === "input");
const OUTPUTS = PROPERTIES.filter((p) => p.kind === "output");

export function DataTable() {
  const [measurement, setMeasurement] = useState(OUTPUTS[0].key);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Experiment", width: 170 },
    { field: "measurement", headerName: measurement, width: 140 },
    ...INPUTS.map((p) => ({ field: p.key, headerName: p.key, width: 150 })),
  ];

  const rows = EXPERIMENTS.map((exp) => ({
    id: exp.name,
    measurement: exp.values[measurement],
    ...exp.values, // spread every property so input columns fill dynamically
  }));

  return (
    <Box>
      <FormControl size="small" sx={{ mb: 2, minWidth: 220 }}>
        <InputLabel>Measurement</InputLabel>
        <Select
          value={measurement}
          label="Measurement"
          onChange={(e) => setMeasurement(e.target.value)}
        >
          {OUTPUTS.map((p) => (
            <MenuItem key={p.key} value={p.key}>
              {p.key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ height: 460, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          sx={{ border: "1px solid #a7a7a7", borderRadius: 2 }}
        />
      </Box>
    </Box>
  );
}
