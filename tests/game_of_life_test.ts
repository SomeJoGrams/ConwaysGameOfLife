import {describe, expect, test} from '@jest/globals';
import { ConwayGame, ConwayGameRepresenter, ConwayCell, CellColor } from "../src/game_of_life_default";
import { clone } from 'lodash';

describe("gamefield representation", () => {
    test("Create small Conway field", () => {
        let expected_array = [[new ConwayCell(false), new ConwayCell(false)], [new ConwayCell(false), new ConwayCell(false)]];
        expect(new ConwayGame(2, 2, null, [], "cutoff").gameField).toStrictEqual(
            expected_array);
    });

    test("Set Conway field cells to", () => {
        let expected_array = [
                                [new ConwayCell(true), new ConwayCell(false)], // x0,y0 , x1,y1
                                [new ConwayCell(true), new ConwayCell(false)]
                            ];
        let build_game: ConwayGame = new ConwayGame(2, 2, null, [], "cutoff");
        build_game.setCell(0,0, new ConwayCell(true));
        build_game.setCell(0,1, new ConwayCell(true)) ;
        expect(build_game.gameField).toStrictEqual(
            expected_array);
    });

    test("Create Conway field with different lengths to", () => {
        let expected_array = [
                                [new ConwayCell(true), new ConwayCell(false)], // x0,y0 , x1,y1
                                [new ConwayCell(true), new ConwayCell(false)],
                                [new ConwayCell(false), new ConwayCell(false)]
                            ];
        let build_game: ConwayGame = new ConwayGame(2, 3, null, [], "cutoff");
        build_game.setCell(0,0, new ConwayCell(true));
        build_game.setCell(0,1, new ConwayCell(true));
        expect(build_game.gameField).toStrictEqual(
            expected_array);
    });

    // (0,0), (1,0), (2,0)
    // (0,1), (1,1), (2,1)
    // (0,2), (1,2), (2,2)


    test("Create conway field image data", () => {
        let conway_game: ConwayGame = new ConwayGame(3, 3, null, [], "cutoff");
        conway_game.setCell(2, 1, new ConwayCell(true));
        conway_game.setCell(0, 2, new ConwayCell(true));
        let representer: ConwayGameRepresenter = new ConwayGameRepresenter(conway_game);
        let expected_data: CellColor[] = new Array(9).fill(<CellColor>representer.cell_repr_dead.clone());
        expected_data[2] = <CellColor>representer.cell_repr_alive.clone();
        expected_data[7] = <CellColor>representer.cell_repr_alive.clone();
        // let flattened_arr = expected_data.flatMap( (cur, ind, arr) => [cur.r, cur.b, cur.g, cur.a])
        let result_arr = representer.as_number_colors_arr()
        expect(result_arr).toHaveLength(9);
        expect(expected_data).toStrictEqual(result_arr);

    })

    test("Negative modulo", () => {
        let negativeVal = -1002;
        expect(negativeVal % 25).toBe(-2); // TODO do with conway field
    })

});