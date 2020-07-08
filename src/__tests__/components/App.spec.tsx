import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { chrome } from 'jest-chrome';
import React from 'react';
import useSWR, { mutate, responseInterface } from 'swr';
import { mocked } from 'ts-jest/utils';
import App from '../../pages/App';
import { mockWindow1, mockWindow2, mockWindow3 } from '../testData/mockWindows';

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
  expect(chrome.tabs.move).toHaveBeenCalledTimes(1);
});
