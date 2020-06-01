import Fuse from 'fuse.js';

export function useFuzzySearch<T>(keyword: string, data: T[], options: Fuse.IFuseOptions<T>): T[] {
  if (!keyword) return data;
  const searcher = new Fuse(data, options);
  return searcher.search(keyword).map(tab => tab.item);
}
