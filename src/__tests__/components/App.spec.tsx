import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { mocked } from "ts-jest/utils";
import { useWindows } from "../../hooks/useWindows";
import App from "../../pages/App";
import { mockWindow1, mockWindow2, mockWindow3 } from "../testData/mockWindows";

jest.mock("../../hooks/useWindows");

test("should render Error component", () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({ windows: [[], []], error: "Error" });
  const { getByText } = render(<App />);

  // Assert
  const errorComponent = getByText(/error/i);
  expect(errorComponent).toBeInTheDocument();
});

test("should render single empty list if no tabs to show", () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({
    windows: [[] as ChromeWindow[], [] as ChromeWindow[]],
    error: "",
  });
  const { queryByText, debug } = render(<App />);

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

test("should render list of tabs for current window", () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({
    windows: [[mockWindow1], [] as ChromeWindow[]],
    error: "",
  });
  const { getAllByTestId, queryByText } = render(<App />);

  // Assert
  const tabsTitles = getAllByTestId("tab-list-item").map(
    (tab) => tab.textContent
  );
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

test("should render current and other windows", () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({
    windows: [[mockWindow1], [mockWindow2, mockWindow3]],
    error: "",
  });
  const { getAllByTestId, queryByText } = render(<App />);

  // Assert
  const otherWindowList = queryByText(/other windows/i);
  expect(otherWindowList).toBeInTheDocument();

  const otherWindowsTabTitles = getAllByTestId("tab-list-item").map(
    (tab) => tab.textContent
  );
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

test('should disable search box on drag start', () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({
    windows: [[mockWindow1], [mockWindow2, mockWindow3]],
    error: '',
  });
  const { getByPlaceholderText, getByText } = render(<App />);

  // Act
  const searchBox = getByPlaceholderText(/search/i);
  expect(searchBox).not.toBeDisabled();

  const tab = getByText(/test tab 1/i);
  fireEvent.drag
  // expect(searchBox).toBeDisabled();
})
