import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import Header from '../components/Header';

describe('<Header />', () => {
  it('should render input element with placeholder text', () => {
    // Arrange
    const { getByPlaceholderText } = render(
      <Header searchTerm={''} setSearchTerm={jest.fn()} searchDisabledToggle={false} />
    );

    // Assert
    const searchBox = getByPlaceholderText('Search...');
    expect(searchBox).toBeInTheDocument();
  });

  it('should focus input element on page load', () => {
    // Arrange
    const { getByPlaceholderText } = render(
      <Header searchTerm={''} setSearchTerm={jest.fn()} searchDisabledToggle={false} />
    );

    // Assert
    const searchBox = getByPlaceholderText('Search...');
    expect(document.activeElement === searchBox).toBeTruthy();
  });

  it('should call onChange handler when user types in search box', () => {
    // Arrange
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <Header searchTerm={''} setSearchTerm={onChange} searchDisabledToggle={false} />
    );

    // Act
    const searchBox = getByPlaceholderText('Search...');
    fireEvent.change(searchBox, { target: { value: 'hello' } });

    // Assert
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('should close window on when close button clicked', () => {
    // Arrange
    window.close = jest.fn();
    const { getByTestId } = render(
      <Header searchTerm={''} setSearchTerm={jest.fn()} searchDisabledToggle={false} />
    );

    // Act
    const closeButton = getByTestId('closeButton');
    fireEvent.click(closeButton);

    // Assert
    expect(window.close).toHaveBeenCalledTimes(1);
  })
});
