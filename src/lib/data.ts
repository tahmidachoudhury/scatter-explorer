import raw from "../data/dataset.json"

//? The dataset is keyed by experiment name. Each experiment has an "inputs" dictionary (ingredients and process settings) and an "outputs" dictionary (other measured properties). Each value is numeric, float or int.

type RawExperiment = {
    inputs: Record<string, number>;
    outputs: Record<string, number>;
};

const rawData = raw as Record<string, RawExperiment>

// A property is one selectable numeric axis, tagged by either input or output
export type PropertyKind = "input" | "output";

export interface Property {
    key: string;
    kind: PropertyKind
}

// A flattened experiment: name + a flat lookup of every properyt value
export interface Experiment {
    name: string;
    values: Record<string, number>;
}

//? I noticed in the dataset, every experiment has the same input and output keys. So I designed the property list to be built once based off of the kkeys from the first experiement. If I was provided a dataset where each experiment has different inputs and outputs then I would add a validation layer here.

function buildProperties(): Property[] {
    const first = Object.values(rawData)[0];
    const inputs = Object.keys(first.inputs).map<Property>((key) => ({ key, kind: "input" }));
    const outputs = Object.keys(first.outputs).map<Property>((key) => ({ key, kind: "output" }));
    return [...inputs, ...outputs];
}

function buildExperiments(): Experiment[] {
    return Object.entries(rawData).map(([name, exp]) => ({
        name,
        values: { ...exp.inputs, ...exp.outputs },
    }))
}

export const PROPERTIES: Property[] = buildProperties();
export const EXPERIMENTS: Experiment[] = buildExperiments();

// Look up a property's kind/label without repeated scans
const PROPERTY_BY_KEY = new Map(PROPERTIES.map((p) => [p.key, p]));
export function getProperty(key: string): Property | undefined {
    return PROPERTY_BY_KEY.get(key);
}

//? A property is "degenerate" if every experiment has the same value for it (e.g. an ingredient that is 0.0 everywhere). Plotting it gives a flat line with no spread, so the UI flags these rather than rendering a broken axis.

export function isDegenerate(key: string): boolean {
    let min = Infinity;
    let max = -Infinity;
    for (const exp of EXPERIMENTS) {
        const v = exp.values[key];
        if (v < min) min = v;
        if (v > max) max = v;
    }
    return min === max;
}