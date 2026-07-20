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

