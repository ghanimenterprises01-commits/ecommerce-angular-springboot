export function optimizeImageUrl(
  url: string | null | undefined,
  width: number = 400
): string {
  if (!url) return '';

  // ImageKit — path-based transformation
  if (url.includes('ik.imagekit.io')) {
    const base = url.split('/').slice(0, 4).join('/'); // https://ik.imagekit.io/id
    const path = '/' + url.split('/').slice(4).join('/');
    return `${base}/tr:w-${width},f-auto,q-auto${path}`;
  }

  // Cloudinary — keep working for existing product images
  if (url.includes('cloudinary.com')) {
    return url.replace('/upload/', `/upload/w_${width},f_auto,q_auto/`);
  }

  return url;
}
