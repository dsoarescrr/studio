
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

  const offscreenCanvas = new OffscreenCanvas(1, 1);
  const ctx = offscreenCanvas.getContext('2d');

  if (!ctx) {
    self.postMessage({ type: 'error', error: 'Failed to get OffscreenCanvas context' });
    return;
  }

  const combinedPath = new Path2D();
  pathStrings.forEach(d => {
    try {
      combinedPath.addPath(new Path2D(d));
    } catch (e) {
      console.warn('Worker: Invalid path string skipped', d, e);
    }
  });

  const pixelBitmap = new Uint8Array(logicalCols * logicalRows);
  const scaleXToSvg = svgViewBoxWidth / canvasWidth;
  const scaleYToSvg = svgViewBoxHeight / canvasHeight;

  let processedPixels = 0;
  const totalPixelsToProcess = logicalCols * logicalRows;

  if (totalPixelsToProcess === 0) {
    self.postMessage({ type: 'error', error: 'Total pixels to process is zero. Check logicalCols/logicalRows input to worker.' });
    return;
  }

  // Ajustar o intervalo de atualização para ser mais frequente
  // Atualiza aproximadamente 50 vezes durante o processo, ou a cada linha se houver menos de 50 linhas.
  const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 50));

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
      const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
      if (Number.isFinite(currentProgress)) {
        self.postMessage({ type: 'progress', progress: currentProgress });
      } else {
        // Se o progresso não for finito, pode haver um problema com os inputs
        console.warn('Worker: Progress calculation resulted in non-finite number.', {processedPixels, totalPixelsToProcess});
      }
    }
  }

  self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
};
