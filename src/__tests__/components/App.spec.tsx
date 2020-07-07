import { render } from '@testing-library/react';
import React from 'react';
import { mocked } from 'ts-jest/utils';
import { useWindows } from '../../hooks/useWindows';
import App from '../../pages/App';

jest.mock('../../hooks/useWindows');

test('should render Error component', () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({ windows: [[], []], error: 'Error' });
  const { getByText } = render(<App />);

  // Assert
  const errorComponent = getByText(/error/i);
  expect(errorComponent).toBeInTheDocument();
});

test('should render single empty list if no tabs to show', () => {
  // Arrange
  mocked(useWindows).mockReturnValueOnce({ windows: [[] as ChromeWindow[], [] as ChromeWindow[]], error: '' });
  const { queryByText, debug } = render(<App />);

  // Assert
  const currentWindow = queryByText(/current window/i);
  expect(currentWindow).toBeInTheDocument();

  const emptyListMessage = queryByText(/nothing to show.../i);
  expect(emptyListMessage).toBeInTheDocument();

  const emptyWindowList = queryByText(/other windows/i);
  expect(emptyWindowList).not.toBeInTheDocument();
});
