var ConwayCell = /** @class */ (function () {
    function ConwayCell(alive) {
        if (alive === void 0) { alive = false; }
        this.alive = alive;
    }
    Object.defineProperty(ConwayCell.prototype, "is_alive", {
        get: function () {
            return this.alive;
        },
        enumerable: false,
        configurable: true
    });
    return ConwayCell;
}());
var CellPosition = /** @class */ (function () {
    function CellPosition(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
    Object.defineProperty(CellPosition.prototype, "xPosition", {
        get: function () {
            return this.xPos;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(CellPosition.prototype, "yPosition", {
        get: function () {
            return this.yPos;
        },
        enumerable: false,
        configurable: true
    });
    return CellPosition;
}());
// Rule which should only use the surronding cells to define a new state
var ConwayGameRule = /** @class */ (function () {
    function ConwayGameRule(result_state, viewed_cells, alive_goes_to_result_state_with_neighbours, dead_goes_to_result_state_with_neighbours) {
        if (alive_goes_to_result_state_with_neighbours === void 0) { alive_goes_to_result_state_with_neighbours = [2, 3]; }
        if (dead_goes_to_result_state_with_neighbours === void 0) { dead_goes_to_result_state_with_neighbours = [3]; }
        this.result_state = result_state;
        this.viewed_cell_positions = viewed_cells;
        this.alive_goes_to_result_state_with_neighbours = alive_goes_to_result_state_with_neighbours;
        this.dead_goes_to_result_state_with_neighbours = dead_goes_to_result_state_with_neighbours;
    }
    ConwayGameRule.prototype.applyRuleToGame = function (xPos, yPos, old_conway_game, new_conway_game) {
        var living_neighbour_count = old_conway_game.cell_living_neighbours(xPos, yPos, this.viewed_cell_positions, old_conway_game.gameField);
        var cell = old_conway_game.gameField[xPos][yPos];
        var is_alive_neighbour_count = this.alive_goes_to_result_state_with_neighbours.some(function (value) { return living_neighbour_count == value; });
        var is_dead_neighbour_count = this.dead_goes_to_result_state_with_neighbours.some(function (value) { return living_neighbour_count == value; });
        if (cell.is_alive && is_alive_neighbour_count) {
            new_conway_game.gameField[xPos][yPos] = new ConwayCell(this.result_state);
        }
        else if (!cell.is_alive && is_dead_neighbour_count) {
            new_conway_game.gameField[xPos][yPos] = new ConwayCell(this.result_state);
        }
        return new_conway_game;
    };
    return ConwayGameRule;
}());
var ConwayGame = /** @class */ (function () {
    function ConwayGame(pxSize, pySize, cells, rules, borderRules) {
        if (borderRules === void 0) { borderRules = "cutoff"; }
        this.xSize = pxSize;
        this.ySize = pySize;
        this.borderRules = borderRules;
        if (cells == null) {
            this.gameField = this.create_empty_conways_cell_array();
        }
        else {
            this.gameField = cells;
        }
        this.rules = rules;
    }
    ConwayGame.prototype.setCell = function (xPos, yPos, value) {
        this.gameField[yPos][xPos] = value;
    };
    ConwayGame.prototype.create_empty_conways_cell_array = function () {
        var _this = this;
        return new Array(this.ySize).fill(false).map(function () { return new Array(_this.xSize).fill(new ConwayCell(false)); });
    };
    ConwayGame.prototype.next_conway_state = function () {
        var _this = this;
        var new_conway_cell_field = this.create_empty_conways_cell_array();
        var new_conway_game = new ConwayGame(this.xSize, this.ySize, new_conway_cell_field, this.rules);
        var _loop_1 = function (indexX) {
            var _loop_2 = function (indexY) {
                this_1.rules.forEach(function (rule) {
                    rule.applyRuleToGame(indexX, indexY, _this, new_conway_game);
                });
            };
            for (var indexY = 0; indexY < this_1.ySize; indexY++) {
                _loop_2(indexY);
            }
        };
        var this_1 = this;
        for (var indexX = 0; indexX < this.xSize; indexX++) {
            _loop_1(indexX);
        }
        return new_conway_game;
    };
    ConwayGame.prototype.cell_living_neighbours = function (indexX, indexY, lookingAt, gameField) {
        var _this = this;
        var count = 0;
        lookingAt.forEach(function (list, val, arr) {
            var x1 = list.xPosition;
            var y1 = list.yPosition;
            var a = indexX + x1;
            var b = indexY + y1;
            if (_this.in_field(a, b) && gameField[a][b].is_alive) {
                count += 1;
            }
        });
        return count;
    };
    ConwayGame.prototype.in_field = function (indexX, indexY) {
        var inField = ((indexX > 0 && indexY > 0) && (indexX < this.xSize && indexY < this.ySize));
        return inField;
    };
    return ConwayGame;
}());
var ConwayGameFactory = /** @class */ (function () {
    function ConwayGameFactory(xSize, ySize, rules) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.rules = rules;
    }
    ConwayGameFactory.prototype.centeredfPentomino = function () {
        if (this.xSize < 3 && this.ySize < 3) {
            console.error("Cannot create a Pentomino in a field smaller than 3 times 3");
            return null;
        }
        var pos = this.get_center();
        var conway_game = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        conway_game.gameField[pos.xPos][pos.yPos] = new ConwayCell(true);
        conway_game.gameField[pos.xPos][pos.yPos + 1] = new ConwayCell(true);
        conway_game.gameField[pos.xPos][pos.yPos - 1] = new ConwayCell(true);
        conway_game.gameField[pos.xPos - 1][pos.yPos] = new ConwayCell(true);
        conway_game.gameField[pos.xPos + 1][pos.yPos + 1] = new ConwayCell(true);
        return conway_game;
    };
    ConwayGameFactory.prototype.circle = function (radius) {
        var pos = this.get_center();
        var conway_game = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (var radiusInc = 0; radiusInc < radius; radiusInc++) {
            var posToRotate = new CellPosition(0, radiusInc);
            for (var angle = 0; angle < 2 * Math.PI; angle += 1 / (2 * Math.PI)) {
                var newXPos = pos.xPos - (Math.round(posToRotate.xPos * Math.cos(angle) + posToRotate.yPos * -1 * Math.sin(angle)));
                var newYPos = pos.yPos + (Math.round(posToRotate.xPos * Math.sin(angle) + posToRotate.yPos * Math.cos(angle)));
                conway_game.gameField[newXPos][newYPos] = new ConwayCell(true);
            }
        }
        console.log(conway_game.gameField[300][217]);
        return conway_game;
    };
    ConwayGameFactory.prototype.yline = function (length) {
        var center = this.get_center();
        var conway_game = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (var curLength = 0; curLength < length; curLength++) {
            conway_game.gameField[center.xPos][center.yPos + curLength] = new ConwayCell(true); // TODO create y Positions
            console.log("Creating line at" + center.xPos + " " + center.yPos + "length: " + curLength);
        }
        return conway_game;
    };
    ConwayGameFactory.prototype.get_center = function () {
        var middleX = Math.ceil(this.xSize / 2);
        var middleY = Math.ceil(this.ySize / 2);
        return new CellPosition(middleX, middleY);
    };
    ConwayGameFactory.prototype.randomize_cells = function () {
        var conway_game = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (var indexX = 0; indexX < this.xSize; indexX++) {
            for (var indexY = 0; indexY < this.ySize; indexY++) {
                var rand_val = Math.round(Math.random() * 10);
                if (rand_val >= 3) {
                    conway_game.gameField[indexX][indexY] = new ConwayCell(true);
                }
            }
        }
        return conway_game;
    };
    return ConwayGameFactory;
}());
var CellColor = /** @class */ (function () {
    function CellColor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    Object.defineProperty(CellColor.prototype, "data", {
        get: function () {
            return [this.r, this.g, this.b, this.a];
        },
        enumerable: false,
        configurable: true
    });
    return CellColor;
}());
var ConwayGameRepresenter = /** @class */ (function () {
    function ConwayGameRepresenter(conway_game) {
        this.default_cell_alive_repr = "🟩";
        this.default_cell_dead_repr = "⬜";
        this.conway_game = conway_game;
        this.cell_repr_alive = new CellColor(255, 255, 255, 255);
        this.cell_repr_dead = new CellColor(0, 0, 20, 255);
        this.cell_repr_transparent = new CellColor(0, 0, 0, 0);
    }
    ConwayGameRepresenter.prototype.representation = function (cell) {
        if (cell.is_alive) {
            return this.default_cell_alive_repr;
        }
        return this.default_cell_dead_repr;
    };
    ConwayGameRepresenter.prototype.str_field = function () {
        var result_str = "";
        for (var indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (var indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                var cell = this.conway_game.gameField[indexX][indexY];
                result_str += this.representation(cell);
            }
            result_str += "\n";
        }
        return result_str;
    };
    ConwayGameRepresenter.prototype.as_number_colors_arr = function () {
        var result = [];
        for (var indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (var indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                var cell = this.conway_game.gameField[indexX][indexY];
                if (cell.is_alive) {
                    result[indexX + (this.conway_game.ySize) * indexY] = this.cell_repr_alive;
                }
                else {
                    result[indexX + (this.conway_game.ySize) * indexY] = this.cell_repr_dead;
                }
            }
        }
        return result;
    };
    return ConwayGameRepresenter;
}());
var ConwayHTMLDisplayer = /** @class */ (function () {
    function ConwayHTMLDisplayer(xStyle, yStyle) {
        this.xStyleCanvas = xStyle;
        this.yStyleCanvas = yStyle;
    }
    ConwayHTMLDisplayer.prototype.updateEmojiGameFieldAsString = function (conwayGame) {
        var gameSpace = document.getElementById("gameField");
        if (gameSpace != null) {
            var representer = new ConwayGameRepresenter(conwayGame);
            gameSpace.innerHTML = representer.str_field();
        }
    };
    ConwayHTMLDisplayer.prototype.updategameFieldPixelsAsCanvas = function (conwayGame) {
        var representer = new ConwayGameRepresenter(conwayGame);
        var gameSpace = document.getElementById("gameField");
        if (gameSpace == null) {
            console.error("couldn't find the gameField");
            return;
        }
        gameSpace.style.width = "500px";
        gameSpace.style.height = "500px";
        var new_canvas = document.createElement("canvas");
        new_canvas.style.width = "500px";
        new_canvas.style.height = "500px";
        var context = new_canvas.getContext("2d");
        var xOffset = conwayGame.xSize;
        var yOffset = conwayGame.ySize;
        var imageData = context === null || context === void 0 ? void 0 : context.createImageData(xOffset, yOffset);
        console.log("Created with size:" + xOffset + "," + yOffset);
        if (!imageData) {
            return;
        }
        var number_color_arr = representer.as_number_colors_arr();
        console.log("length of arr" + number_color_arr.length);
        var cur_res_index = 0;
        for (var i = 0; i < imageData.data.length; i += 4) {
            var cell_repr = number_color_arr[cur_res_index];
            var cell_repr_data = cell_repr.data;
            imageData.data[i + 0] = cell_repr_data[0]; // R value
            imageData.data[i + 1] = cell_repr_data[1]; // G value
            imageData.data[i + 2] = cell_repr_data[2]; // B value
            imageData.data[i + 3] = cell_repr_data[3]; // A value
            cur_res_index += 1;
        }
        context === null || context === void 0 ? void 0 : context.putImageData(imageData, 0, 0);
        if (context) {
            context.imageSmoothingEnabled = false;
        }
        gameSpace.replaceChildren(new_canvas);
    };
    ConwayHTMLDisplayer.prototype.displayGeneration = function (generation) {
        var currentGenerationElement = document.getElementById("GameFieldCurrentGeneration");
        if (currentGenerationElement != null) {
            var new_element = document.createElement("h1");
            new_element.innerHTML = "current Generation: " + generation.toString();
            currentGenerationElement.childNodes.forEach(function (element) {
                element.remove();
            });
            currentGenerationElement.appendChild(new_element);
        }
    };
    return ConwayHTMLDisplayer;
}());
var SURROUNDINGPOSITIONS = new Array(new CellPosition(-1, -1), new CellPosition(-1, 0), new CellPosition(-1, 1), new CellPosition(0, 1), new CellPosition(0, -1), new CellPosition(1, 1), new CellPosition(1, 0), new CellPosition(1, -1));
var DEFAULTGAMERULE = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2, 3], [3]));
var MULTIPLICATIONGAMERULE = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2], [2]));
var COPYGAMERULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [1, 3, 5, 7], [1, 3, 5, 7]));
var WORLD33RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [3], [3]));
var WORLD236RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2, 3, 6], [3]));
var SNAKEKINGRULEIDEA = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2], [2]));
var WORLD44RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [3], [2]));
export { ConwayCell, ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer };
