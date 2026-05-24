const loadedImages = new Set<string>();

export const isImageCached = (url: string) => loadedImages.has(url);

export const markImageAsCached = (url: string) => {
  loadedImages.add(url);
};
