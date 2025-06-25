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
    const {
      pathStrings,
      canvasWidth,
      canvasHeight,
      svgViewBoxWidth,
      svgViewBoxHeight,
      logicalCols,
      logicalRows,
      pixelSize,
    } = event.data;

    // 1. Create an OffscreenCanvas and draw the scaled SVG paths onto it
    const offscreenCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      throw new Error("Could not get 2D context from OffscreenCanvas.");
    }

    const scaleX = canvasWidth / svgViewBoxWidth;
    const scaleY = canvasHeight / svgViewBoxHeight;
    
    ctx.scale(scaleX, scaleY);
    
    const combinedPath = new Path2D();
    pathStrings.forEach(d => {
      try {
        combinedPath.addPath(new Path2D(d));
      } catch (e) {
        console.warn("Worker: Skipping invalid path string:", d);
      }
    });

    ctx.fillStyle = 'black'; // Use a simple color for hit detection
    ctx.fill(combinedPath);

    // 2. Get the image data from the OffscreenCanvas
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;

    // 3. Create the final bitmap for hit detection
    const bitmap = new Uint8Array(logicalCols * logicalRows);
    let activePixelsInBitmap = 0;
    let lastProgress = -1;

    // 4. Iterate through logical grid points and check against the rendered image data
    for (let row = 0; row < logicalRows; row++) {
      for (let col = 0; col < logicalCols; col++) {
        // Find the center of the logical pixel in the rendered canvas coordinates
        const canvasX = Math.floor((col + 0.5) * pixelSize);
        const canvasY = Math.floor((row + 0.5) * pixelSize);

        // Calculate the index in the imageData array
        const index = (canvasY * canvasWidth + canvasX) * 4;
        
        // Check the alpha channel. If it's not transparent (0), the point is inside.
        if (data[index + 3] > 0) {
          bitmap[row * logicalCols + col] = 1;
          activePixelsInBitmap++;
        } else {
          bitmap[row * logicalCols + col] = 0;
        }
      }

      // Report progress periodically (e.g., every few rows) to avoid flooding messages
      const progress = Math.round((row / logicalRows) * 100);
      if (progress > lastProgress) {
        self.postMessage({ type: 'progress', progress: progress } as WorkerProgressMessage);
        lastProgress = progress;
      }
    }
    
    // Final message with the complete bitmap
    self.postMessage({ type: 'done', bitmap: bitmap.buffer, activePixelsInBitmap } as WorkerDoneMessage, [bitmap.buffer]);

  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error: ${errorMessage}` } as WorkerErrorMessage);
  }
};
