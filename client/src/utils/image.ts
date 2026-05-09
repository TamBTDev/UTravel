export const getImageUrl = (path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }
  return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${path}`;
};
