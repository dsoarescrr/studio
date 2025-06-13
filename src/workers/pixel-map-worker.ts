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

self.onmessage = (event: MessageEvent<WorkerInput>) => {
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

  // Create an OffscreenCanvas to use its context for isPointInPath
  const offscreenCanvas = new OffscreenCanvas(1, 1); // Dimensions are minimal
  const ctx = offscreenCanvas.getContext('2d');

  if (!ctx) {
    self.postMessage({ type: 'error', error: 'Failed to get OffscreenCanvas context' });
    return;
  }

  const combinedPath = new Path2D();
  pathStrings.forEach(d => {
    try {
      // Note: Path2D constructor might not be available in all worker contexts
      // or might have limitations. If issues arise, an alternative is to
      // draw paths on a larger OffscreenCanvas and use getImageData.
      combinedPath.addPath(new Path2D(d));
    } catch (e) {
      console.warn('Worker: Invalid path string skipped', d, e);
      // Optionally, post an error or warning back to the main thread
    }
  });

  const pixelBitmap = new Uint8Array(logicalCols * logicalRows);
  const scaleXToSvg = svgViewBoxWidth / canvasWidth;
  const scaleYToSvg = svgViewBoxHeight / canvasHeight;

  let processedPixels = 0;
  const totalPixelsToProcess = logicalCols * logicalRows;
  const progressUpdateInterval = Math.floor(logicalRows / 20) || 1; // Update roughly 20 times

  for (let r = 0; r < logicalRows; r++) {
    for (let c = 0; c < logicalCols; c++) {
      const pixelCanvasX = c * pixelSize;
      const pixelCanvasY = r * pixelSize;
      const pixelCenterXCanvas = pixelCanvasX + pixelSize / 2;
      const pixelCenterYCanvas = pixelCanvasY + pixelSize / 2;

      const svgCoordX = pixelCenterXCanvas * scaleXToSvg;
      const svgCoordY = pixelCenterYCanvas * scaleYToSvg;

      if (ctx.isPointInPath(combinedPath, svgCoordX, svgCoordY)) {
        pixelBitmap[r * logicalCols + c] = 1;
      } else {
        pixelBitmap[r * logicalCols + c] = 0;
      }
      processedPixels++;
    }
    if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        self.postMessage({ type: 'progress', progress: (processedPixels / totalPixelsToProcess) * 100 });
    }
  }

  self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
};
