
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
  try {
    if (!event.data) {
      self.postMessage({ type: 'error', error: 'Worker Error: No data received in onmessage.' } as WorkerErrorMessage);
      return;
    }
    
    // Confirmação inicial de que onmessage foi chamado e os dados foram recebidos
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
      self.postMessage({ type: 'error', error: 'Worker Error: pathStrings array is empty or undefined.' } as WorkerErrorMessage);
      return;
    }

    const combinedPath2D = new Path2D();
    for (const d of pathStrings) {
      if (typeof d !== 'string' || d.trim() === '') {
        console.warn("Worker: Encountered empty or invalid path string, skipping.");
        continue;
      }
      try {
        combinedPath2D.addPath(new Path2D(d));
      } catch (e: any) {
        self.postMessage({ type: 'error', error: `Worker Error: Invalid Path2D string: "${d.substring(0, 50)}...". Details: ${e.message}` } as WorkerErrorMessage);
        return; 
      }
    }
    
    // Configuração do OffscreenCanvas para usar isPointInPath
    // O tamanho do OffscreenCanvas aqui não precisa corresponder ao canvas visível,
    // ele só precisa ser grande o suficiente para o Path2D. O SVG ViewBox é a referência correta.
    const offscreenCanvas = new OffscreenCanvas(svgViewBoxWidth, svgViewBoxHeight);
    const ctx = offscreenCanvas.getContext('2d');

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
    const progressUpdateInterval = Math.max(1, Math.floor(logicalRows / 100)); // Cerca de 100 atualizações de progresso

    for (let r = 0; r < logicalRows; r++) {
      for (let c = 0; c < logicalCols; c++) {
        // Coordenada do centro do pixel lógico no espaço SVG
        // Mapeia as coordenadas lógicas (0 a logicalCols-1, 0 a logicalRows-1)
        // para as coordenadas do viewBox do SVG.
        const svgCoordX = (c + 0.5) * (svgViewBoxWidth / logicalCols);
        const svgCoordY = (r + 0.5) * (svgViewBoxHeight / logicalRows);
        
        if (ctx.isPointInPath(combinedPath2D, svgCoordX, svgCoordY)) {
          pixelBitmap[r * logicalCols + c] = 1; // Pixel está dentro do SVG
        } else {
          pixelBitmap[r * logicalCols + c] = 0; // Pixel está fora
        }
      }
      // Atualiza o progresso após cada linha processada
      processedPixels += logicalCols;
      if (r % progressUpdateInterval === 0 || r === logicalRows - 1) {
        const currentProgress = (processedPixels / totalPixelsToProcess) * 100;
        if (Number.isFinite(currentProgress)) {
            // Envia o progresso de 0.1 (já enviado) até 99.9 (antes do 'done')
            self.postMessage({ type: 'progress', progress: Math.min(99.9, 0.1 + (currentProgress * 0.998)) } as WorkerProgressMessage);
        }
      }
    }
    
    self.postMessage({ type: 'done', bitmap: pixelBitmap.buffer } as WorkerDoneMessage, [pixelBitmap.buffer]);
    
  } catch (e: any) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    self.postMessage({ type: 'error', error: `Worker uncaught error in onmessage: ${errorMessage}` } as WorkerErrorMessage);
  }
};
