import { groupBy } from '../../utils/helpers';

describe('groupBy - Divide passed array into groups according to passed callback', () => {
  it('Returns empty arrays when passed empty list', () => {
    // Arrange
    const list: any[] = [];
    const callback = (item: string) => item.length > 5;
    const expected = [[], []];

    // Act
    const result = groupBy(list, callback);

    // Assert
    expect(result).toEqual(expected);
  });

  it('Returns correctly grouped values', () => {
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
