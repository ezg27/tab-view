import chromep from 'chrome-promise';

export const getItemIndex = (activeElement: Element, listItems: NodeListOf<Element>) => {
  let itemIndex = 0;
  for (let [i, value] of listItems.entries()) {
    if (value === activeElement) {
      itemIndex = i;
    }
  }
  return itemIndex;
}

export const setActiveTab = async (tab: chrome.tabs.Tab, parentWindow: chrome.windows.Window): Promise<void> => {
  // Return if window is invalid
  if (!tab.id) return;

  // If tab is in another window, navigate and close extension
  const current = await chromep.windows.getCurrent();
  if (current.id !== parentWindow.id) {
    await chromep.windows.update(parentWindow.id, { focused: true });
    window.close();
  }

  // Return if current tab selected
  if (tab.active) return;

  // Navigate to tab in current window
  await chromep.tabs.update(tab.id, { active: true });
};

export const closeTab = async (tab: chrome.tabs.Tab): Promise<void> => {
  // Return if window is invalid
  if (!tab.id) return;

  // Remove tab
  await chromep.tabs.remove(tab.id);
};

export const refreshWindow = async (
  _tabId: number,
  removeInfo: chrome.tabs.TabRemoveInfo,
  setCurrentWindow: React.Dispatch<React.SetStateAction<ChromeWindow>>,
  setOtherWindows: React.Dispatch<React.SetStateAction<ChromeWindow[]>>
) => {
  // Get window tab was removed from
  const refreshedWindow = await chromep.windows.get(removeInfo.windowId, { populate: true });

  // If active window
  setCurrentWindow(currentWindow =>
    currentWindow.id === refreshedWindow.id
      ? ({ ...refreshedWindow, isActiveWindow: true } as ChromeWindow)
      : currentWindow
  );

  // If tab closed was last in the window
  if (!refreshedWindow.tabs?.length) {
    setOtherWindows(windows => windows.filter(window => window.id !== refreshedWindow.id));
    return;
  }

  setOtherWindows(windows =>
    windows.map(window => {
      return window.id === refreshedWindow.id
        ? ({ ...refreshedWindow, isActiveWindow: false } as ChromeWindow)
        : window;
    })
  );
};
