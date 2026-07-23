import { useEffect, useMemo, useRef, useState } from "react";
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

export function Scatterplot({ xKey, yKey, colorKey, width = 720, height = 520 }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hover, setHover] = useState<HoverState | null>(null);

    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Legend needs the colour scale too, so it lives outside the draw effect.
    const colorScale = useMemo(() => {
        if (!colorKey) return null;
        const [min, max] = d3.extent(EXPERIMENTS, (e) => e.values[colorKey]) as [number, number];
        return d3.scaleSequential(d3.interpolateViridis).domain(min === max ? [min, min + 1] : [min, max]);
    }, [colorKey]);

    useEffect(() => {
        const x = d3.scaleLinear().domain(domainFor(xKey)).range([0, innerW]).nice();
        const y = d3.scaleLinear().domain(domainFor(yKey)).range([innerH, 0]).nice();

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

        // Negative tick sizes give us the gridlines for free.
        g.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0,${innerH})`)
            .call(d3.axisBottom(x).ticks(6).tickSize(-innerH).tickFormat(formatTick));
        g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(6).tickSize(-innerW).tickFormat(formatTick));

        g.append("text").attr("class", "axis-title").attr("x", innerW / 2).attr("y", innerH + 46).attr("text-anchor", "middle").text(xKey);
        g.append("text").attr("class", "axis-title").attr("transform", `translate(-52,${innerH / 2}) rotate(-90)`).attr("text-anchor", "middle").text(yKey);

        g.append("g")
            .selectAll("circle")
            .data(EXPERIMENTS)
            .join("circle")
            .attr("class", "point")
            .attr("cx", (d) => x(d.values[xKey]))
            .attr("cy", (d) => y(d.values[yKey]))
            .attr("r", 6)
            .attr("fill", (d) => (colorScale ? colorScale(d.values[colorKey]) : "var(--accent)"))
            .on("mouseenter", function (_, d) {
                d3.select(this).attr("r", 9).classed("point-active", true);
                setHover({ exp: d, cx: x(d.values[xKey]), cy: y(d.values[yKey]) });
            })
            .on("mouseleave", function () {
                d3.select(this).attr("r", 6).classed("point-active", false);
                setHover(null);
            })
            .style("opacity", 0)
            .transition()
            .delay((_, i) => i * 30)
            .duration(200)
            .style("opacity", 1);
    }, [xKey, yKey, colorKey, colorScale, innerW, innerH]);

    return (
        <div className="chart-wrap">
            <svg ref={svgRef} width={width} height={height} role="img" aria-label={`Scatterplot of ${yKey} versus ${xKey}`} />
            {colorKey && colorScale && <ColorLegend colorKey={colorKey} scale={colorScale} />}
            {hover && <Tooltip hover={hover} xKey={xKey} yKey={yKey} colorKey={colorKey} />}
        </div>
    );
}

// Pad a degenerate axis so points aren't stacked on the border.
function domainFor(key: string): [number, number] {
    const [min, max] = d3.extent(EXPERIMENTS, (e) => e.values[key]) as [number, number];
    if (min === max) return [min - 1, max + 1];
    const pad = (max - min) * 0.05;
    return [min - pad, max + pad];
}

// Compact numeric formatting: avoids long float tails on the axis.
function formatTick(v: d3.NumberValue): string {
    const n = Number(v);
    return Math.abs(n) >= 1000 ? d3.format(".2s")(n) : d3.format(".3~f")(n);
}

function Tooltip({ hover, xKey, yKey, colorKey }: { hover: HoverState; xKey: string; yKey: string; colorKey: string }) {
    const v = hover.exp.values;
    return (
        <div className="tooltip" style={{ left: MARGIN.left + hover.cx + 14, top: MARGIN.top + hover.cy - 8 }}>
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
    const gradient = `linear-gradient(to right, ${d3.range(0, 1.01, 0.1).map((s) => scale(min + s * (max - min))).join(", ")})`;
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
