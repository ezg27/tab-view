import Fuse from 'fuse.js';
import { useMemo } from 'react';

export function useFuzzySearch<T>(keyword: string, data: T[], options: Fuse.IFuseOptions<T>): T[] {
  if (!keyword) return data;
  const searcher = useMemo(() => {
    console.log('lsakdjglkasjdglkjasdg');
    return new Fuse(data, options);
  }, [data, options]);
  return searcher.search(keyword).map(tab => tab.item);
}
