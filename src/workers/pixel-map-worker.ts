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
  console.log("Worker: TOP of onmessage reached.");
  try {
    if (!event.data) {
      self.postMessage({ type: 'error', error: 'Worker Error: No data received in onmessage.' } as WorkerErrorMessage);
      return;
    }
    
    console.log("Worker: onmessage received data, sending initial progress 0.1.");
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
    console.log(`Worker: Received ${pathStrings.length} path strings.`);

    const combinedPath2D = new Path2D();
    let successfullyAddedPaths = 0;
    for (const d of pathStrings) {
      if (typeof d !== 'string' || d.trim() === '') {
        console.warn("Worker: Encountered empty or invalid path string, skipping.");
        continue;
      }
      try {
        combinedPath2D.addPath(new Path2D(d));
        successfullyAddedPaths++;
      } catch (e: any) {
        console.error(`Worker Error: Invalid Path2D string: "${d.substring(0, 50)}...". Details: ${e.message}`);
        self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string: "${d.substring(0, 50)}...". Details: ${e.message}` } as WorkerErrorMessage);
        return; 
      }
    }
    console.log(`Worker: Successfully added ${successfullyAddedPaths} paths to combinedPath2D.`);
    
    // It's not strictly necessary to create an OffscreenCanvas here if we just need isPointInPath
    // However, if other canvas operations were needed, it would be useful.
    // For isPointInPath with Path2D, it can be called on any 2D rendering context.
    // Let's use a minimal approach if only isPointInPath is needed.
    const tempCanvas = new OffscreenCanvas(1, 1); // Minimal canvas for context
    const ctx = tempCanvas.getContext('2d');


    if (!ctx) {
      console.error("Worker Error: Failed to get OffscreenCanvas 2D context for Path2D operations.");
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context for Path2D operations.' } as WorkerErrorMessage);
      return;
    }
    
    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        console.error('Worker Error: Total pixels to process is zero.');
        self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' } as WorkerErrorMessage);
        return;
    }
    
    const pixelBitmap = new Uint8Array(totalPixelsToProcess);
    let processedPixels = 0;
    let activePixelsCount = 0; // Renamed for clarity
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 100)); 

    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        // Calculate the center of the logical pixel in SVG coordinate space
        const svgCoordX = (c + 0.5) * (svgViewBoxWidth / logicalCols);
        const svgCoordY = (r + 0.5) * (svgViewBoxHeight / logicalRows);
        
        if (ctx.isPointInPath(combinedPath2D, svgCoordX, svgCoordY)) {
          pixelBitmap[r * logicalCols + c] = 1; 
          activePixelsCount++;
        } else {
          pixelBitmap[r * logicalCols + c] = 0; 
        }
      }
      processedPixels += logicalCols;
      if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
            // Progress from worker contributes to the first 50% of overall progress
            self.postMessage({ type: 'progress', progress: Math.min(99.9, 0.1 + (currentProgress * 0.998)) } as WorkerProgressMessage);
        }
      }
    }
    
    console.log(`Worker: Finished processing. Total active pixels in bitmap: ${activePixelsCount}`);
    // Send the count of active pixels along with the bitmap
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer, activePixelsInBitmap: activePixelsCount } as WorkerDoneMessage, [pixelBitmap.buffer]);
    
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Worker uncaught error in onmessage: ${errorMessage}`);
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${errorMessage}` } as WorkerErrorMessage);
  }
};
