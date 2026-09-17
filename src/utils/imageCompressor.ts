/**
 * Smart Client-Side Image Compressor
 * Resizes large iPad/iPhone/camera photos down to ~80KB-120KB
 * Prevents LocalStorage QuotaExceededError and enables real-time multi-device sync
 */

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

export async function compressImage(
  fileOrBlob: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<CompressedImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));

    reader.onload = () => {
      const img = new Image();

      img.onerror = () => reject(new Error('Formato de imagen no compatible.'));

      img.onload = () => {
        let { width, height } = img;

        // Calculate scaling preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador gráfico.'));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill background white in case of transparent PNG/WebP turned to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG for maximum cross-browser compatibility and small payload
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          width,
          height,
          sizeBytes: approxBytes,
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
