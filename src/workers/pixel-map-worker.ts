/// <reference lib="webworker" />

// src/workers/pixel-map-worker.ts

interface WorkerInput {
  pathStrings: string[];
  canvasWidth: number;
  canvasHeight: number;
  svgViewBoxWidth: number;
  svgViewBoxHeight: number;
  logicalCols: number;
  logicalRows: number;
  pixelSize: number;
}

type WorkerProgressMessage = { type: 'progress'; progress: number };
type WorkerDoneMessage = { type: 'done'; bitmap: ArrayBuffer; activePixelsInBitmap: number };
type WorkerErrorMessage = { type: 'error'; error: string };
type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;


self.onmessage = (event: MessageEvent<WorkerInput>) => {
  try {
    const { logicalCols, logicalRows } = event.data;

    // --- DEBUGGING: FAKE PROGRESS ---
    let progress = 10;
    const interval = setInterval(() => {
      self.postMessage({ type: 'progress', progress: progress });
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
        const dummyBitmap = new Uint8Array(logicalCols * logicalRows);
        self.postMessage({ type: 'done', bitmap: dummyBitmap.buffer, activePixelsInBitmap: 0 } as WorkerDoneMessage, [dummyBitmap.buffer]);
      }
    }, 200);

  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error: ${errorMessage}` } as WorkerErrorMessage);
  }
};
