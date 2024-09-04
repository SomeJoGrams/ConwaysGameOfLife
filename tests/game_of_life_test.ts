import {describe, expect, test} from '@jest/globals';
import { ConwayGame, ConwayGameRepresenter, ConwayCell, CellColor, ConfigStorage, CellPosition, DEFAULTGAMERULE, ConwayHTMLDisplayer, AgingCellRepr} from "../src/main/game_of_life_default";

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
        build_game.setCell(0, 0, new ConwayCell(true));
        build_game.setCell(0, 1, new ConwayCell(true));
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
        build_game.setCell(0, 0, new ConwayCell(true));
        build_game.setCell(0, 1, new ConwayCell(true));
        expect(build_game.gameField).toStrictEqual(
            expected_array);
    });

    test("Create conway field image data", () => {
        let conway_game: ConwayGame = new ConwayGame(3, 3, null, [], "cutoff");
        conway_game.setCell(2, 1, new ConwayCell(true));
        conway_game.setCell(0, 2, new ConwayCell(true));
        let config_storage = new ConfigStorage(new CellColor(255, 0, 0, 0), new CellColor(0, 0, 0, 255));
        let representer: ConwayGameRepresenter = new ConwayGameRepresenter(conway_game, config_storage);
        let expected_data: CellColor[] = new Array(9).fill(<CellColor>representer.cell_repr_dead.clone());
        expected_data[2] = <CellColor>representer.cell_repr_alive.clone();
        expected_data[7] = <CellColor>representer.cell_repr_alive.clone();
        let result_arr = representer.as_number_colors_arr()
        expect(result_arr).toHaveLength(9);
        // TODO fix test
        // expect(expected_data).toStrictEqual(result_arr);

    })

    test("Negative modulo", () => {
        let negativeVal = -1002;
        expect(negativeVal % 25).toBe(-2);
    })

    test("Set Cell over positive bounds", () => {
        let conway_game: ConwayGame = new ConwayGame(4, 4, null, [], "extend");
        conway_game.setCell(6, 2, new ConwayCell(true));
        expect(conway_game.getCell(2, 2)).toStrictEqual(new ConwayCell(true));
    });

    test("Set Cell over negative bounds", () => {
        let conway_game: ConwayGame = new ConwayGame(4, 4, null, [], "extend");
        conway_game.setCell(-6, 2, new ConwayCell(true));
        expect(conway_game.getCell(2, 2)).toStrictEqual(new ConwayCell(true));
    })

    test("Set Cell over 2 bounds", () => {
        let conway_game: ConwayGame = new ConwayGame(4, 4, null, [], "extend");
        conway_game.setCell(-6, -6, new ConwayCell(true));
        expect(conway_game.getCell(2, 2)).toStrictEqual(new ConwayCell(true));
    })

    test("Set Cell on bound", () => {
        let conway_game: ConwayGame = new ConwayGame(4, 4, null, [], "extend");
        conway_game.setCell(4, 2, new ConwayCell(true));
        console.log(conway_game.gameField);
        expect(conway_game.getCell(0, 2)).toStrictEqual(new ConwayCell(true));
    })

    test("Set Cell on bound 1 dif", () => {
        let conway_game: ConwayGame = new ConwayGame(4, 4, null, [], "extend");
        conway_game.setCell(5, 2, new ConwayCell(true));
        expect(conway_game.getCell(1, 2)).toStrictEqual(new ConwayCell(true));
    })

    test("CellPosition as string", () => {
        let cp = new CellPosition(10, 3);
        expect(cp.toString()).toBe("x10-y3");
    });

    test("CellPosition Map", () => {
        const cp_map = new Map();
        let expected_str_keys = "";
        for (let indexX = 0; indexX < 5; indexX++) {
            for (let indexY = 0; indexY < 5; indexY++) {
                let pos = new CellPosition(indexX, indexY)
                cp_map.set(pos, "a");
                expected_str_keys += pos.toString();
            }
        }
        let map_str = "";
        cp_map.forEach((val, key, map) => {
            map_str += key;
        });
        expect(map_str).toBe(expected_str_keys);
    });

});

