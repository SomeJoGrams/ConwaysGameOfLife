"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function create_empty_conways_game(xSize, ySize) {
    var currentConwaysGame = new Array(xSize).fill(false).map(function () { return new Array(ySize).fill(false); });
    return currentConwaysGame;
}
function create_next_conway_state(xSize, ySize, oldConwayGame) {
    var newConwayGame = create_empty_conways_game(xSize, ySize);
    for (var indexX = 0; indexX < xSize; indexX++) {
        for (var indexY = 0; indexY < ySize; indexY++) {
            var living_neighbour_count = living_neighbours(indexX, indexY, xSize, ySize, oldConwayGame);
            if (is_alive(indexX, indexY, oldConwayGame)) {
                if ((living_neighbour_count == 2) || (living_neighbour_count == 3)) {
                    newConwayGame[indexX][indexY] = true;
                }
            }
            else {
                if (living_neighbour_count == 3) {
                    newConwayGame[indexX][indexY] = true;
                }
            }
        }
    }
    return newConwayGame;
}
function is_alive(xInd, yInd, gameField) {
    return gameField[xInd][yInd];
}
function living_neighbours(xInd, yInd, xSize, ySize, gameField) {
    var surroundingIndices = new Array([-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, 1], [1, 0], [1, -1]);
    var count = 0;
    surroundingIndices.forEach(function (list, val, arr) {
        // console.log("the list" + list)
        // console.log("the val" + val)
        // console.log("the arr" + arr)
        var x1 = list[0];
        var y1 = list[1];
        var a = xInd + x1;
        var b = yInd + y1;
        // console.log("in a: " + a + " b:" + b)
        var inField = ((a > 0 && b > 0) && (a < xSize && b < ySize));
        if (inField && gameField[a][b]) {
            count += 1;
        }
    });
    return count;
}
function print_field(xSize, ySize, gameField) {
    var result_str = "";
    for (var indexX = 0; indexX < xSize; indexX++) {
        for (var indexY = 0; indexY < ySize; indexY++) {
            if (gameField[indexX][indexY]) {
                result_str += "🟩";
            }
            else {
                result_str += "⬜";
            }
        }
        result_str += "\n";
    }
    return result_str;
}
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function someRandomMan(xSize, ySize, gameField) {
    for (var indexX = 0; indexX < xSize; indexX++) {
        for (var indexY = 0; indexY < ySize; indexY++) {
            var rand_val = Math.round(Math.random() * 10);
            if (rand_val >= 4) {
                gameField[indexX][indexY] = true;
            }
        }
    }
    return gameField;
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var xSize, ySize, gameField, generation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    xSize = 100;
                    ySize = 100;
                    gameField = create_empty_conways_game(xSize, ySize);
                    console.log("Starting the game with xSize: " + xSize + " ySize: " + ySize);
                    gameField = someRandomMan(xSize, ySize, gameField);
                    console.log(print_field(xSize, ySize, gameField));
                    return [4 /*yield*/, sleep(2000)];
                case 1:
                    _a.sent();
                    generation = 0;
                    _a.label = 2;
                case 2:
                    if (!(generation < 30)) return [3 /*break*/, 5];
                    gameField = create_next_conway_state(xSize, ySize, gameField);
                    console.log(print_field(xSize, ySize, gameField));
                    return [4 /*yield*/, sleep(1000)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    generation++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Done with the game");
                    return [2 /*return*/];
            }
        });
    });
}
main();
