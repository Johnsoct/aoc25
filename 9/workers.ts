import { Worker } from "worker_threads";

import puzzleData from "./9.json" with { type: "json" };

const workerNumber = 4;
const chunkSize = Math.ceil(puzzleData.redTileCoordinates.length / workerNumber);

let overallMaxArea = 0;
let workersCompleted = 0;

for (let workerIndex = 0; workerIndex < workerNumber; workerIndex++) {
    const startIndex = workerIndex * chunkSize;
    const endIndex = Math.min(startIndex + chunkSize, puzzleData.redTileCoordinates.length);

    const worker = new Worker("./9b.ts", {
        workerData: {
            endIndex,
            startIndex,
        },
    });

    worker.on('error', (err) => {
        console.error('Worker error:', err);
    });

    worker.on("message", (result) => {
        overallMaxArea = Math.max(overallMaxArea, result.maxArea);
        workersCompleted++;
        
        if (workersCompleted === workerNumber) {
            console.log("Final max area", overallMaxArea);
        }
    });
}
