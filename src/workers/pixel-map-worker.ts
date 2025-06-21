
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
  console.log("Worker: Message received (DEBUG a SIMPLIFIED worker)"); 
  try {
    const { logicalCols, logicalRows } = event.data;

    // --- DEBUGGING: FAKE PROGRESS ---
    // This section replaces the real work to test communication.
    console.log("Worker (DEBUG): Starting fake progress simulation.");
    self.postMessage({ type: 'progress', progress: 0.1 });

    let progress = 10;
    const interval = setInterval(() => {
      self.postMessage({ type: 'progress', progress: progress });
      console.log(`Worker (DEBUG): Sent progress: ${progress}%`);
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
        const dummyBitmap = new Uint8Array(logicalCols * logicalRows);
        console.log("Worker (DEBUG): Sending fake DONE message.");
        self.postMessage({ type: 'done', bitmap: dummyBitmap.buffer, activePixelsInBitmap: 0 } as WorkerDoneMessage, [dummyBitmap.buffer]);
      }
    }, 200); // Send an update every 200ms

    // --- ORIGINAL CODE IS COMMENTED OUT BELOW ---
    /*
    if (!event.data) {
      console.error("Worker: No data received from main thread.");
      self.postMessage({ type: 'error', error: 'Worker Error: No data received.' } as WorkerErrorMessage);
      return;
    }
    
    self.postMessage({ type: 'progress', progress: 0.1 } as WorkerProgressMessage);

    const {
      pathStrings,
      svgViewBoxWidth,
      svgViewBoxHeight,
      logicalCols,
      logicalRows,
    } = event.data;


    if (!pathStrings || pathStrings.length === 0) {
      console.error("Worker: pathStrings array is empty or undefined.");
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' } as WorkerErrorMessage);
      return;
    }

    const combinedPath2D = new Path2D();
    for (const d of pathStrings) {
      if (typeof d !== 'string' || d.trim() === '') {
        console.warn("Worker: Empty or invalid path string encountered:", d);
        continue;
      }
      try {
        combinedPath2D.addPath(new Path2D(d));
      } catch (e: any) {
        console.error("Worker: Error creating Path2D from d attribute:", d, e);
        self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string. Details: ${e.message}` } as WorkerErrorMessage);
        return; 
      }
    }
    
    const tempCanvas = new OffscreenCanvas(1, 1); // Minimal canvas for context
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) {
      console.error("Worker: Failed to get OffscreenCanvas 2D context.");
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' } as WorkerErrorMessage);
      return;
    }
    
    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        console.error("Worker: Total pixels to process is zero.");
        self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' } as WorkerErrorMessage);
        return;
    }
    
    const pixelBitmap = new Uint8Array(totalPixelsToProcess);
    let processedPixels = 0;
    let activePixelsCount = 0;
    const progressUpdateInterval = Math.max(1, Math.floor(totalPixelsToProcess / 500)); 
    let pixelsSinceLastUpdate = 0;


    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        const svgCoordX = (c + 0.5) * (svgViewBoxWidth / logicalCols);
        const svgCoordY = (r + 0.5) * (svgViewBoxHeight / logicalRows);
        
        if (ctx.isPointInPath(combinedPath2D, svgCoordX, svgCoordY)) {
          pixelBitmap[r * logicalCols + c] = 1; 
          activePixelsCount++;
        } else {
          pixelBitmap[r * logicalCols + c] = 0; 
        }
        
        processedPixels++;
        pixelsSinceLastUpdate++;

        if (pixelsSinceLastUpdate >= progressUpdateInterval || processedPixels === totalPixelsToProcess) {
          const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
          if (Number.isFinite(currentProgress)) {
              const progressPayload = { type: 'progress', progress: Math.min(99.9, 0.1 + (currentProgress * 0.998)) };
              self.postMessage(progressPayload as WorkerProgressMessage);
          }
          pixelsSinceLastUpdate = 0;
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer, activePixelsInBitmap: activePixelsCount } as WorkerDoneMessage, [pixelBitmap.buffer]);
    */
    
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Worker: Uncaught error during processing:", errorMessage, e);
    self.postMessage({ type: 'error', error: `Worker uncaught error: ${errorMessage}` } as WorkerErrorMessage);
  }
};
