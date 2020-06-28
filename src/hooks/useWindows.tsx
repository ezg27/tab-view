import { useEffect } from 'react';
import useSWR from 'swr';
import { getWindows, groupBy, onAttachedListener, onMovedListener, onRemovedListener } from '../utils/helpers';

export function useWindows() {
  const { data: windows, error } = useSWR('getWindows', getWindows, {
    initialData: [] as ChromeWindow[],
  });

  // On tab moved listener
  useEffect(() => {
    chrome.tabs.onMoved.addListener(onMovedListener);
    return () => {
      chrome.tabs.onMoved.removeListener(onMovedListener);
    };
  }, []);

  // On tab attached listener
  useEffect(() => {
    chrome.tabs.onAttached.addListener(onAttachedListener);
    return () => {
      chrome.tabs.onAttached.removeListener(onAttachedListener);
    };
  }, []);

  // On tab removed listener
  useEffect(() => {
    chrome.tabs.onRemoved.addListener(onRemovedListener);
    return () => {
      chrome.tabs.onRemoved.removeListener(onRemovedListener);
    };
  }, []);

  // Group according to current active window
  const groupedWindows = groupBy(windows!, window => window.isActiveWindow);
  return { windows: groupedWindows, error };
}
