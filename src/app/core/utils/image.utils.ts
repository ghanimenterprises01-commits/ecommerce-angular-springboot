export function optimizeImageUrl(
  url: string | null | undefined,
  width: number = 400
): string {
  if (!url) return '';
  if (!url.includes('cloudinary.com')) return url;

  return url.replace(
    '/upload/',
    `/upload/w_${width},f_auto,q_auto/`
  );
}