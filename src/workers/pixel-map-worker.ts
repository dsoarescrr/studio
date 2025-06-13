
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

self.onmessage = (event: MessageEvent<any>) => {
  try {
    // Verifica se event.data existe antes de tentar desestruturá-lo
    if (!event.data) {
      self.postMessage({ type: 'error', error: 'Worker Error: No data received in onmessage.' });
      return;
    }

    const {
      pathStrings,
      // canvasWidth, // Não usado diretamente no worker para cálculo do bitmap lógico
      // canvasHeight, // Não usado diretamente no worker para cálculo do bitmap lógico
      svgViewBoxWidth,
      svgViewBoxHeight,
      logicalCols,
      logicalRows,
      // pixelSize, // Não usado diretamente no worker para cálculo do bitmap lógico
    } = event.data as WorkerInput;

    // Envia um progresso inicial para confirmar que os dados foram recebidos e desestruturados
    self.postMessage({ type: 'progress', progress: 1.0 });

    // A lógica de processamento de pixels principal permanece comentada por enquanto.
    // O objetivo deste passo é apenas confirmar a recepção dos dados.
    /*
    if (!pathStrings || pathStrings.length === 0) {
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' });
      return;
    }
    if (logicalCols === 0 || logicalRows === 0) {
        self.postMessage({ type: 'error', error: 'Worker Error: logicalCols or logicalRows is zero.' });
        return;
    }

    const combinedPath2D = new Path2D();
    for (const d of pathStrings) {
        try {
            combinedPath2D.addPath(new Path2D(d));
        } catch (e: any) {
            self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string: ${d}. Details: ${e.message}` });
            return;
        }
    }
    if (pathStrings.length > 0 && !combinedPath2D) {
        self.postMessage({ type: 'error', error: 'Worker Error: Failed to create combined Path2D object from pathStrings.' });
        return;
    }


    const offscreenCanvas = new OffscreenCanvas(svgViewBoxWidth, svgViewBoxHeight);
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' });
      return;
    }

    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' });
        return;
    }
    
    const pixelBitmap = new Uint8Array(totalPixelsToProcess);
    let processedPixels = 0;
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 50));

    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        const svgCoordX = (c + 0.5) * (svgViewBoxWidth / logicalCols);
        const svgCoordY = (r + 0.5) * (svgViewBoxHeight / logicalRows);
        
        if (ctx.isPointInPath(combinedPath2D, svgCoordX, svgCoordY)) {
          pixelBitmap[r * logicalCols + c] = 1;
        } else {
          pixelBitmap[r * logicalCols + c] = 0;
        }
      }
      processedPixels += logicalCols;
      if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
            self.postMessage({ type: 'progress', progress: Math.min(100, currentProgress) });
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer }, [pixelBitmap.buffer]);
    */

  } catch (e: any) {
    // Garante que qualquer erro dentro do onmessage seja enviado para a thread principal
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${errorMessage}` });
  }
};
