
// Ensure 'use client' is REMOVED from here if it was present.

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

self.onmessage = (event: MessageEvent<any>) => { // Alterado para any para o teste
  try {
    // Enviar um progresso fixo assim que onmessage é chamado, ignorando event.data por agora
    self.postMessage({ type: 'progress', progress: 5.0 }); // Progresso de teste

    // A lógica original está comentada para este teste
    /*
    const {
      pathStrings,
      canvasWidth,
      canvasHeight,
      svgViewBoxWidth,
      svgViewBoxHeight,
      logicalCols,
      logicalRows,
      pixelSize,
    } = event.data as WorkerInput;

    if (!pathStrings || pathStrings.length === 0) {
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' });
      return;
    }

    if (canvasWidth === 0 || canvasHeight === 0 || logicalCols === 0 || logicalRows === 0 || pixelSize === 0) {
      self.postMessage({ type: 'error', error: 'Worker Error: One or more input dimensions (canvas, logical, pixelSize) are zero.' });
      return;
    }

    const offscreenCanvas = new OffscreenCanvas(1, 1);
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' });
      return;
    }

    const combinedPath = new Path2D();
    try {
      pathStrings.forEach(d => {
        if (d && typeof d === 'string') {
          combinedPath.addPath(new Path2D(d));
        }
      });
    } catch (e: any) {
      self.postMessage({ type: 'error', error: `Worker Error: Failed to construct Path2D from pathStrings. Message: ${e.message || String(e)}` });
      return;
    }

    const pixelBitmap = new Uint8Array(logicalCols * logicalRows);
    const scaleXToSvg = svgViewBoxWidth / canvasWidth;
    const scaleYToSvg = svgViewBoxHeight / canvasHeight;

    let processedPixels = 0;
    const totalPixelsToProcess = logicalCols * logicalRows;

    if (totalPixelsToProcess === 0) {
      self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero (logicalCols or logicalRows is 0).' });
      return;
    }
    
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 100)); 

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

      if (r < 5 || r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
          self.postMessage({ type: 'progress', progress: currentProgress });
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
    */

  } catch (e: any) {
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${e.message || String(e)}` });
  }
};
