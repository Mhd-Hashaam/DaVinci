import html2canvas from 'html2canvas';

export class CanvasCaptureService {
    /**
     * Captures the visual state of the Mirror container.
     * Uses canvas.toBlob() for 3D contexts when possible for best quality,
     * falling back to html2canvas for DOM composition.
     */
    static async captureMirror(container: HTMLElement): Promise<Blob> {
        return new Promise(async (resolve, reject) => {
            try {
                // Check if we have a direct canvas (3D mode)
                const canvas = container.querySelector('canvas');
                if (canvas) {
                    // 3D Mode: Capture WebGL context directly
                    canvas.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Failed to capture WebGL canvas'));
                    }, 'image/png', 1.0);
                } else {
                    // 2D Mode or Composite: Use html2canvas
                    const canvasEl = await html2canvas(container, {
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: null, // Transparent background
                        scale: 2, // High resolution capture
                        logging: false
                    });
                    canvasEl.toBlob((blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Failed to capture HTML element'));
                    }, 'image/png', 1.0);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Compresses an image Blob to WebP format with specified quality.
     */
    static async compressToWebP(blob: Blob, quality = 0.85): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get 2D context'));
                    return;
                }
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((compressedBlob) => {
                    URL.revokeObjectURL(url);
                    if (compressedBlob) resolve(compressedBlob);
                    else reject(new Error('Compression failed'));
                }, 'image/webp', quality);
            };

            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };

            img.src = url;
        });
    }

    /**
     * Resizes an image Blob to target dimensions while maintaining aspect ratio (cover).
     */
    static async resizeImage(blob: Blob, targetWidth: number, targetHeight: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get 2D context'));
                    return;
                }

                // Calculate scaling to cover
                const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
                const x = (targetWidth / 2) - (img.width / 2) * scale;
                const y = (targetHeight / 2) - (img.height / 2) * scale;

                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

                canvas.toBlob((resizedBlob) => {
                    URL.revokeObjectURL(url);
                    if (resizedBlob) resolve(resizedBlob);
                    else reject(new Error('Resizing failed'));
                }, 'image/webp', 0.85);
            };

            img.onerror = (err) => {
                URL.revokeObjectURL(url);
                reject(err);
            };

            img.src = url;
        });
    }
}
