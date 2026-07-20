import { useMemo, useState } from "react";
import * as d3 from "d3";
import { EXPERIMENTS, type Experiment } from "../lib/data";

interface Props {
    xKey: string;
    yKey: string;
    colorKey: string; // "" means no colour mapping
    width?: number;
    height?: number;
}

const MARGIN = { top: 24, right: 24, bottom: 56, left: 72 };

interface HoverState {
    exp: Experiment;
    cx: number;
    cy: number;
}

// Renders the scatterplot as SVG. We use d3 only for the maths (scales, axis ticks, colour interpolation) and let React own the DOM — this keeps the component declarative and easy to reason about, instead of d3 mutating nodes.

export function Scatterplot({ xKey, yKey, colorKey, width = 720, height = 520 }: Props) {
    const [hover, setHover] = useState<HoverState | null>(null);

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Recompute scales only when the selected axes or size change.
    const { xScale, yScale, colorScale } = useMemo(() => {
        // A degenerate axis has zero spread; pad it so points aren't stacked on
        // the border and the axis still renders sensible ticks.
        const domainFor = (key: string): [number, number] => {
            const [min, max] = d3.extent(EXPERIMENTS, (e) => e.values[key]) as [number, number];
            if (min === max) return [min - 1, max + 1];
            const pad = (max - min) * 0.05;
            return [min - pad, max + pad];
        };

        const xScale = d3.scaleLinear().domain(domainFor(xKey)).range([0, innerW]).nice();
        const yScale = d3.scaleLinear().domain(domainFor(yKey)).range([innerH, 0]).nice();

        let colorScale: d3.ScaleSequential<string> | null = null;
        if (colorKey) {
            const [min, max] = d3.extent(EXPERIMENTS, (e) => e.values[colorKey]) as [number, number];
            colorScale = d3
                .scaleSequential(d3.interpolateViridis)
                .domain(min === max ? [min, min + 1] : [min, max]);
        }

        return { xScale, yScale, colorScale };
    }, [xKey, yKey, colorKey, innerW, innerH]);

    const xTicks = xScale.ticks(6);
    const yTicks = yScale.ticks(6);

    return (
        <div className="chart-wrap">
            <svg width={width} height={height} role="img" aria-label={`Scatterplot of ${yKey} versus ${xKey}`}>
                <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
                    {/* Gridlines + axis ticks  */}
                    {yTicks.map((t) => (
                        <g key={`y-${t}`} transform={`translate(0,${yScale(t)})`}>
                            <line x1={0} x2={innerW} className="gridline" />
                            <text x={-12} dy="0.32em" className="tick-label" textAnchor="end">
                                {formatTick(t)}
                            </text>
                        </g>
                    ))}
                    {xTicks.map((t) => (
                        <g key={`x-${t}`} transform={`translate(${xScale(t)},${innerH})`}>
                            <line y1={0} y2={-innerH} className="gridline" />
                            <text y={24} className="tick-label" textAnchor="middle">
                                {formatTick(t)}
                            </text>
                        </g>
                    ))}

                    {/* Axis titles */}
                    <text x={innerW / 2} y={innerH + 44} className="axis-title" textAnchor="middle">
                        {xKey}
                    </text>
                    <text transform={`translate(${-56},${innerH / 2}) rotate(-90)`} className="axis-title" textAnchor="middle">
                        {yKey}
                    </text>

                    {/* Points */}
                    {EXPERIMENTS.map((exp) => {
                        const cx = xScale(exp.values[xKey]);
                        const cy = yScale(exp.values[yKey]);
                        const fill = colorScale ? colorScale(exp.values[colorKey]) : "var(--accent)";
                        const isActive = hover?.exp.name === exp.name;
                        return (
                            <circle
                                key={exp.name}
                                cx={cx}
                                cy={cy}
                                r={isActive ? 9 : 6}
                                fill={fill}
                                className={`point ${isActive ? "point-active" : ""}`}
                                onMouseEnter={() => setHover({ exp, cx, cy })}
                                onMouseLeave={() => setHover(null)}
                            />
                        );
                    })}
                </g>
            </svg>

            {colorKey && colorScale && <ColorLegend colorKey={colorKey} scale={colorScale} />}

            {hover && (
                <Tooltip
                    hover={hover}
                    xKey={xKey}
                    yKey={yKey}
                    colorKey={colorKey}
                    offsetX={MARGIN.left}
                    offsetY={MARGIN.top}
                />
            )}
        </div>
    );
}

// Compact numeric formatting: avoids long float tails on the axis. 
function formatTick(v: number): string {
    if (Math.abs(v) >= 1000) return d3.format(".2s")(v);
    return d3.format(".3~f")(v);
}

function Tooltip({
    hover,
    xKey,
    yKey,
    colorKey,
    offsetX,
    offsetY,
}: {
    hover: HoverState;
    xKey: string;
    yKey: string;
    colorKey: string;
    offsetX: number;
    offsetY: number;
}) {
    const v = hover.exp.values;
    return (
        <div className="tooltip" style={{ left: offsetX + hover.cx + 14, top: offsetY + hover.cy - 8 }}>
            <div className="tooltip-title">{hover.exp.name}</div>
            <div className="tooltip-row">
                <span>{xKey}</span>
                <span>{v[xKey]}</span>
            </div>
            <div className="tooltip-row">
                <span>{yKey}</span>
                <span>{v[yKey]}</span>
            </div>
            {colorKey && (
                <div className="tooltip-row">
                    <span>{colorKey}</span>
                    <span>{v[colorKey]}</span>
                </div>
            )}
        </div>
    );
}

function ColorLegend({ colorKey, scale }: { colorKey: string; scale: d3.ScaleSequential<string> }) {
    const [min, max] = scale.domain();
    const stops = d3.range(0, 1.01, 0.1);
    const gradient = `linear-gradient(to right, ${stops
        .map((s) => scale(min + s * (max - min)))
        .join(", ")})`;
    return (
        <div className="legend">
            <span className="legend-label">{colorKey}</span>
            <div className="legend-bar" style={{ background: gradient }} />
            <div className="legend-scale">
                <span>{formatTick(min)}</span>
                <span>{formatTick(max)}</span>
            </div>
        </div>
    );
}
