import { useEffect } from 'react';
import { getItemIndex } from '../utils/helpers';

export const useRovingFocus = (): void => {
  const handleKeyDown = (e: KeyboardEvent) => {
    const activeElement = document.activeElement;
    if (!activeElement) return;

    const listItems = document.querySelectorAll('li[tabindex="-1"]');

    // Down arrow
    if (e.keyCode === 40) {
      e.preventDefault();
      switch (activeElement.tagName) {
        case 'BODY':
        case 'INPUT':
          (listItems[0] as HTMLElement).focus();
          break;
        case 'LI':
          const itemIndex = getItemIndex(activeElement, listItems);
          (listItems[itemIndex === listItems.length - 1 ? 0 : itemIndex + 1] as HTMLElement).focus();
          break;
        default:
          return;
      }
    }

    // Up arrow
    if (e.keyCode === 38) {
      e.preventDefault();
      switch (activeElement.tagName) {
        case 'BODY':
        case 'INPUT':
          (listItems[listItems.length - 1] as HTMLElement).focus();
          break;
        case 'LI':
          const itemIndex = getItemIndex(activeElement, listItems);
          if (itemIndex === 0) {
            document.getElementById('searchBox')?.focus();
            return;
          }
          (listItems[itemIndex - 1] as HTMLElement).focus();
          break;
        default:
          return;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [handleKeyDown]);
};
