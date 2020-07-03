import chromep from 'chrome-promise';
import { DraggableLocation, DropResult } from 'react-beautiful-dnd';
import { mutate } from 'swr';

export function getItemIndex(activeElement: Element, listItems: NodeListOf<Element>): number {
  let itemIndex = 0;
  for (let [i, value] of listItems.entries()) {
    if (value === activeElement) {
      itemIndex = i;
    }
  }
  return itemIndex;
}

export async function getWindows(): Promise<ChromeWindow[]> {
  const currentWindow = await chromep.windows.getCurrent();
  const windows = (await chromep.windows.getAll({ populate: true })).map(window => {
    return {
      ...window,
      isActiveWindow: window.id === currentWindow.id,
    } as ChromeWindow;
  });
  return windows;
}

// Divide array into groups according to passed callback
export function groupBy<T>(array: Array<T>, filter: (value: T, index: number, array: Array<T>) => boolean): [T[], T[]] {
  let pass: T[] = [];
  let fail: T[] = [];
  array.forEach((e, index, array) => (filter(e, index, array) ? pass : fail).push(e));
  return [pass, fail];
}

export function validateFavIcon(tab: chrome.tabs.Tab): string {
  if (!tab.favIconUrl) {
    return `chrome://favicon/size/16/${tab.url}`;
  }

  // Check if tab is for another chrome extension
  if (tab.favIconUrl.indexOf('chrome://favicon/') === -1 && tab.favIconUrl.indexOf('chrome-extension://') === -1) {
    // Tab is a normal url
    return tab.favIconUrl;
  }

  // Add necessary prefix to obtain favicon for chrome extension
  return `chrome://favicon/${tab.favIconUrl}`;
}

export async function setActiveTab(tab: chrome.tabs.Tab, parentWindow: chrome.windows.Window): Promise<void> {
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
}

export async function closeTab(tab: chrome.tabs.Tab): Promise<void> {
  // Return if window is invalid
  if (!tab.id) return;

  // Remove tab
  await chromep.tabs.remove(tab.id);
}

export function moveTab(result: DropResult): void {
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
        return optimisticReorderTabs(prevWindows, destination, source);
      }

      return optimisticMoveTabBetweenWindows(prevWindows, destination, source);
    },
    false
  );

  chrome.tabs.move(Number(draggableId), {
    windowId: Number(destination.droppableId),
    index: destination.index,
  });
}

function optimisticReorderTabs(
  windows: ChromeWindow[],
  destination: DraggableLocation,
  source: DraggableLocation
): ChromeWindow[] | undefined {
  const window = windows.find(window => window.id === Number(source.droppableId));

  if (!window) {
    throw new Error('Window could not be found for optimistic reorder.');
  }

  const newTabList = Array.from(window.tabs!);
  const movedTab = newTabList.splice(source.index, 1)[0];
  newTabList.splice(destination.index, 0, movedTab);
  return windows.map(window => {
    return window.id === Number(source.droppableId)
      ? ({
          ...window,
          tabs: newTabList,
        } as ChromeWindow)
      : window;
  });
}

function optimisticMoveTabBetweenWindows(
  windows: ChromeWindow[],
  destination: DraggableLocation,
  source: DraggableLocation
): ChromeWindow[] {
  // Optimistic move tab between windows
  const sourceWindow = windows.find(window => window.id === Number(source.droppableId));
  const destinationWindow = windows.find(window => window.id === Number(destination.droppableId));

  if (!sourceWindow || !destinationWindow) {
    throw new Error('Source or destination windows could not be found for optimsitic move between windows.');
  }

  const newSourceTabList = Array.from(sourceWindow.tabs!);
  const newDestinationTabList = Array.from(destinationWindow.tabs!);

  const movedTab = newSourceTabList.splice(source.index, 1)[0];
  newDestinationTabList.splice(destination.index, 0, movedTab);

  return windows.map(window => {
    return window.id === Number(source.droppableId)
      ? ({
          ...window,
          tabs: newSourceTabList,
        } as ChromeWindow)
      : window.id === Number(destination.droppableId)
      ? ({
          ...window,
          tabs: newDestinationTabList,
        } as ChromeWindow)
      : window;
  });
}

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
