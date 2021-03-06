import { act, fireEvent, render, waitFor } from '@testing-library/react';
import chromep from 'chrome-promise';
import { chrome } from 'jest-chrome';
import React from 'react';
import useSWR, { mutate, responseInterface } from 'swr';
import { mocked } from 'ts-jest/utils';
import App from '../../pages/App';
import { mockWindow1, mockWindow2, mockWindow3 } from '../testData/mockWindows';

// Key types
const spaceKey = { keyCode: 32 };
const arrowUpKey = { keyCode: 38 };
const arrowDownKey = { keyCode: 40 };
const enterKey = { keyCode: 13 };

// Mocks
jest.mock('swr');

afterEach(() => {
  jest.resetAllMocks();
});

test('should render Error component and refresh on button click', async () => {
  // Arrange
  mocked(useSWR)
    .mockReturnValueOnce({
      data: [],
      error: 'Error',
    } as responseInterface<any, any>)
    .mockReturnValueOnce({
      data: [{ ...mockWindow1 }],
      error: '',
    } as responseInterface<any, any>);

  const { getByText, getByRole, getAllByTestId } = render(<App />);

  // Assert error fallback rendered
  const errorComponent = getByText(/oops, something went wrong!/i);
  expect(errorComponent).toBeInTheDocument();

  const refreshButton = getByRole('button');

  act(() => {
    fireEvent.click(refreshButton);
  });

  // Wait then assert that tab list has refreshed correctly
  await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
});

test('should render single empty list if no tabs to show', () => {
  // Arrange
  mocked(useSWR).mockReturnValueOnce({
    data: [],
    error: '',
  } as responseInterface<any, any>);
  const { queryByText } = render(<App />);

  // Assert
  const currentWindow = queryByText(/current window/i);
  expect(currentWindow).toBeInTheDocument();

  // Check for empty window list message
  const emptyListMessage = queryByText(/nothing to show.../i);
  expect(emptyListMessage).toBeInTheDocument();

  // Check empty other windows list is not present
  const otherWindowList = queryByText(/other windows/i);
  expect(otherWindowList).not.toBeInTheDocument();
});

test('should render list of tabs for current window', () => {
  // Arrange
  mocked(useSWR).mockReturnValueOnce({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);
  const { getAllByTestId, queryByText } = render(<App />);

  // Assert
  const tabsTitles = getAllByTestId('tab-list-item').map(tab => tab.textContent);
  expect(tabsTitles).toMatchInlineSnapshot(`
      Array [
        "Test tab 1",
        "Test tab 2",
      ]
    `);

  // Check empty other windows list is not present
  const emptyWindowList = queryByText(/other windows/i);
  expect(emptyWindowList).not.toBeInTheDocument();
});

test('should render current and other windows', () => {
  // Arrange
  mocked(useSWR).mockReturnValueOnce({
    data: [{ ...mockWindow1 }, { ...mockWindow2 }, { ...mockWindow3 }],
    error: '',
  } as responseInterface<any, any>);
  const { getAllByTestId, queryByText } = render(<App />);

  // Assert
  const otherWindowList = queryByText(/other windows/i);
  expect(otherWindowList).toBeInTheDocument();

  const otherWindowsTabTitles = getAllByTestId('tab-list-item').map(tab => tab.textContent);
  expect(otherWindowsTabTitles).toMatchInlineSnapshot(`
      Array [
        "Test tab 1",
        "Test tab 2",
        "Test tab 3",
        "Test tab 4",
        "Test tab 5",
        "Test tab 6",
      ]
    `);
});

test('should filter displayed tabs on search', () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  const { getByPlaceholderText, getAllByTestId } = render(<App />);

  const tabsTitles = getAllByTestId('tab-list-item').map(tab => tab.textContent);
  expect(tabsTitles).toMatchInlineSnapshot(`
      Array [
        "Test tab 1",
        "Test tab 2",
      ]
    `);

  const searchBox = getByPlaceholderText('Search...');
  act(() => {
    fireEvent.change(searchBox, { target: { value: '2' } });
  });

  const filteredTabTitles = getAllByTestId('tab-list-item').map(tab => tab.textContent);
  expect(filteredTabTitles).toMatchInlineSnapshot(`
    Array [
      "Test tab 2",
    ]
  `);
});

test('Tab moved within window and search box disabled on drag', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  const { getByPlaceholderText, getAllByTestId } = render(<App />);

  const searchBox = getByPlaceholderText(/search.../i);
  const firstTab = getAllByTestId('tab-list-item')[0];
  expect(searchBox).not.toBeDisabled();

  // Begin dragging tab list item
  act(() => {
    fireEvent.keyDown(firstTab, spaceKey);
  });

  // Assert search box disabled
  await waitFor(() => expect(searchBox).toBeDisabled());

  // Move tab down one position
  act(() => {
    fireEvent.keyDown(firstTab, arrowDownKey);
  });

  // End drag
  act(() => {
    fireEvent.keyDown(firstTab, spaceKey);
  });

  // Assert search box no longer disabled
  await waitFor(() => expect(searchBox).not.toBeDisabled());

  // Assert optimistic mutation has been called
  expect(mutate).toHaveBeenCalledTimes(1);

  // Assert chrome API move method has been called
  // expect(chrome.tabs.move.withArgs(1877, { index: 1, windowId: 56 }).calledOnce).toBe(true);
  expect(chrome.tabs.move).toHaveBeenCalledWith(1877, {
    index: 1,
    windowId: 56,
  });
});

