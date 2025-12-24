import { Worker } from "worker_threads";

const workerNumber = 12;
let overallMaxArea = 0;
let workersCompleted = 0;

for (let workerIndex = 0; workerIndex < workerNumber; workerIndex++) {
    const worker = new Worker("./9b.ts", {
        workerData: {
            workerIndex,
            workerNumber,
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
