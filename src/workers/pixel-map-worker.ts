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

// Tipos de mensagens que o worker pode enviar
type WorkerProgressMessage = { type: 'progress'; progress: number };
type WorkerDoneMessage = { type: 'done'; bitmap: ArrayBuffer };
type WorkerErrorMessage = { type: 'error'; error: string };
type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;


self.onmessage = (event: MessageEvent<WorkerInput>) => {
  console.log("Worker: TOP of onmessage reached.");
  try {
    if (!event.data) {
      self.postMessage({ type: 'error', error: 'Worker Error: No data received in onmessage.' } as WorkerErrorMessage);
      return;
    }
    
    // Confirmação inicial de que onmessage foi chamado e os dados foram recebidos
    console.log("Worker: onmessage received data, sending initial progress 0.1.");
    self.postMessage({ type: 'progress', progress: 0.1 } as WorkerProgressMessage);

    const {
      pathStrings,
      // canvasWidth, // Não usado diretamente aqui para cálculo do bitmap lógico
      // canvasHeight, // Não usado diretamente aqui
      svgViewBoxWidth,
      svgViewBoxHeight,
      logicalCols,
      logicalRows,
      // pixelSize, // Não usado diretamente aqui
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
    
    const offscreenCanvas = new OffscreenCanvas(svgViewBoxWidth, svgViewBoxHeight);
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      console.error("Worker Error: Failed to get OffscreenCanvas 2D context.");
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' } as WorkerErrorMessage);
      return;
    }

    // Test if the combinedPath2D is valid by checking a point (e.g., center of the viewBox)
    const testX = svgViewBoxWidth / 2;
    const testY = svgViewBoxHeight / 2;
    const isCenterInPath = ctx.isPointInPath(combinedPath2D, testX, testY);
    console.log(`Worker: Test - Center point (${testX}, ${testY}) in combinedPath2D: ${isCenterInPath}`);
    
    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        console.error('Worker Error: Total pixels to process is zero.');
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
    
    console.log(`Worker: Finished processing. Total active pixels in bitmap: ${activePixelsCount}`);
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer } as WorkerDoneMessage, [pixelBitmap.buffer]);
    
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Worker uncaught error in onmessage: ${errorMessage}`);
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${errorMessage}` } as WorkerErrorMessage);
  }
};
