import { describe, expect, test } from '@jest/globals';
import { ConwayGame, ConwayCell } from "../src/game_of_life";
describe("gamefield representation", function () {
    test("Create small Conway field", function () {
        var expected_array = [[new ConwayCell(false), new ConwayCell(false)], [new ConwayCell(false), new ConwayCell(false)]];
        expect(new ConwayGame(2, 2, null, [], "cutoff").gameField).toStrictEqual(expected_array);
    });
    test("Set Conway field cells to", function () {
        var expected_array = [
            [new ConwayCell(true), new ConwayCell(false)], // x0,y0 , x1,y1
            [new ConwayCell(true), new ConwayCell(false)]
        ];
        var build_game = new ConwayGame(2, 2, null, [], "cutoff");
        build_game.setCell(0, 0, new ConwayCell(true));
        build_game.setCell(0, 1, new ConwayCell(true));
        expect(build_game.gameField).toStrictEqual(expected_array);
    });
    test("Create Conway field with different lengths to", function () {
        var expected_array = [
            [new ConwayCell(true), new ConwayCell(false)], // x0,y0 , x1,y1
            [new ConwayCell(true), new ConwayCell(false)],
            [new ConwayCell(false), new ConwayCell(false)]
        ];
        var build_game = new ConwayGame(2, 3, null, [], "cutoff");
        build_game.setCell(0, 0, new ConwayCell(true));
        build_game.setCell(0, 1, new ConwayCell(true));
        expect(build_game.gameField).toStrictEqual(expected_array);
    });
});
