import { revealRow } from './shuffle';

describe('revealRow', () => {
    it('locks the pair into the row and leaves earlier rows alone', () => {
        const left = [5, 1, 2, 3, 4];
        const right = [3, 4, 1, 2, 5];

        const [newLeft, newRight] = revealRow(left, right, 1, 4, 2);

        expect(newLeft.slice(0, 2)).toEqual([5, 4]);
        expect(newRight.slice(0, 2)).toEqual([3, 2]);
        expect([...newLeft].sort()).toEqual([1, 2, 3, 4, 5]);
        expect([...newRight].sort()).toEqual([1, 2, 3, 4, 5]);
    });
});
