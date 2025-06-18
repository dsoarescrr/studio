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
    if (!event.data) {
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
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' } as WorkerErrorMessage);
      return;
    }

    const combinedPath2D = new Path2D();
    for (const d of pathStrings) {
      if (typeof d !== 'string' || d.trim() === '') {
        continue;
      }
      try {
        combinedPath2D.addPath(new Path2D(d));
      } catch (e: any) {
        self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string. Details: ${e.message}` } as WorkerErrorMessage);
        return; 
      }
    }
    
    const tempCanvas = new OffscreenCanvas(1, 1);
    const ctx = tempCanvas.getContext('2d');

    if (!ctx) {
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' } as WorkerErrorMessage);
      return;
    }
    
    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' } as WorkerErrorMessage);
        return;
    }
    
    const pixelBitmap = new Uint8Array(totalPixelsToProcess);
    let processedPixels = 0;
    let activePixelsCount = 0;
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 100)); 

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
      }
      processedPixels += logicalCols;
      if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
            self.postMessage({ type: 'progress', progress: Math.min(99.9, 0.1 + (currentProgress * 0.998)) } as WorkerProgressMessage);
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer, activePixelsInBitmap: activePixelsCount } as WorkerDoneMessage, [pixelBitmap.buffer]);
    
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error: ${errorMessage}` } as WorkerErrorMessage);
  }
};
