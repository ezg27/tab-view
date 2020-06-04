import chromep from 'chrome-promise';
import { useEffect, useState } from 'react';
import { refreshWindow } from '../utils/helpers';

export const useWindows = (): [ChromeWindow, ChromeWindow[]] => {
  const [currentWindow, setCurrentWindow] = useState<ChromeWindow>({} as ChromeWindow);
  const [otherWindows, setOtherWindows] = useState<ChromeWindow[]>([]);

  // Get tabs for all windows
  useEffect(() => {
    const getWindows = async () => {
      const currentWindow = await chromep.windows.getCurrent({ populate: true });
      const withActiveFlag: ChromeWindow = {
        ...currentWindow,
        isActiveWindow: true,
      };
      setCurrentWindow(withActiveFlag);

      const otherWindows = (await chromep.windows.getAll({ populate: true }))
        .filter(windowItem => windowItem.id !== currentWindow.id)
        .map(
          window =>
            ({
              ...window,
              isActiveWindow: false,
            } as ChromeWindow)
        );
      setOtherWindows(otherWindows);
    };
    getWindows();
  }, []);

  // On tab moved listener
  useEffect(() => {
    const onMovedListener = async (tabId: number, moveInfo: chrome.tabs.TabMoveInfo): Promise<void> => {
      // Get window
      const refreshedWindow = await chromep.windows.get(moveInfo.windowId, { populate: true });

      // If active window
      setCurrentWindow(currentWindow =>
        currentWindow.id === refreshedWindow.id
          ? ({
              ...refreshedWindow,
              isActiveWindow: true,
            } as ChromeWindow)
          : currentWindow
      );
    };

    chrome.tabs.onMoved.addListener(onMovedListener);
    return () => {
      chrome.tabs.onMoved.removeListener(onMovedListener);
    };
  }, [currentWindow, otherWindows]);

  // On tab removed listener
  useEffect(() => {
    const onRemovedListener = async (tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): Promise<void> => {
      return await refreshWindow(tabId, removeInfo, setCurrentWindow, setOtherWindows);
    };

    chrome.tabs.onRemoved.addListener(onRemovedListener);
    return () => {
      chrome.tabs.onRemoved.removeListener(onRemovedListener);
    };
  }, [currentWindow, otherWindows]);

  return [currentWindow, otherWindows];
};
