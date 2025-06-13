
// src/workers/pixel-map-worker.ts

// Tenta enviar uma mensagem de progresso imediatamente ao ser carregado.
// Se isto não for recebido, há um problema fundamental com a criação/comunicação do worker.
try {
  self.postMessage({ type: 'progress', progress: 10 }); // Envia 10% como teste
} catch (e) {
  // Tenta enviar uma mensagem de erro se o postMessage inicial falhar
  self.postMessage({ type: 'error', error: `Worker initial postMessage failed: ${e instanceof Error ? e.message : String(e)}` });
}

// A lógica original de onmessage e cálculo de bitmap é temporariamente removida para depuração.
// Se a mensagem de progresso de 10% acima for recebida, restauraremos a lógica gradualmente.

/*
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
  // self.postMessage({ type: 'progress', progress: 0.1 });

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
      } else {
        console.warn('Worker: Invalid or empty path string skipped:', d);
      }
    });
    if (pathStrings.length > 0 && combinedPath.toString() === new Path2D().toString()) { // Aproximação para verificar se algo foi adicionado
         // self.postMessage({ type: 'error', error: 'Worker Error: CombinedPath2D is empty after processing pathStrings.' });
         // return;
    }
  } catch (e: any) {
    self.postMessage({ type: 'error', error: `Worker Error: Failed to construct Path2D. ${e.message || e}` });
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
  
  // self.postMessage({ type: 'progress', progress: 0.1 }); // Progresso inicial

  const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 100)); // Atualiza ~100 vezes

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
      } else {
        console.warn('Worker: Progress calculation resulted in non-finite number.');
      }
    }
  }
  
  // self.postMessage({ type: 'progress', progress: 99.9 }); // Progresso antes de 'done'
  self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
};
*/
