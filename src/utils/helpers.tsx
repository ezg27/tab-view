import chromep from 'chrome-promise';
import { DropResult } from 'react-beautiful-dnd';
import { mutate } from 'swr';

export const getItemIndex = (activeElement: Element, listItems: NodeListOf<Element>) => {
  let itemIndex = 0;
  for (let [i, value] of listItems.entries()) {
    if (value === activeElement) {
      itemIndex = i;
    }
  }
  return itemIndex;
};

export const getWindows = async () => {
  const currentWindow = await chromep.windows.getCurrent();
  const windows = (await chromep.windows.getAll({ populate: true })).map(window => {
    return {
      ...window,
      isActiveWindow: window.id === currentWindow.id,
    } as ChromeWindow;
  });
  return windows;
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

export const moveTab = (result: DropResult): void => {
  const { destination, source, draggableId } = result;

  if (!destination) {
    return;
  }

  if (destination.droppableId === source.droppableId && destination.index === source.index) {
    return;
  }

  mutate(
    'getWindows',
    async (prevWindows: ChromeWindow[]) => {
      if (source.droppableId === destination.droppableId) {
        // Optimistic reorder tabs
        const window = prevWindows.find(window => window.id === Number(source.droppableId));

        if (!window) {
          // TODO: throw error
          return;
        }

        const newTabList = Array.from(window.tabs!);
        const movedTab = newTabList.splice(source.index, 1)[0];
        newTabList.splice(destination.index, 0, movedTab);
        return prevWindows.map(window => {
          return window.id === Number(source.droppableId) ? ({ ...window, tabs: newTabList } as ChromeWindow) : window;
        });
      } else {
        // Optimistic move tab between windows
        const sourceWindow = prevWindows.find(window => window.id === Number(source.droppableId));
        const destinationWindow = prevWindows.find(window => window.id === Number(destination.droppableId));

        if (!sourceWindow || !destinationWindow) {
          // TODO: throw error
          return;
        }

        const newSourceTabList = Array.from(sourceWindow.tabs!);
        const newDestinationTabList = Array.from(destinationWindow.tabs!);

        const movedTab = newSourceTabList.splice(source.index, 1)[0];
        newDestinationTabList.splice(destination.index, 0, movedTab);

        return prevWindows.map(window => {
          return window.id === Number(source.droppableId)
            ? ({ ...window, tabs: newSourceTabList } as ChromeWindow)
            : Number(destination.droppableId)
            ? ({ ...window, tabs: newDestinationTabList } as ChromeWindow)
            : window;
        });
      }
    },
    false
  );

  chrome.tabs.move(Number(draggableId), {
    windowId: Number(destination.droppableId),
    index: destination.index,
  });
};

// ----- Chrome listeners -----

export const onMovedListener = async (tabId: number, moveInfo: chrome.tabs.TabMoveInfo): Promise<void> => {
  mutate('getWindows');
};

export const onAttachedListener = async (tabId: number, attachInfo: chrome.tabs.TabAttachInfo): Promise<void> => {
  mutate('getWindows');
};

export const onRemovedListener = async (_tabId: number, removeInfo: chrome.tabs.TabRemoveInfo): Promise<void> => {
  const refreshedWindow = await chromep.windows.get(removeInfo.windowId, {
    populate: true,
  });

  mutate(
    'getWindows',
    async (prevWindows: ChromeWindow[]) => {
      // Handle if closed tab was last in window
      if (!refreshedWindow || !refreshedWindow.tabs?.length) {
        return prevWindows.filter(window => window.id !== removeInfo.windowId);
      }

      // Replace stale window with updated
      return prevWindows.map(window => {
        return window.id === refreshedWindow.id
          ? ({
              ...refreshedWindow,
              isActiveWindow: window.isActiveWindow,
            } as ChromeWindow)
          : window;
      });
    },
    true
  );
};
