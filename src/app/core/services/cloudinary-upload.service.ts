import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { getItem } from '../utils/storage.utils';

@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {

  async upload(file: File, folder = 'products'): Promise<string> {
    const compressed = await this.resizeAndCompress(file);

    const formData = new FormData();
    formData.append('file', compressed);
    formData.append('folder', folder);

    const token = getItem('token');
    const res = await fetch(`${environment.apiUrl}/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
    const data = await res.json();

    // Backend should return { url: "https://ik.imagekit.io/..." }
    return data.url as string;
  }

  // Compress and resize client-side before sending — reduces backend load and upload time
  private resizeAndCompress(file: File, maxWidth = 1200, quality = 0.82): Promise<File> {
    return new Promise((resolve) => {
      if (file.size < 200_000) {
        resolve(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const outType = file.type === 'image/png' ? 'image/jpeg' : file.type;
        const outName = file.name.replace(/\.[^.]+$/, '.jpg');

        canvas.toBlob(
          (blob) => resolve(new File([blob!], outName, { type: outType })),
          outType,
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  }
}