test('Tab moved back to original position within window', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  const { getByPlaceholderText, getAllByTestId } = render(<App />);

  const searchBox = getByPlaceholderText(/search.../i);
  const firstTab = getAllByTestId('tab-list-item')[0];
  expect(searchBox).not.toBeDisabled();

  // Begin dragging tab list item
  act(() => {
    fireEvent.keyDown(firstTab, spaceKey);
  });

  // Assert search box disabled
  await waitFor(() => expect(searchBox).toBeDisabled());

  // Move tab down one position
  act(() => {
    fireEvent.keyDown(firstTab, arrowDownKey);
  });

  // Move up one position
  act(() => {
    fireEvent.keyDown(firstTab, arrowUpKey);
  });

  // End drag
  act(() => {
    fireEvent.keyDown(firstTab, spaceKey);
  });

  // Assert search box no longer disabled
  await waitFor(() => expect(searchBox).not.toBeDisabled());

  // Assert no action has been taken as tab has not moved positions
  expect(mutate).not.toHaveBeenCalled();
});

test('should select another tab in the same window', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  // Configure to return current active window
  chrome.windows.getCurrent.mockImplementation(
    // @ts-ignore - Typescript not picking up callback overload that accepts
    // just callback, defaults instead to signature (getInfo: chrome.windows.GetInfo, callback...) etc.
    (callback: (window: chrome.windows.Window) => void) => callback({ ...mockWindow1 })
  );

  const { getAllByTestId } = render(<App />);

  const nonActiveTab = getAllByTestId('tab-list-item')[1];

  act(() => {
    fireEvent.keyPress(nonActiveTab, enterKey);
  });

  const expectedTabId = mockWindow1.tabs![1].id;

  // Assert chrome.update method has been called with selected tab id
  await waitFor(() => expect(chrome.windows.getCurrent).toHaveBeenCalled());
  expect(chrome.tabs.update).toHaveBeenCalledWith(expectedTabId, { active: true }, expect.any(Function));
});

test('should select another tab in a different window', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }, { ...mockWindow2 }],
    error: '',
  } as responseInterface<any, any>);

  // Configure to return current active window
  chrome.windows.getCurrent.mockImplementation(
    // @ts-ignore - Typescript is not recognizing the function overload that accepts
    // just a callback, defaults instead to other signature (getInfo: chrome.windows.GetInfo, callback...) etc.
    (callback: (window: chrome.windows.Window) => void) => callback({ ...mockWindow1 })
  );

  chrome.windows.update.mockImplementation(
    (windowId: number, updateInfo: chrome.windows.UpdateInfo, callback?: (window: chrome.windows.Window) => void) =>
      callback!({ ...mockWindow2 })
  );

  // Mock window close method
  window.close = jest.fn();

  const { getAllByTestId } = render(<App />);

  const tabInOtherWindow = getAllByTestId('tab-list-item')[2];

  act(() => {
    fireEvent.keyPress(tabInOtherWindow, enterKey);
  });

  const expectedWindowId = mockWindow2.id;

  // Assert chrome.update method has been called with id of new window
  // to be focused
  await waitFor(() => expect(chrome.windows.getCurrent).toHaveBeenCalled());
  await waitFor(() =>
    expect(chrome.windows.update).toHaveBeenCalledWith(expectedWindowId, { focused: true }, expect.any(Function))
  );
  expect(window.close).toHaveBeenCalledTimes(1);
});

test('should close tab', () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  // chrome.tabs.remove implmentation is missing from jest-chrome, so
  // mocking chromep implementation just for this test
  // Raising issue on jest-chrome library
  chromep.tabs.remove = jest.fn();

  const { getAllByTestId } = render(<App />);

  const tabToClose = getAllByTestId('tab-close-icon')[0];

  // Act
  act(() => {
    fireEvent.click(tabToClose);
  });

  // Assert
  const expectedTabId = mockWindow1.tabs![0].id;
  expect(chromep.tabs.remove).toHaveBeenCalledWith(expectedTabId);
});

test('should call onMovedListener when move event fired', () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  render(<App />);

  // Assert onMovedListener has been assigned
  expect(chrome.tabs.onMoved.hasListeners()).toBe(true);

  chrome.tabs.onMoved.callListeners(
    123, // tabId
    {} as chrome.tabs.TabMoveInfo // moveInfo
  );

  expect(mutate).toHaveBeenCalledTimes(1);
});

test('should call onAttachedListener when attach event fired', () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  render(<App />);

  // Assert onMovedListener has been assigned
  expect(chrome.tabs.onAttached.hasListeners()).toBe(true);

  chrome.tabs.onAttached.callListeners(
    123, // tabId
    {} as chrome.tabs.TabAttachInfo // attachInfo
  );

  expect(mutate).toHaveBeenCalledTimes(1);
});

test('should call onRemovedListener when remove event fired', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [{ ...mockWindow1 }],
    error: '',
  } as responseInterface<any, any>);

  chrome.windows.get.mockImplementation(
    (windowId: number, removeInfo: chrome.windows.GetInfo, callback: (window: chrome.windows.Window) => void) =>
      callback({ ...mockWindow1 })
  );

  render(<App />);

  // Assert onMovedListener has been assigned
  expect(chrome.tabs.onRemoved.hasListeners()).toBe(true);

  chrome.tabs.onRemoved.callListeners(
    123, // tabId
    { windowId: 456 } as chrome.tabs.TabRemoveInfo // attachInfo
  );

  expect(chrome.windows.get).toHaveBeenCalledWith(456, { populate: true }, expect.any(Function));

  await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1));
});
