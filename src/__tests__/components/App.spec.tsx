import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { chrome } from 'jest-chrome';
import React from 'react';
import useSWR, { mutate, responseInterface } from 'swr';
import { mocked } from 'ts-jest/utils';
import App from '../../pages/App';
import { mockWindow1, mockWindow2, mockWindow3 } from '../testData/mockWindows';
import chromep from 'chrome-promise'

// Mocks
jest.mock('swr');

afterEach(() => {
  jest.resetAllMocks();
});

test('should render Error component', () => {
  // Arrange
  mocked(useSWR).mockReturnValueOnce({ data: [], error: 'Error' } as responseInterface<any, any>);
  const { getByText } = render(<App />);

  // Assert
  const errorComponent = getByText(/error/i);
  expect(errorComponent).toBeInTheDocument();
});

test('should render single empty list if no tabs to show', () => {
  // Arrange
  mocked(useSWR).mockReturnValueOnce({ data: [], error: '' } as responseInterface<any, any>);
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
  mocked(useSWR).mockReturnValueOnce({ data: [mockWindow1], error: '' } as responseInterface<any, any>);
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
    data: [mockWindow1, mockWindow2, mockWindow3],
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

test('Tab moved within window and search box disabled on drag', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [mockWindow1],
    error: '',
  } as responseInterface<any, any>);

  const { getByPlaceholderText, getAllByTestId } = render(<App />);

  const searchBox = getByPlaceholderText(/search.../i);
  const firstTab = getAllByTestId('tab-list-item')[0];
  expect(searchBox).not.toBeDisabled();

  // Begin dragging tab list item
  act(() => {
    fireEvent.keyDown(firstTab, { keyCode: 32 });
  });

  // Assert search box disabled
  await waitFor(() => expect(searchBox).toBeDisabled());

  // Move tab down one position
  act(() => {
    fireEvent.keyDown(firstTab, { keyCode: 40 });
  });

  // End drag
  act(() => {
    fireEvent.keyDown(firstTab, { keyCode: 32 });
  });

  // Assert search box no longer disabled
  await waitFor(() => expect(searchBox).not.toBeDisabled());

  // Assert optimistic mutation has been called
  expect(mutate).toHaveBeenCalledTimes(1);

  // Assert chrome API move method has been called
  // expect(chrome.tabs.move.withArgs(1877, { index: 1, windowId: 56 }).calledOnce).toBe(true);
  expect(chrome.tabs.move).toHaveBeenCalledWith(1877, { index: 1, windowId: 56 });
});

test('should select another tab in the same window', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [mockWindow1],
    error: '',
  } as responseInterface<any, any>);

  // Configure to return current active window
  chrome.windows.getCurrent.mockImplementation(
    // @ts-ignore - Typescript not picking up callback overload that accepts
    // just callback, defaults instead to signature (getInfo: chrome.windows.GetInfo, callback...) etc.
    (callback: (window: chrome.windows.Window) => void) => callback(mockWindow1)
  );

  const { getAllByTestId } = render(<App />);

  const nonActiveTab = getAllByTestId('tab-list-item')[1];

  act(() => {
    fireEvent.keyPress(nonActiveTab, { keyCode: 13 });
  });

  const expectedTabId = mockWindow1.tabs![1].id;

  // Assert chrome.update method has been called with selected tab id
  await waitFor(() => expect(chrome.windows.getCurrent).toHaveBeenCalled());
  expect(chrome.tabs.update).toHaveBeenCalledWith(expectedTabId, { active: true }, expect.any(Function));
});

test('should select another tab in a different window', async () => {
  // Arrange
  mocked(useSWR).mockReturnValue({
    data: [mockWindow1, mockWindow2],
    error: '',
  } as responseInterface<any, any>);

  // Configure to return current active window
  chrome.windows.getCurrent.mockImplementation(
    // @ts-ignore - Typescript is not recognizing the function overload that accepts
    // just a callback, defaults instead to other signature (getInfo: chrome.windows.GetInfo, callback...) etc.
    (callback: (window: chrome.windows.Window) => void) => callback(mockWindow1)
  );

  chrome.windows.update.mockImplementation(
    (windowId: number, updateInfo: chrome.windows.UpdateInfo, callback?: (window: chrome.windows.Window) => void) =>
      callback!(mockWindow2)
  );

  // Mock window close method
  window.close = jest.fn();

  const { getAllByTestId } = render(<App />);

  const tabInOtherWindow = getAllByTestId('tab-list-item')[2];

  act(() => {
    fireEvent.keyPress(tabInOtherWindow, {
      keyCode: 13,
    });
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
    data: [mockWindow1],
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
