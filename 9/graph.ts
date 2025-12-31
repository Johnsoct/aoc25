import chartjs from "chart.js/auto";

import puzzleData from "./9.json" with { type: "json" };
import {
    execution,
} from "./9b";

const { coordinatesOutsideOfPolygon } = execution();

const redTilesDataset = {
    backgroundColor: "red",
    borderColor: "red",
    data: puzzleData.redTileCoordinates.map((coordinate) => {
        return {
            x: coordinate[0],
            y: coordinate[1],
        };
    }),
    label: "Red tile coordinates",
    type: "line",
}; 

new chartjs(
    // @ts-expect-error idc
    document.getElementById("chart"),
    {
        data: {
            datasets: [
                {
                    backgroundColor: "blue",
                    borderColor: "blue",
                    data: Array.from(coordinatesOutsideOfPolygon).map((coordinate) => {
                        return coordinate.split(",").map(Number); 
                    }),
                    label: "Coordinates out of bounds",
                    type: "scatter",
                },
                // {
                //     backgroundColor: "green",
                //     borderColor: "green",
                //     data: [
                //         {
                //             x: 97634,
                //             y: 50187,
                //         },
                //         {
                //             x: 97839,
                //             y: 50187,
                //         },
                //         {
                //             x: 97839,
                //             y: 48979,
                //         },
                //         {
                //             x: 97634,
                //             y: 48979,
                //         },
                //         {
                //             x: 97634,
                //             y: 50187,
                //         },
                //     ],
                //     label: "First rectangle",
                //     type: "line",
                // },
                redTilesDataset,
            ],
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
    }
);
