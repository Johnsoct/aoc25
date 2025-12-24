import chartjs from "chart.js/auto";

import puzzleData from "./9.json" with { type: "json" };

new chartjs(
    // @ts-expect-error idc
    document.getElementById("chart"),
    {
        data: {
            datasets: [ {
                backgroundColor: "red",
                borderColor: "red",
                data: puzzleData.redTileCoordinates.map((coordinate) => {
                    return {
                        x: coordinate[0],
                        y: coordinate[1],
                    };
                }),
                label: "Red tile coordinates",
            } ],
        },
        options: {
            legend: {
                display: false,
            },
            responsive: true,
            scales: {
                x: {
                    position: "bottom",
                    type: "linear",
                },
            },
            title: {
                display: false,
            },
        },
        type: "scatter", 
    }
);