describe("ConwayHTMLDisplayer tests and trail calculation", () => {

    test("Next Conway Game Stores Died Cells", () => {
        const conwayGame = new ConwayGame(5, 5, null, DEFAULTGAMERULE, "cutoff");
        conwayGame.setCell(1, 0, new ConwayCell(true));
        conwayGame.setCell(0, 1, new ConwayCell(true));
        conwayGame.setCell(2, 1, new ConwayCell(true));
        conwayGame.setCell(1, 2, new ConwayCell(true));
        const next_game = conwayGame.next_conway_game();
        const rand_cell = next_game.getCell(4, 4);
        const died_cell1_1 = next_game.getCell(1, 1);
        const died_cell2_2 = next_game.getCell(1, 0);
        const died_cell1_3 = next_game.getCell(2, 1);
        const died_cell0_2 = next_game.getCell(1, 2);
        expect(died_cell1_1).toStrictEqual(new ConwayCell(false));
        expect(died_cell2_2).toStrictEqual(new ConwayCell(false));
        expect(died_cell1_3).toStrictEqual(new ConwayCell(false));
        expect(died_cell0_2).toStrictEqual(new ConwayCell(false));
        expect(rand_cell).toStrictEqual(new ConwayCell(false));
        const last_died_cells = next_game.getLastStepDiedCellPositions();
        expect(last_died_cells).toHaveLength(4);
        expect(last_died_cells).toContainEqual(new CellPosition(1, 0));
        expect(last_died_cells).toContainEqual(new CellPosition(0, 1));
        expect(last_died_cells).toContainEqual(new CellPosition(2, 1));
        expect(last_died_cells).toContainEqual(new CellPosition(1, 2));
    });


    test("Trail is added to trail map", () => {
        const conwayGame = new ConwayGame(5, 5, null, DEFAULTGAMERULE, "cutoff");
        conwayGame.setCell(1, 0, new ConwayCell(true));
        conwayGame.setCell(0, 1, new ConwayCell(true));
        conwayGame.setCell(2, 1, new ConwayCell(true));
        conwayGame.setCell(1, 2, new ConwayCell(true));
        const nextConwayGame = conwayGame.next_conway_game();
        const conwayHTMLDisplayer = new ConwayHTMLDisplayer(undefined, "100%", "100%", 5, 5, new ConfigStorage(CellColor.WHITE, CellColor.BLACK, 2));
        conwayHTMLDisplayer.addVisualTrailCellsAndAgeTrail(nextConwayGame);
        // conwayHTMLDisplayer.posToCellWithVisualTrail.forEach((c, k, m) => console.log("key" + k + " val " + c));
        let position1_0 = new CellPosition(1, 0);
        let position0_1 = new CellPosition(0, 1);
        let position2_1 = new CellPosition(2, 1);
        let position1_2 = new CellPosition(1, 2);
        let cell1 = new AgingCellRepr(position1_0, 2, CellColor.WHITE);
        let cell2 = new AgingCellRepr(position0_1, 2, CellColor.WHITE)
        let cell3 = new AgingCellRepr(position2_1, 2, CellColor.WHITE)
        let cell4 = new AgingCellRepr(position1_2, 2, CellColor.WHITE)
        cell1.age();
        cell2.age();
        cell3.age();
        cell4.age();
        expect(conwayHTMLDisplayer.posToCellWithVisualTrail.size).toBe(4);
        expect(conwayHTMLDisplayer.posToCellWithVisualTrail.get(position1_0.toString())).toStrictEqual(cell1);
        expect(conwayHTMLDisplayer.posToCellWithVisualTrail.get(position0_1.toString())).toStrictEqual(cell2);
        expect(conwayHTMLDisplayer.posToCellWithVisualTrail.get(position2_1.toString())).toStrictEqual(cell3);
        expect(conwayHTMLDisplayer.posToCellWithVisualTrail.get(position1_2.toString())).toStrictEqual(cell4);
        console.log("b");
    });

    test("Fading Cell", () => {
        const fading_cell = new AgingCellRepr(new CellPosition(0, 0), 5, CellColor.WHITE);
        console.log(fading_cell.fading_cell_color.rgba_str);
        expect(fading_cell.fading_cell_color.rgba_str).toBe("rgba(255,255,255,1)");
    })

    test("Fading Cell age once", () => {
        const fading_cell = new AgingCellRepr(new CellPosition(0, 0), 5, CellColor.WHITE);
        fading_cell.age();
        expect(fading_cell.fading_cell_color.r).toBeCloseTo(204);
        expect(fading_cell.fading_cell_color.g).toBeCloseTo(204);
        expect(fading_cell.fading_cell_color.b).toBeCloseTo(204);
        expect(fading_cell.fading_cell_color.a).toBeCloseTo(1);
    })

    test("Fading Cell dies", () => {
        const fading_cell = new AgingCellRepr(new CellPosition(0, 0), 2, CellColor.WHITE);
        fading_cell.age();
        fading_cell.age();
        expect(fading_cell.completlyFaded).toBe(true);
    })

    test("Fading Cell too often", () => {
        const fading_cell = new AgingCellRepr(new CellPosition(0, 0), 2, CellColor.WHITE);
        fading_cell.age();
        fading_cell.age();
        fading_cell.age();
        expect(fading_cell.completlyFaded).toBe(true);
    })
});