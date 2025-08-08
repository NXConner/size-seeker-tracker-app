"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartStyle = exports.ChartLegendContent = exports.ChartLegend = exports.ChartTooltipContent = exports.ChartTooltip = exports.ChartContainer = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const RechartsPrimitive = __importStar(require("recharts"));
const utils_1 = require("@/lib/utils");
// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" };
const ChartContext = React.createContext(null);
function useChart() {
    const context = React.useContext(ChartContext);
    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />");
    }
    return context;
}
const ChartContainer = React.forwardRef(({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;
    return ((0, jsx_runtime_1.jsx)(ChartContext.Provider, { value: { config }, children: (0, jsx_runtime_1.jsxs)("div", { "data-chart": chartId, ref: ref, className: (0, utils_1.cn)("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className), ...props, children: [(0, jsx_runtime_1.jsx)(ChartStyle, { id: chartId, config: config }), (0, jsx_runtime_1.jsx)(RechartsPrimitive.ResponsiveContainer, { children: children })] }) }));
});
exports.ChartContainer = ChartContainer;
ChartContainer.displayName = "Chart";
const ChartStyle = ({ id, config }) => {
    const colorConfig = Object.entries(config).filter(([_, config]) => config.theme || config.color);
    if (!colorConfig.length) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("style", { dangerouslySetInnerHTML: {
            __html: Object.entries(THEMES)
                .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                const color = itemConfig.theme?.[theme] ||
                    itemConfig.color;
                return color ? `  --color-${key}: ${color};` : null;
            })
                .join("\n")}
}
`)
                .join("\n"),
        } }));
};
exports.ChartStyle = ChartStyle;
const ChartTooltip = RechartsPrimitive.Tooltip;
exports.ChartTooltip = ChartTooltip;
const ChartTooltipContent = React.forwardRef(({ active, payload, className, indicator = "dot", hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }, ref) => {
    const { config } = useChart();
    const tooltipLabel = React.useMemo(() => {
        if (hideLabel || !payload?.length) {
            return null;
        }
        const [item] = payload;
        const key = `${labelKey || item.dataKey || item.name || "value"}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);
        const value = !labelKey && typeof label === "string"
            ? config[label]?.label || label
            : itemConfig?.label;
        if (labelFormatter) {
            return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("font-medium", labelClassName), children: labelFormatter(value, payload) }));
        }
        if (!value) {
            return null;
        }
        return (0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("font-medium", labelClassName), children: value });
    }, [
        label,
        labelFormatter,
        payload,
        hideLabel,
        labelClassName,
        config,
        labelKey,
    ]);
    if (!active || !payload?.length) {
        return null;
    }
    const nestLabel = payload.length === 1 && indicator !== "dot";
    return ((0, jsx_runtime_1.jsxs)("div", { ref: ref, className: (0, utils_1.cn)("grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl", className), children: [!nestLabel ? tooltipLabel : null, (0, jsx_runtime_1.jsx)("div", { className: "grid gap-1.5", children: payload.map((item, index) => {
                    const key = `${nameKey || item.name || item.dataKey || "value"}`;
                    const itemConfig = getPayloadConfigFromPayload(config, item, key);
                    const indicatorColor = color || item.payload.fill || item.color;
                    return ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground", indicator === "dot" && "items-center"), children: formatter && item?.value !== undefined && item.name ? (formatter(item.value, item.name, item, index, item.payload)) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [itemConfig?.icon ? ((0, jsx_runtime_1.jsx)(itemConfig.icon, {})) : (!hideIndicator && ((0, jsx_runtime_1.jsx)("div", { className: (0, utils_1.cn)("shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]", {
                                        "h-2.5 w-2.5": indicator === "dot",
                                        "w-1": indicator === "line",
                                        "w-0 border-[1.5px] border-dashed bg-transparent": indicator === "dashed",
                                        "my-0.5": nestLabel && indicator === "dashed",
                                    }), style: {
                                        "--color-bg": indicatorColor,
                                        "--color-border": indicatorColor,
                                    } }))), (0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex flex-1 justify-between leading-none", nestLabel ? "items-end" : "items-center"), children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid gap-1.5", children: [nestLabel ? tooltipLabel : null, (0, jsx_runtime_1.jsx)("span", { className: "text-muted-foreground", children: itemConfig?.label || item.name })] }), item.value && ((0, jsx_runtime_1.jsx)("span", { className: "font-mono font-medium tabular-nums text-foreground", children: item.value.toLocaleString() }))] })] })) }, item.dataKey));
                }) })] }));
});
exports.ChartTooltipContent = ChartTooltipContent;
ChartTooltipContent.displayName = "ChartTooltip";
const ChartLegend = RechartsPrimitive.Legend;
exports.ChartLegend = ChartLegend;
const ChartLegendContent = React.forwardRef(({ className, hideIcon = false, payload, verticalAlign = "bottom", nameKey }, ref) => {
    const { config } = useChart();
    if (!payload?.length) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { ref: ref, className: (0, utils_1.cn)("flex items-center justify-center gap-4", verticalAlign === "top" ? "pb-3" : "pt-3", className), children: payload.map((item) => {
            const key = `${nameKey || item.dataKey || "value"}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            return ((0, jsx_runtime_1.jsxs)("div", { className: (0, utils_1.cn)("flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"), children: [itemConfig?.icon && !hideIcon ? ((0, jsx_runtime_1.jsx)(itemConfig.icon, {})) : ((0, jsx_runtime_1.jsx)("div", { className: "h-2 w-2 shrink-0 rounded-[2px]", style: {
                            backgroundColor: item.color,
                        } })), itemConfig?.label] }, item.value));
        }) }));
});
exports.ChartLegendContent = ChartLegendContent;
ChartLegendContent.displayName = "ChartLegend";
// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config, payload, key) {
    if (typeof payload !== "object" || payload === null) {
        return undefined;
    }
    const payloadPayload = "payload" in payload &&
        typeof payload.payload === "object" &&
        payload.payload !== null
        ? payload.payload
        : undefined;
    let configLabelKey = key;
    if (key in payload &&
        typeof payload[key] === "string") {
        configLabelKey = payload[key];
    }
    else if (payloadPayload &&
        key in payloadPayload &&
        typeof payloadPayload[key] === "string") {
        configLabelKey = payloadPayload[key];
    }
    return configLabelKey in config
        ? config[configLabelKey]
        : config[key];
}
