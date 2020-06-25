import chromep from 'chrome-promise';
import { DropResult } from 'react-beautiful-dnd';

export const getItemIndex = (activeElement: Element, listItems: NodeListOf<Element>) => {
  let itemIndex = 0;
  for (let [i, value] of listItems.entries()) {
    if (value === activeElement) {
      itemIndex = i;
    }
  }
  return itemIndex;
};

// Divide array into groups according to passed callback
export function groupBy<T>(array: Array<T>, filter: (value: T, index: number, array: Array<T>) => boolean): [T[], T[]] {
  let pass: T[] = [];
  let fail: T[] = [];
  array.forEach((e, index, array) => (filter(e, index, array) ? pass : fail).push(e));
  return [pass, fail];
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
  setAllWindows: React.Dispatch<React.SetStateAction<ChromeWindow[]>>
) => {
  // Get window
  const refreshedWindow = await chromep.windows.get(removeInfo.windowId, { populate: true });

  // If tab closed was last in the window
  if (!refreshedWindow.tabs?.length) {
    setAllWindows(prevWindows => prevWindows.filter(window => window.id !== refreshedWindow.id));
    return;
  }

  setAllWindows(prevWindows =>
    prevWindows.map(window => {
      return window.id === refreshedWindow.id
        ? ({ ...refreshedWindow, isActiveWindow: window.isActiveWindow } as ChromeWindow)
        : window;
    })
  );
};

export const moveTab = (
  result: DropResult,
  currentWindow: ChromeWindow,
  setCurrentWindow: React.Dispatch<React.SetStateAction<ChromeWindow>>
): void => {
  const { destination, source, draggableId } = result;
  if (!destination) {
    return;
  }

  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    return;
  }

  chromep.tabs.move(+draggableId, { index: destination.index });

  const newTabList = Array.from(currentWindow.tabs!);
  const movedTab = newTabList.splice(source.index, 1)[0];
  newTabList.splice(destination.index, 0, movedTab);
  setCurrentWindow(currentWindow => ({
    ...currentWindow,
    tabs: newTabList,
  }));
};
