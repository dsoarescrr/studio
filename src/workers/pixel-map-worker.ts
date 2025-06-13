
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
  // Forçar um progresso inicial para teste de comunicação
  self.postMessage({ type: 'progress', progress: 0.1 });

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

  if (!pathStrings || pathStrings.length === 0) {
    self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' });
    return;
  }

  if (canvasWidth === 0 || canvasHeight === 0 || logicalCols === 0 || logicalRows === 0 || pixelSize === 0) {
    self.postMessage({ type: 'error', error: 'Worker Error: One or more input dimensions (canvas, logical, pixelSize) are zero.' });
    return;
  }


  const offscreenCanvas = new OffscreenCanvas(1, 1); // Canvas mínimo para usar o contexto
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
      } else {
        // Não envia erro, mas regista se uma string 'd' específica for inválida.
        console.warn('Worker: Invalid or empty path string skipped during Path2D construction:', d);
      }
    });
    // Verifica se algo foi adicionado ao combinedPath; se não, pode ser problemático.
    // No entanto, um Path2D vazio é tecnicamente válido, isPointInPath apenas retornará false.
  } catch (e: any) {
    self.postMessage({ type: 'error', error: `Worker Error: Failed to construct Path2D from pathStrings. ${e.message || e}` });
    return;
  }

  const pixelBitmap = new Uint8Array(logicalCols * logicalRows);
  const scaleXToSvg = svgViewBoxWidth / canvasWidth;
  const scaleYToSvg = svgViewBoxHeight / canvasHeight;

  let processedPixels = 0;
  const totalPixelsToProcess = logicalCols * logicalRows;

  if (totalPixelsToProcess === 0) {
    self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' });
    return;
  }

  // Ajustar o intervalo de atualização para ser mais frequente, especialmente no início.
  // Tenta atualizar ~100 vezes durante o processo.
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

    // Enviar progresso com mais frequência, especialmente no início, e no final.
    if (r < 10 || r % progressUpdateInterval === 0 || r === logicalRows - 1) {
      const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
      if (Number.isFinite(currentProgress)) {
        self.postMessage({ type: 'progress', progress: currentProgress });
      } else {
        console.warn('Worker: Progress calculation resulted in non-finite number.', {processedPixels, totalPixelsToProcess});
      }
    }
  }

  // Forçar um progresso final para teste de comunicação
  self.postMessage({ type: 'progress', progress: 99.9 });
  self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
};
