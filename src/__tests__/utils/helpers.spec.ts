import { chrome } from 'jest-chrome';
import { DraggableLocation } from 'react-beautiful-dnd';
import { getWindows, groupBy, optimisticMoveTabBetweenWindows, optimisticReorderTabs } from '../../utils/helpers';
import { mockWindow1, mockWindow2 } from './../testData/mockWindows';

describe('getWindows', () => {
  test('should return window list with active window assigned', async () => {
    // Arrange

    // Pass mockWindow2 as the active window
    chrome.windows.getCurrent.mockImplementation(
      // @ts-ignore - Typescript not picking up callback overload that accepts
      // just callback, defaults instead to signature (getInfo: chrome.windows.GetInfo, callback...) etc.
      (callback: (window: chrome.windows.Window) => void) => callback({ ...mockWindow2 })
    );

    // Mock getAll windows
    chrome.windows.getAll.mockImplementation(
      (getInfo: chrome.windows.GetInfo, callback: (window: chrome.windows.Window[]) => void) =>
        callback([{ ...mockWindow1 }, { ...mockWindow2 }])
    );

    // Act
    const result = await getWindows();

    // Assert
    expect(result).toEqual([
      { ...mockWindow1, isActiveWindow: false },
      { ...mockWindow2, isActiveWindow: true },
    ]);
  });
});

describe('groupBy - Divide passed array into groups according to passed callback', () => {
  test('Returns empty arrays when passed empty list', () => {
    // Arrange
    const list: any[] = [];
    const callback = (item: string) => item.length > 5;
    const expected = [[], []];

    // Act
    const result = groupBy(list, callback);

    // Assert
    expect(result).toEqual(expected);
  });

  test('Returns correctly grouped values', () => {
    // Arrange
    const list = [1, 9, 4, 7, 8, 3, 5];
    const callback = (item: number) => item >= 5;
    const expected = [
      [9, 7, 8, 5],
      [1, 4, 3],
    ];

    // Act
    const result = groupBy(list, callback);

    // Assert
    expect(result).toEqual(expected);
  });
});

describe('optimisticReorderTabs - reorder tabs within a single window', () => {
  test('throws error if window not present in list', () => {
    const windows = [{ ...mockWindow1 }];
    const destination = { index: -1, droppableId: '888' } as DraggableLocation;
    const source = { index: -1, droppableId: '999' } as DraggableLocation;

    expect(() => optimisticReorderTabs(windows, destination, source)).toThrowErrorMatchingInlineSnapshot(
      `"Window could not be found for optimistic reorder."`
    );
  });

  test('should correctly reorder tabs', () => {
    const windows = [{ ...mockWindow1 }];
    const destination = {
      index: 1,
      droppableId: `${mockWindow1.id}`,
    } as DraggableLocation;
    const source = {
      index: 0,
      droppableId: `${mockWindow1.id}`,
    } as DraggableLocation;

    const intialTabs = windows[0].tabs!.map(tab => tab.title);
    expect(intialTabs).toMatchInlineSnapshot(`
      Array [
        "Test tab 1",
        "Test tab 2",
      ]
    `);

    const resultWindow = optimisticReorderTabs(windows, destination, source);
    const reorderedTabs = resultWindow![0].tabs!.map(tab => tab.title);
    expect(reorderedTabs).toMatchInlineSnapshot(`
      Array [
        "Test tab 2",
        "Test tab 1",
      ]
    `);
  });
});

describe('optimisticMoveTabBetweenWindows - move tabs between windows', () => {
  test('throws error if windows not present in list', () => {
    const windows = [{ ...mockWindow1 }, { ...mockWindow2 }];
    const destination = { index: -1, droppableId: '888' } as DraggableLocation;
    const source = { index: -1, droppableId: '999' } as DraggableLocation;

    expect(() => optimisticMoveTabBetweenWindows(windows, destination, source)).toThrowErrorMatchingInlineSnapshot(
      `"Source or destination windows could not be found for optimsitic move between windows."`
    );
  });

  test('should correctly move tabs', () => {
    const windows = [{ ...mockWindow1 }, { ...mockWindow2 }];
    const destination = {
      index: 1,
      droppableId: `${mockWindow2.id}`,
    } as DraggableLocation;
    const source = {
      index: 0,
      droppableId: `${mockWindow1.id}`,
    } as DraggableLocation;

    const intialTabs = windows.map(window => window.tabs!.map(tab => tab.title));
    expect(intialTabs).toMatchInlineSnapshot(`
      Array [
        Array [
          "Test tab 1",
          "Test tab 2",
        ],
        Array [
          "Test tab 3",
          "Test tab 4",
        ],
      ]
    `);

    const result = optimisticMoveTabBetweenWindows(windows, destination, source);
    const reorderedTabs = result.map(window => window.tabs!.map(tab => tab.title));
    expect(reorderedTabs).toMatchInlineSnapshot(`
      Array [
        Array [
          "Test tab 2",
        ],
        Array [
          "Test tab 3",
          "Test tab 1",
          "Test tab 4",
        ],
      ]
    `);
  });
});
