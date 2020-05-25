interface ChromeWindow extends chrome.windows.Window {
  isActiveWindow: boolean;
}

type TabClickHandler = () => Promise<void>;
