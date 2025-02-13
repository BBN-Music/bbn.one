import type { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartType, DefaultDataPoint } from "https://esm.sh/chart.js@4.4.6/auto";
import { Box, Component, Empty, Grid, Label, lazy } from "webgen/mod.ts";

const lazyChart = lazy(() => import("https://esm.sh/chart.js@4.4.6/auto"));

export const Chart = <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>) => {
    const canvas = document.createElement("canvas");

    lazyChart().then((chartjs) => new chartjs.Chart(canvas, config));

    const component = { draw: () => canvas };

    return Box(component).addClass("chart");
};

export function BasicEntry(title: string | Component, subtitle?: string) {
    return Grid(
        Grid(
            typeof title === "string" ? Label(title).setTextSize("3xl").setFontWeight("bold") : title,
            subtitle ? Label(subtitle) : Empty(),
        )
            .setHeight("max-content")
            .setAlignSelf("center"),
    )
        .setGap("1rem")
        .setTemplateColumns("max-content auto min-content")
        .setPadding("1rem 0");
}