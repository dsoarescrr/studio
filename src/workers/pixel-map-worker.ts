
// src/workers/pixel-map-worker.ts

interface WorkerInput {
  pathStrings: string[];
  canvasWidth: number; // Manter para futura referência, mesmo que não usado diretamente para bitmap lógico
  canvasHeight: number; // Manter para futura referência
  svgViewBoxWidth: number;
  svgViewBoxHeight: number;
  logicalCols: number;
  logicalRows: number;
  pixelSize: number; // Manter para futura referência
}

// Tipos de mensagens que o worker pode enviar
type WorkerProgressMessage = { type: 'progress'; progress: number };
type WorkerDoneMessage = { type: 'done'; bitmap: ArrayBuffer };
type WorkerErrorMessage = { type: 'error'; error: string };
type WorkerMessage = WorkerProgressMessage | WorkerDoneMessage | WorkerErrorMessage;


self.onmessage = (event: MessageEvent<WorkerInput>) => {
  try {
    if (!event.data) {
      self.postMessage({ type: 'error', error: 'Worker Error: No data received in onmessage.' } as WorkerErrorMessage);
      return;
    }
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

    // Confirmação de que os dados foram recebidos e desestruturados
    self.postMessage({ type: 'progress', progress: 1.0 } as WorkerProgressMessage);

    // STEP 2: Criação do Path2D
    if (!pathStrings || pathStrings.length === 0) {
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' } as WorkerErrorMessage);
      return;
    }

    const combinedPath2D = new Path2D();
    for (const d of pathStrings) {
      if (typeof d !== 'string' || d.trim() === '') {
        // self.postMessage({ type: 'error', error: `Worker Error: Invalid or empty path string encountered.` });
        // return; // Pode ser melhor continuar e tentar com os outros caminhos, ou falhar aqui. Por agora, vamos permitir que continue.
        console.warn("Worker: Encountered empty or invalid path string, skipping.");
        continue;
      }
      try {
        combinedPath2D.addPath(new Path2D(d));
      } catch (e: any) {
        self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string: "${d.substring(0, 50)}...". Details: ${e.message}` } as WorkerErrorMessage);
        return; // Falha crítica se um path não puder ser adicionado.
      }
    }
    
    // Confirmação de que o Path2D foi criado (ou o loop terminou)
    self.postMessage({ type: 'progress', progress: 2.0 } as WorkerProgressMessage);


    // STEP 3: Processamento de Pixels e criação do Bitmap (permanece comentado por agora)
    /*
    const offscreenCanvas = new OffscreenCanvas(svgViewBoxWidth, svgViewBoxHeight);
    const ctx = offscreenCanvas.getContext('2d');

    if (!ctx) {
      self.postMessage({ type: 'error', error: 'Worker Error: Failed to get OffscreenCanvas 2D context.' } as WorkerErrorMessage);
      return;
    }

    const totalPixelsToProcess = logicalCols * logicalRows;
    if (totalPixelsToProcess === 0) {
        self.postMessage({ type: 'error', error: 'Worker Error: Total pixels to process is zero.' }as WorkerErrorMessage);
        return;
    }
    
    const pixelBitmap = new Uint8Array(totalPixelsToProcess);
    let processedPixels = 0;
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 50)); // Cerca de 50 atualizações

    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        // Coordenada do centro do pixel lógico no espaço SVG
        const svgCoordX = (c + 0.5) * (svgViewBoxWidth / logicalCols);
        const svgCoordY = (r + 0.5) * (svgViewBoxHeight / logicalRows);
        
        if (ctx.isPointInPath(combinedPath2D, svgCoordX, svgCoordY)) {
          pixelBitmap[r * logicalCols + c] = 1; // Pixel está dentro do SVG
        } else {
          pixelBitmap[r * logicalCols + c] = 0; // Pixel está fora
        }
      }
      processedPixels += logicalCols;
      if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
            self.postMessage({ type: 'progress', progress: Math.min(100, currentProgress) } as WorkerProgressMessage);
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer } as WorkerDoneMessage, [pixelBitmap.buffer]);
    */

  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${errorMessage}` } as WorkerErrorMessage);
  }
};
