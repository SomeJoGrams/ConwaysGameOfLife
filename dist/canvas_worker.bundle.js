/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/main/game_of_life_default.ts":
/*!******************************************!*\
  !*** ./src/main/game_of_life_default.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AgingCellRepr: () => (/* binding */ AgingCellRepr),
/* harmony export */   BooleanCell: () => (/* binding */ BooleanCell),
/* harmony export */   CENTERDEFAULTGAMERULE: () => (/* binding */ CENTERDEFAULTGAMERULE),
/* harmony export */   CellColor: () => (/* binding */ CellColor),
/* harmony export */   CellPosition: () => (/* binding */ CellPosition),
/* harmony export */   ConfigStorage: () => (/* binding */ ConfigState),
/* harmony export */   ConwayGame: () => (/* binding */ ConwayGame),
/* harmony export */   ConwayGameAdvancer: () => (/* binding */ ConwayGameAdvancer),
/* harmony export */   ConwayGameFactory: () => (/* binding */ ConwayGameFactory),
/* harmony export */   ConwayGameRepresenter: () => (/* binding */ ConwayGameRepresenter),
/* harmony export */   ConwayHTMLDisplayer: () => (/* binding */ ConwayHTMLDisplayer),
/* harmony export */   DEFAULTGAMERULE: () => (/* binding */ DEFAULTGAMERULE),
/* harmony export */   MULTIPLICATIONGAMERULE: () => (/* binding */ MULTIPLICATIONGAMERULE),
/* harmony export */   MousePositionHandler: () => (/* binding */ MousePositionHandler),
/* harmony export */   ResetGameRule: () => (/* binding */ ResetGameRule),
/* harmony export */   ShapedConwayGameRule: () => (/* binding */ ShapedConwayGameRule)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class BooleanCell {
    constructor(alive) {
        this.alive = alive;
    }
    get isAlive() {
        return this.alive;
    }
    reset() {
        this.alive = false;
    }
    nextState() {
        this.alive = !this.alive;
    }
}
class CellPosition {
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
    }
    get xPosition() {
        return this.xPos;
    }
    get yPosition() {
        return this.yPos;
    }
    toString() {
        return "x" + this.xPos + "-y" + this.yPos;
    }
}
class Shape {
    inBoundsPos(position) {
        return this.inBounds(position.xPos, position.yPos);
    }
}
class Rectangle extends Shape {
    constructor(lowerLeftCorner, upperRightCorner) {
        super();
        this.lowerLeftCorner = lowerLeftCorner;
        this.upperRightCorner = upperRightCorner;
    }
    inBounds(xPos, yPos) {
        return (xPos > this.lowerLeftCorner.xPos &&
            xPos < this.upperRightCorner.yPos &&
            yPos > this.lowerLeftCorner.yPos &&
            yPos < this.upperRightCorner.yPos);
    }
}
class ShapedConwayGameRule {
    constructor(shape, viewed_cells, alive_goes_to_next_state = [2, 3], // FIXME state intialisation
    dead_goes_to_next_state = [3]) {
        this.shape = shape;
        this.viewed_cell_positions = viewed_cells;
        this.alive_goes_to_next_state = alive_goes_to_next_state;
        this.dead_goes_to_next_state = dead_goes_to_next_state;
        this.last_cell_which_died = null;
    }
    ruleCanBeApplied(position) {
        if (this.shape == null || (this.shape != null && !this.shape.inBoundsPos(position))) {
            return true;
        }
        return false;
    }
    applyRuleOnPos(xPos, yPos, conwayGame) {
        const cell = conwayGame.activeField.get_cell(xPos, yPos);
        let position = conwayGame.activeField.border_fixed_rules(new CellPosition(xPos, yPos));
        if (!this.ruleCanBeApplied(position)) {
            return conwayGame;
        }
        const living_neighbour_count = conwayGame.activeField.cell_living_neighbours(position.xPos, position.yPos, this.viewed_cell_positions);
        const is_alive_neighbour_count = this.alive_goes_to_next_state.some((value) => living_neighbour_count == value);
        const is_dead_neighbour_count = this.dead_goes_to_next_state.some((value) => living_neighbour_count == value);
        let nextCell = conwayGame.inactiveField.get_cell(position.xPos, position.yPos);
        if (cell.isAlive && is_alive_neighbour_count) {
            nextCell.nextState();
        }
        else if (!cell.isAlive && is_dead_neighbour_count) {
            nextCell.nextState();
        }
        else if (cell.isAlive)
            this.last_cell_which_died = new CellPosition(position.xPos, position.yPos);
        return conwayGame;
    }
    getIfLastCellKilledAtPosition() {
        let cell = this.last_cell_which_died;
        this.last_cell_which_died = null;
        return cell;
    }
}
class ConwayField {
    constructor(pxSize, pySize, borderRules = "cutoff") {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.gameField = this.create_empty_conways_cell_array();
        this.borderRules = borderRules;
        this._living_cell_count = 0;
    }
    create_empty_conways_cell_array() {
        let arr = new Array(this.ySize).fill(false).map(() => new Array(this.xSize).fill(false));
        return arr.map((vector, i, arr) => vector.map((el, i, arr) => new BooleanCell(false)));
    }
    clear() {
        this.gameField = this.create_empty_conways_cell_array();
        this._living_cell_count = 0;
    }
    get living_cell_percent() {
        return this._living_cell_count / (this.xSize * this.ySize);
    }
    count_living_cells() {
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                if (this.get_cell(indexX, indexY).isAlive) {
                    this._living_cell_count += 1;
                }
            }
        }
    }
    get_cell(xPos, yPos) {
        let cellPos = this.border_fixed_rules(new CellPosition(xPos, yPos));
        return this.gameField[cellPos.yPos][cellPos.xPos];
    }
    set_cell(xPos, yPos, value) {
        let cellPos = this.border_fixed_rules(new CellPosition(xPos, yPos));
        if (value.isAlive) {
            this._living_cell_count += 1;
        }
        this.gameField[cellPos.yPos][cellPos.xPos] = value;
    }
    border_fixed_rules(pos) {
        let xPosFixed = pos.xPos;
        let yPosFixed = pos.yPos;
        if (this.borderRules == "cutoff") {
            if (pos.xPos > this.xSize) {
                xPosFixed = this.xSize - 1;
            }
            if (pos.yPos > this.ySize) {
                yPosFixed = this.ySize - 1;
            }
            if (pos.yPos < 0) {
                yPosFixed = 0;
            }
            if (pos.xPos < 0) {
                xPosFixed = 0;
            }
            return pos;
        }
        if (pos.xPos >= this.xSize) {
            xPosFixed = pos.xPos % this.xSize;
        }
        if (pos.xPos < 0) {
            xPosFixed = (pos.xPos % this.xSize) * -1;
        }
        if (pos.yPos >= this.ySize) {
            yPosFixed = pos.yPos % this.ySize;
        }
        if (pos.yPos < 0) {
            yPosFixed = (pos.yPos % this.ySize) * -1;
        }
        return new CellPosition(xPosFixed, yPosFixed);
    }
    cell_living_neighbours(indexX, indexY, lookingAt) {
        let count = 0;
        lookingAt.forEach((list, val, arr) => {
            let x1 = list.xPosition;
            let y1 = list.yPosition;
            let a = indexX + x1;
            let b = indexY + y1;
            if (this.in_field(a, b) && this.get_cell(a, b).isAlive) {
                count += 1;
            }
        });
        return count;
    }
    in_field(indexX, indexY) {
        if (this.borderRules == "extend") {
            return true;
        }
        let inField = indexX > 0 && indexY > 0 && indexX < this.xSize && indexY < this.ySize;
        return inField;
    }
}
class ConwayGame {
    constructor(pxSize, pySize, cells, rules, fallbackRule = null, borderRules = "cutoff") {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.borderRules = borderRules;
        if (cells == null) {
            this.currentGameField = this.createGameField();
        }
        else {
            this.currentGameField = cells;
        }
        this.lastGameField = this.createGameField();
        this.activeGameFieldKind = "current";
        this.fallbackRule = fallbackRule;
        this.positional_rules = rules;
        this.lastStepDiedCells = [];
    }
    clear_field() {
        this.activeField.clear();
    }
    createGameField() {
        return new ConwayField(this.xSize, this.ySize, this.borderRules);
    }
    get living_cell_count() {
        return this.living_cell_count;
    }
    get activeField() {
        if (this.activeGameFieldKind == "current") {
            return this.currentGameField;
        }
        else {
            return this.lastGameField;
        }
    }
    get inactiveField() {
        if (this.activeGameFieldKind == "current") {
            return this.lastGameField;
        }
        else {
            return this.currentGameField;
        }
    }
    setOnActiveField(xPos, yPos, cell) {
        this.activeField.set_cell(xPos, yPos, cell);
    }
    getCurrentCell(xPos, yPos) {
        return this.activeField.get_cell(xPos, yPos);
    }
    nextState() {
        this.lastStepDiedCells = [];
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                this.inactiveField.get_cell(indexX, indexY).reset();
                this.positional_rules.forEach((rule) => {
                    // TODO dry this
                    rule.applyRuleOnPos(indexX, indexY, this);
                    let optional_cell = rule.getIfLastCellKilledAtPosition();
                    if (optional_cell != null) {
                        this.lastStepDiedCells.push(optional_cell);
                    }
                });
                if (this.fallbackRuleShouldBeApplied(indexX, indexY)) {
                    this.fallbackRule.applyRuleOnPos(indexX, indexY, this);
                    let optional_cell = (this.fallbackRule).getIfLastCellKilledAtPosition();
                    if (optional_cell != null) {
                        this.lastStepDiedCells.push(optional_cell);
                    }
                }
            }
        }
        this.switchActiveGameField();
        return this;
    }
    fallbackRuleShouldBeApplied(indexX, indexY) {
        const positionalRulesApplicable = this.positional_rules.some((rule, i, arr) => rule.ruleCanBeApplied(new CellPosition(indexX, indexY)));
        return !positionalRulesApplicable && this.fallbackRule != null;
    }
    switchActiveGameField() {
        if (this.activeGameFieldKind == "last") {
            this.activeGameFieldKind = "current";
        }
        else {
            this.activeGameFieldKind = "last";
        }
    }
    getLastStepDiedCellPositions() {
        return this.lastStepDiedCells;
    }
}
class ResetGameRule {
    constructor(reset_percent, replacing_factory) {
        this.reset_percent = reset_percent;
        this.editing_conway_factory = replacing_factory;
    }
    nextGameWithRule(conwayGame) {
        if (conwayGame.activeField.living_cell_percent > this.reset_percent) {
            this.editing_conway_factory.circle(5, 1, undefined, conwayGame); // TODO make creation function take an object
        }
    }
}
class ConwayGameAdvancer extends ConwayGame {
    constructor(pxSize, pySize, cells, rules, fallbackRule = null, borderRules = "cutoff", generalRules) {
        super(pxSize, pySize, cells, rules, fallbackRule, borderRules);
        this.generalRules = generalRules;
    }
    static fromConwayGame(conwayGame, generalRules = null) {
        let generalR = generalRules !== null && generalRules !== void 0 ? generalRules : [];
        return new this(conwayGame.xSize, conwayGame.ySize, conwayGame.activeField, conwayGame.positional_rules, conwayGame.fallbackRule, conwayGame.borderRules, generalR);
    }
    nextState() {
        for (const rule of this.generalRules) {
            rule.nextGameWithRule(this);
        }
        super.nextState();
        return this;
    }
    addPath(pos) {
        let path = this.calcPath(pos);
        for (const position of path) {
            this.getCurrentCell(position.xPos, position.yPos).nextState();
        }
    }
    calcPath(pos) {
        let resultPath = new Set();
        const xStart = Math.round(pos.startPos.xPos);
        const yStart = Math.round(pos.startPos.yPos);
        const xEnd = Math.round(pos.endPos.xPos);
        const yEnd = Math.round(pos.endPos.yPos);
        const yDif = yEnd - yStart;
        const xDif = xEnd - xStart;
        let xOffset = 0;
        let yOffset = 0;
        if (xDif == 0) {
            for (let curyDif = 0; curyDif <= Math.abs(yDif); curyDif++) {
                resultPath.add(new CellPosition(Math.round(xStart), Math.round(yStart + curyDif)));
            }
        }
        else if (yDif == 0) {
            for (let curxDif = 0; curxDif <= Math.abs(xDif); curxDif++) {
                resultPath.add(new CellPosition(Math.round(xStart + curxDif), Math.round(yStart)));
            }
        }
        else {
            const pointDistance = Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
            let m = yDif / xDif;
            let xPos = 0;
            if (m > 0) {
                xPos = Math.min(xStart, xEnd);
            }
            else {
                xPos = Math.max(xStart, xEnd);
            }
            let b = yEnd - m * xEnd;
            for (let curDist = 0; curDist < pointDistance / Math.abs(m) - Math.abs(m); curDist += 1) {
                resultPath.add(new CellPosition(Math.round(xPos), Math.round(m * xPos + b)));
                xPos += m;
            }
        }
        return Array.of(...resultPath.keys());
    }
}
class ConwayGameFactory {
    constructor(xSize, ySize, rules, aliveCellState, fallbackRule = null, borderRules = "cutoff") {
        this.xSize = xSize;
        this.ySize = ySize;
        this.rules = rules;
        this.borderRules = borderRules;
        this.aliveCellState = aliveCellState;
        this.fallbackRule = fallbackRule;
    }
    centeredfPentomino(conway_game) {
        if (this.xSize < 3 && this.ySize < 3) {
            console.error("Cannot create a Pentomino in a field smaller than 3 times 3");
            return null;
        }
        let pos = this.get_center();
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        }
        else {
            conway_game.clear_field();
        }
        conway_game.setOnActiveField(pos.xPos, pos.yPos, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos, pos.yPos + 1, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos, pos.yPos - 1, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos - 1, pos.yPos, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos + 1, pos.yPos + 1, new BooleanCell(this.aliveCellState));
        return conway_game;
    }
    create_conway_game() {
        let conway_game = new ConwayGame(this.xSize, this.ySize, null, this.rules, this.fallbackRule, this.borderRules);
        return conway_game;
    }
    circle(radius, steps = 1 / (2 * Math.PI), offsets = undefined, conway_game = undefined) {
        // TODO fix type + use
        let pos = this.get_center();
        offsets = offsets !== null && offsets !== void 0 ? offsets : [new CellPosition(0, 0)];
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        }
        else {
            conway_game.clear_field();
        }
        for (const offset of offsets) {
            // TODO calc overlap of shaped
            for (let radiusInc = 0; radiusInc < radius; radiusInc++) {
                let posToRotate = new CellPosition(0, radiusInc);
                for (let angle = 0; angle < 2 * Math.PI; angle += steps) {
                    let newXPos = pos.xPos -
                        Math.round(posToRotate.xPos * Math.cos(angle) +
                            posToRotate.yPos * -1 * Math.sin(angle));
                    let newYPos = pos.yPos +
                        Math.round(posToRotate.xPos * Math.sin(angle) + posToRotate.yPos * Math.cos(angle)); // TODO move pos calculation out
                    conway_game.setOnActiveField(newXPos + offset.xPos, newYPos + offset.yPos, new BooleanCell(this.aliveCellState));
                }
            }
        }
        return conway_game;
    }
    yline(length, conway_game = undefined) {
        let center = this.get_center();
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        }
        else {
            conway_game.clear_field();
        }
        for (let curLength = 0; curLength < length; curLength++) {
            conway_game.setOnActiveField(center.xPos, center.yPos + curLength, new BooleanCell(this.aliveCellState));
        }
        return conway_game;
    }
    get_center() {
        let middleX = Math.ceil(this.xSize / 2);
        let middleY = Math.ceil(this.ySize / 2);
        return new CellPosition(middleX, middleY);
    }
    randomize_cells(alive_above = 3, scale_rand = 10, conway_game = undefined) {
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        }
        else {
            conway_game.clear_field();
        }
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                let rand_val = Math.round(Math.random() * scale_rand);
                if (rand_val >= alive_above) {
                    conway_game.setOnActiveField(indexX, indexY, new BooleanCell(this.aliveCellState));
                }
            }
        }
        return conway_game;
    }
}
class CellColor {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static get BLACK() {
        return new CellColor(0, 0, 0, 1);
    }
    static get WHITE() {
        return new CellColor(255, 255, 255, 1);
    }
    get data() {
        return [this.r, this.g, this.b, this.a];
    }
    get rgba_str() {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    }
    clone() {
        return new CellColor(this.r, this.g, this.b, this.a);
    }
}
class FadingCellColor extends CellColor {
    constructor(start_repr, fade_strength = 0.8) {
        const data = start_repr.data;
        super(data[0], data[1], data[2], data[3]);
        this.start_repr = start_repr;
        this.color_fade_factor = fade_strength;
    }
    fade(times) {
        this.r = this.r * this.color_fade_factor * times;
        this.g = this.g * this.color_fade_factor * times;
        this.b = this.b * this.color_fade_factor * times;
    }
}
class ConwayGameRepresenter {
    constructor(conway_game, config) {
        this.default_cell_alive_repr = "🟩";
        this.default_cell_dead_repr = "⬜";
        this.conway_game = conway_game;
        this.cell_repr_alive = config.alive_cell_repr;
        this.cell_repr_dead = config.dead_cell_repr;
        this.cell_repr_transparent = new CellColor(0, 0, 0, 0);
    }
    representation(cell) {
        if (cell.isAlive) {
            return this.default_cell_alive_repr;
        }
        return this.default_cell_dead_repr;
    }
    str_field() {
        let result_str = "";
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                let cell = this.conway_game.getCurrentCell(indexX, indexY);
                result_str += this.representation(cell);
            }
            result_str += "\n";
        }
        return result_str;
    }
    as_number_colors_arr() {
        let result = new Array(this.conway_game.xSize * this.conway_game.ySize).fill(this.cell_repr_transparent);
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                const cell = this.conway_game.getCurrentCell(indexX, indexY);
                let one_dim_ind = indexX + indexY * this.conway_game.xSize;
                result[one_dim_ind] = cell.isAlive ? this.cell_repr_alive : this.cell_repr_dead;
            }
        }
        return result;
    }
    number_color_arr(indexX, indexY) {
        const cell = this.conway_game.getCurrentCell(indexX, indexY);
        return cell.isAlive ? this.cell_repr_alive : this.cell_repr_dead;
    }
}
class AgingCellRepr {
    constructor(position, startLife, start_cell_repr) {
        this.position = position;
        this.current_life = startLife;
        this.start_life = startLife;
        this.fading_cell_color = new FadingCellColor(start_cell_repr);
    }
    get completelyFaded() {
        return this.current_life <= 0;
    }
    get isAged() {
        return this.start_life != this.current_life;
    }
    age() {
        this.current_life -= 1;
        this.fading_cell_color.fade(1);
    }
    get_faded_repr() {
        return this.fading_cell_color;
    }
}
class ConwayHTMLDisplayer {
    constructor(canvas, config, nextCanvasBitMap = null, preRenderCanvas = null, bitmapContext = null) {
        this.nextCanvasBitMap = null;
        this.preRenderCanvas = null;
        this.canvas = canvas;
        this.config = config;
        this.posToCellWithVisualTrail = new Map();
        if (canvas != undefined && preRenderCanvas != null) {
            this.bitmapContext = (this.canvas.getContext("bitmaprenderer"));
            this.nextCanvasBitMap = nextCanvasBitMap;
            this.preRenderCanvas = preRenderCanvas;
            let context = this.preRenderCanvas.getContext("2d", { alpha: false });
            if (context != null) {
                this.preRenderContext = context;
            }
        }
        this.handleConfigUpdate();
        this.consumeUpdates();
    }
    addVisualTrailCellsAndAgeTrail(conway_game) {
        if (this.config.trail_length == 1) {
            return;
        }
        const new_cell_trail_positions = conway_game.getLastStepDiedCellPositions();
        new_cell_trail_positions.forEach((pos, i, arr) => {
            this.posToCellWithVisualTrail.set(pos.toString(), new AgingCellRepr(pos, this.config.trail_length, this.config.alive_cell_repr));
        });
        for (const [posString, val] of this.posToCellWithVisualTrail.entries()) {
            val.age();
            let agingRepr = this.posToCellWithVisualTrail.get(posString);
            if (agingRepr != undefined && (agingRepr === null || agingRepr === void 0 ? void 0 : agingRepr.current_life) <= 0) {
                this.posToCellWithVisualTrail.delete(posString);
            }
        }
    }
    updateEmojiGameFieldAsString(conwayGame) {
        let gameSpace = document.getElementById("gameField");
        if (gameSpace != null) {
            let representer = new ConwayGameRepresenter(conwayGame, this.config);
            gameSpace.innerHTML = representer.str_field();
        }
    }
    preprender_bitmap(conwayGame) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.canvas) {
                throw Error("no canvas defined");
            }
            const representer = new ConwayGameRepresenter(conwayGame, this.config);
            const xSizeRect = this.canvas.width / conwayGame.xSize;
            const ySizeRect = this.canvas.height / conwayGame.ySize;
            let cur_res_index = 0;
            let alivePath = [];
            let fadingPaths = new Map();
            for (let xPos = 0; xPos < conwayGame.xSize; xPos++) {
                for (let yPos = 0; yPos < conwayGame.ySize; yPos++) {
                    if (conwayGame.getCurrentCell(xPos, yPos).isAlive) {
                        alivePath.push([xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect]);
                    }
                    const fadingCell = this.posToCellWithVisualTrail.get(new CellPosition(xPos, yPos).toString());
                    if (fadingCell != undefined) {
                        if (!fadingPaths.has(fadingCell.current_life)) {
                            fadingPaths.set(fadingCell.current_life, {
                                cell_repr: fadingCell.fading_cell_color,
                                fadingPath: [],
                            });
                        }
                        let fadingPath = (_a = fadingPaths.get(fadingCell.current_life)) === null || _a === void 0 ? void 0 : _a.fadingPath;
                        fadingPath === null || fadingPath === void 0 ? void 0 : fadingPath.push([xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect]);
                    }
                    cur_res_index++;
                }
            }
            if (this.preRenderContext == null) {
                throw Error("No Context exists");
            }
            this.preRenderContext.imageSmoothingEnabled = false;
            this.preRenderContext.fillStyle = representer.cell_repr_dead.rgba_str;
            this.preRenderContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
            for (const { cell_repr, fadingPath } of fadingPaths.values()) {
                this.renderPath(this.preRenderContext, cell_repr, fadingPath);
            }
            this.renderPath(this.preRenderContext, representer.cell_repr_alive, alivePath);
            if (this.preRenderCanvas) {
                this.nextCanvasBitMap = this.preRenderCanvas.transferToImageBitmap();
            }
        });
    }
    renderPath(canvasContext, cell_repr, rectPath) {
        canvasContext === null || canvasContext === void 0 ? void 0 : canvasContext.beginPath();
        canvasContext.fillStyle = cell_repr.rgba_str;
        for (const path of rectPath) {
            canvasContext.rect(path[0], path[1], path[2], path[3]);
        }
        canvasContext === null || canvasContext === void 0 ? void 0 : canvasContext.closePath();
        canvasContext === null || canvasContext === void 0 ? void 0 : canvasContext.fill();
    }
    getPreRenderedBitmap(conwayGame) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.preRenderCanvas == null) {
                yield this.preprender_bitmap(conwayGame);
            }
            return this.nextCanvasBitMap;
        });
    }
    update_game_field_with_shapes_from_prerender(conwayGame, offsetX = 0, offsetY = 0) {
        this.addVisualTrailCellsAndAgeTrail(conwayGame);
        if (!this.canvas) {
            console.error("Canvas is undefined and therefore not usable");
            return;
        }
        if (this.bitmapContext == null) {
            return;
        }
        let prerenderedCanvas = this.getPreRenderedBitmap(conwayGame);
        prerenderedCanvas.then((v) => {
            var _a;
            (_a = this.bitmapContext) === null || _a === void 0 ? void 0 : _a.transferFromImageBitmap(v);
        });
        this.nextCanvasBitMap = null;
    }
    // protected faded_cell_repr_data_or_cell_repr(original_cell_repr: CellRepr, opt_fading_cell: AgingCellRepr | undefined = undefined) {
    //     let cell_repr = original_cell_repr;
    //     console.log((opt_fading_cell != undefined) + " " + (!opt_fading_cell?.completelyFaded) + "" + (cell_repr == this.config.dead_cell_repr) + "" + (opt_fading_cell?.isAged));
    //     if (opt_fading_cell != undefined && !opt_fading_cell.completelyFaded && cell_repr == this.config.dead_cell_repr && opt_fading_cell.isAged) {
    //         cell_repr = opt_fading_cell.fading_cell_color;
    //     }
    //     return cell_repr;
    // }
    displayGeneration(generation) {
        let currentGenerationElement = document.getElementById("GameFieldCurrentGeneration");
        if (currentGenerationElement != null) {
            let new_element = document.createElement("h1");
            new_element.innerHTML = "current Generation: " + generation.toString();
            currentGenerationElement.childNodes.forEach((element) => {
                element.remove();
            });
            currentGenerationElement.appendChild(new_element);
        }
    }
    consumeUpdates() {
        this.config.on_screen_change().on(this.handleConfigUpdate.bind(this));
    }
    handleConfigUpdate() {
        if (this.canvas != undefined) {
            console.log("Config update detected");
            this.canvas.width = this.config.x_resolution;
            this.canvas.height = this.config.screen_ratio * this.config.x_resolution;
            if (this.preRenderCanvas != null) {
                this.preRenderCanvas.width = this.canvas.width;
                this.preRenderCanvas.height = this.canvas.height;
            }
        }
    }
    mapToConwayFieldPosition(pos, conway_game) {
        const startPosX = (pos.startPos.xPos / this.config.x_resolution) * conway_game.xSize;
        const startPosY = (pos.startPos.yPos / (this.config.x_resolution * this.config.screen_ratio)) *
            conway_game.ySize;
        const endPosX = (pos.endPos.xPos / this.config.x_resolution) * conway_game.xSize;
        const endPosY = (pos.endPos.yPos / (this.config.x_resolution * this.config.screen_ratio)) *
            conway_game.ySize;
        return {
            startPos: new CellPosition(Math.round(startPosX), Math.round(startPosY)),
            endPos: new CellPosition(Math.round(endPosX), Math.round(endPosY)),
        };
    }
}
class MousePositionHandler {
    constructor(startXPos, startYPos) {
        this.lastXPosition = startXPos;
        this.lastYPosition = startYPos;
        this.timeStamp = performance.now();
        this.path = null;
    }
    updateMousePos(xPos, yPos) {
        if (xPos != this.lastXPosition || yPos != this.lastYPosition) {
            const path = {
                startPos: new CellPosition(this.lastXPosition, this.lastYPosition),
                endPos: new CellPosition(xPos, yPos),
            };
            this.path = path;
            this.lastXPosition = xPos;
            this.lastYPosition = yPos;
        }
    }
    getAndResetPath() {
        var _a, _b, _c, _d, _e, _f;
        let p = null;
        if (((_a = this.path) === null || _a === void 0 ? void 0 : _a.startPos) != null && ((_b = this.path) === null || _b === void 0 ? void 0 : _b.endPos) != null) {
            // TODO add clone function to cell position
            p = {
                startPos: new CellPosition((_c = this.path) === null || _c === void 0 ? void 0 : _c.startPos.xPos, (_d = this.path) === null || _d === void 0 ? void 0 : _d.startPos.yPos),
                endPos: new CellPosition((_e = this.path) === null || _e === void 0 ? void 0 : _e.endPos.xPos, (_f = this.path) === null || _f === void 0 ? void 0 : _f.endPos.yPos),
            };
        }
        this.path = null;
        return p;
    }
}
class SimpleEvent {
    constructor() {
        this.handlers = []; // just functions which are called on trigger
    }
    on(handler) {
        this.handlers.push(handler);
    }
    off(handler) {
        this.handlers = this.handlers.filter((h) => h !== handler);
    }
    trigger(data) {
        this.handlers.slice(0).forEach((h) => h(data));
    }
    expose() {
        return this;
    }
}
class ConfigState {
    on_screen_change() {
        return this.screen_change_event.expose();
    }
    constructor(color_alive = new CellColor(255, 255, 255, 255), color_dead = new CellColor(0, 0, 20, 255), display_trails = 3, x_resolution = 1000, screen_ratio = 9 / 16) {
        this.current_BPM = 60;
        this.screen_change_event = new SimpleEvent();
        this._alive_cell_color = color_alive;
        this._dead_cell_color = color_dead;
        this._display_trails = Math.max(1, display_trails);
        this._x_resolution = x_resolution;
        this._screen_ratio = screen_ratio;
        this._mousePositionHandler = null;
        this.game_settings_updated = false;
        this._beat_offset_time_ms = null;
    }
    get alive_cell_repr() {
        return this._alive_cell_color;
    }
    set set_alive_cell_color(color) {
        this._alive_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
        this.game_settings_updated = true;
    }
    set set_dead_cell_color(color) {
        this._dead_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
        this.game_settings_updated = true;
    }
    set x_resolution(resolution) {
        this._x_resolution = Math.max(resolution, 100);
        this.screen_change_event.trigger();
    }
    get x_resolution() {
        return this._x_resolution;
    }
    set screen_ratio(ratio) {
        this._screen_ratio = ratio;
        this.screen_change_event.trigger();
    }
    get screen_ratio() {
        return this._screen_ratio;
    }
    get dead_cell_repr() {
        return this._dead_cell_color;
    }
    set mousePositionHandler(handler) {
        this._mousePositionHandler = handler;
    }
    get getMousePositionHandler() {
        return this._mousePositionHandler;
    }
    get trail_length() {
        return this._display_trails;
    }
    get bpm_timeout_seconds() {
        return 1 / (this.bpm / 60);
    }
    set update_bpm(new_bpm) {
        this.current_BPM = new_bpm;
    }
    get bpm() {
        return this.current_BPM;
    }
    get_beat_offset_seconds(time_ms) {
        console.log("the offset ", this._beat_offset_time_ms);
        if (this._beat_offset_time_ms === null) {
            return 0;
        }
        const offset = time_ms - this._beat_offset_time_ms;
        return Math.max(0, offset);
    }
    set beat_offset_seconds(time_ms) {
        this._beat_offset_time_ms = time_ms;
    }
}
const SURROUNDINGPOSITIONS = new Array(new CellPosition(-1, -1), new CellPosition(-1, 0), new CellPosition(-1, 1), new CellPosition(0, 1), new CellPosition(0, -1), new CellPosition(1, 1), new CellPosition(1, 0), new CellPosition(1, -1));
const DEFAULTGAMERULE = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2, 3], [3]));
const MULTIPLICATIONGAMERULE = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2], [2]));
const COPYGAMERULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [1, 3, 5, 7], [1, 3, 5, 7]));
const WORLD33RULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [3], [3]));
const WORLD236RULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2, 3, 6], [3]));
const SNAKEKINGRULEIDEA = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2], [2]));
const WORLD44RULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [3], [2]));
const CENTERDEFAULTGAMERULE = new Array(new ShapedConwayGameRule(new Rectangle(new CellPosition(100, 0), new CellPosition(200, 200)), SURROUNDINGPOSITIONS, [2, 3], [3]));



/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./src/workers/canvas_worker.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../main/game_of_life_default */ "./src/main/game_of_life_default.ts");

const CONWAYCONFIG = new _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.ConfigStorage();
self.onmessage = (event) => {
    console.debug("Worker received message " + event.data);
    let received_data = event.data;
    switch (received_data.message) {
        case "start":
            if (received_data.canvas == undefined || received_data.prerenderCanvas == undefined) {
                throw Error("Start is missing arguments");
            }
            let mainCanvas = received_data.canvas;
            let optCanvas = received_data.prerenderCanvas;
            start_conway_game_on_canvas(mainCanvas, optCanvas);
            break;
        case "setXResolution":
            console.debug("Worker received resolution message" + received_data);
            CONWAYCONFIG.x_resolution = received_data.width;
            break;
        case "setScreenRatio":
            console.debug("Worker received screen ratio message" + received_data.screen_ratio);
            CONWAYCONFIG.screen_ratio = received_data.screen_ratio;
            break;
        case "setColorAlive":
            CONWAYCONFIG.set_alive_cell_color = received_data.rgba; // TODO make this also be able to take a function / or use a predefined function
            break;
        case "setColorDead":
            CONWAYCONFIG.set_dead_cell_color = received_data.rgba;
            break;
        case "mouseposition":
            if (CONWAYCONFIG.getMousePositionHandler == null) {
                CONWAYCONFIG.mousePositionHandler = new _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.MousePositionHandler(received_data.xPos, received_data.yPos);
            }
            else {
                CONWAYCONFIG.getMousePositionHandler.updateMousePos(received_data.xPos, received_data.yPos);
            }
            break;
        case "bpmUpdate":
            CONWAYCONFIG.update_bpm = received_data.bpm;
            CONWAYCONFIG.beat_offset_seconds = received_data.next_beat_time;
            break;
        default:
            console.error("Unknown data" + received_data);
            console.error("Unknown message " + received_data.message);
            break;
    }
};
function get_ratio_y_to_x(x, canvas) {
    // TODO use offscreen canvas ratio
    return Math.ceil(x * 0.5625);
}
function start_conway_game_on_canvas(canvas, prerenderCanvas) {
    let fps = 30;
    const x_pixel_default = 150;
    const y_pixel_default = get_ratio_y_to_x(x_pixel_default, canvas);
    const conwayGameFactory = new _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.ConwayGameFactory(x_pixel_default, y_pixel_default, _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.CENTERDEFAULTGAMERULE, true, _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.MULTIPLICATIONGAMERULE[0], "extend"); // todo real screen proportions, e.g. window is sized
    let currentConwayGameOriginal = conwayGameFactory.circle(20, (1 / 20) * Math.PI, [
        new _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.CellPosition(0, 0),
    ]);
    let currentConwayGame = _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.ConwayGameAdvancer.fromConwayGame(currentConwayGameOriginal, undefined);
    const field_drawer = new _main_game_of_life_default__WEBPACK_IMPORTED_MODULE_0__.ConwayHTMLDisplayer(canvas, CONWAYCONFIG, null, prerenderCanvas);
    field_drawer.update_game_field_with_shapes_from_prerender(currentConwayGame);
    let gameStateStart = Date.now();
    let timeout_update_received = false;
    function draw_conway_game(timeStamp) {
        timeStamp = Date.now();
        if (!currentConwayGame) {
            console.error("No Conway game was created");
            return;
        }
        const elapsed_game_state = timeStamp - gameStateStart;
        const needed_time = (CONWAYCONFIG.bpm_timeout_seconds + CONWAYCONFIG.get_beat_offset_seconds(timeStamp)) *
            1000;
        if (elapsed_game_state > needed_time) {
            gameStateStart = timeStamp;
            updateConwayGame();
            CONWAYCONFIG.beat_offset_seconds = null;
        }
        if (timeout_update_received) {
            field_drawer.update_game_field_with_shapes_from_prerender(currentConwayGame);
            timeout_update_received = false;
        }
        requestAnimationFrame((t) => draw_conway_game(t));
    }
    function updateConwayGame() {
        var _a;
        if (currentConwayGame) {
            currentConwayGame.nextState();
            const pos = (_a = CONWAYCONFIG.getMousePositionHandler) === null || _a === void 0 ? void 0 : _a.getAndResetPath();
            if (pos != null) {
                console.debug("adding path at" + pos.startPos + "to " + pos.endPos);
                const posFixed = field_drawer.mapToConwayFieldPosition(pos, currentConwayGame);
                console.debug("mapped path to" + posFixed.startPos + "to " + posFixed.endPos);
                currentConwayGame.addPath(posFixed);
            }
            field_drawer
                .preprender_bitmap(currentConwayGame)
                .then((f) => (timeout_update_received = true));
        }
    }
    requestAnimationFrame(draw_conway_game);
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FudmFzX3dvcmtlci5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkFBaUIsU0FBSSxJQUFJLFNBQUk7QUFDN0IsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIscUJBQXFCO0FBQ2xELGlDQUFpQyxxQkFBcUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIscUJBQXFCO0FBQ2xELGlDQUFpQyxxQkFBcUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQywyQkFBMkI7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMkJBQTJCO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MscURBQXFEO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxvQkFBb0I7QUFDeEQ7QUFDQSxvQ0FBb0MscUJBQXFCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkdBQTZHO0FBQzdHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0Msb0JBQW9CO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHFCQUFxQjtBQUNsRCxpQ0FBaUMscUJBQXFCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsaUNBQWlDO0FBQzlELGlDQUFpQyxpQ0FBaUM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGlDQUFpQztBQUM5RCxpQ0FBaUMsaUNBQWlDO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0UsY0FBYztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQix5QkFBeUI7QUFDeEQsbUNBQW1DLHlCQUF5QjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsd0JBQXdCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDd1Q7Ozs7Ozs7VUMxMEJ4VDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7OztBQ042TTtBQUM3TSx5QkFBeUIscUVBQWE7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdEQUF3RCw0RUFBb0I7QUFDNUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyx5RUFBaUIsbUNBQW1DLDZFQUFxQixRQUFRLDhFQUFzQixnQkFBZ0I7QUFDeko7QUFDQSxZQUFZLG9FQUFZO0FBQ3hCO0FBQ0EsNEJBQTRCLDBFQUFrQjtBQUM5Qyw2QkFBNkIsMkVBQW1CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9zcmMvbWFpbi9nYW1lX29mX2xpZmVfZGVmYXVsdC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9zcmMvd29ya2Vycy9jYW52YXNfd29ya2VyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuY2xhc3MgQm9vbGVhbkNlbGwge1xuICAgIGNvbnN0cnVjdG9yKGFsaXZlKSB7XG4gICAgICAgIHRoaXMuYWxpdmUgPSBhbGl2ZTtcbiAgICB9XG4gICAgZ2V0IGlzQWxpdmUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsaXZlO1xuICAgIH1cbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5hbGl2ZSA9IGZhbHNlO1xuICAgIH1cbiAgICBuZXh0U3RhdGUoKSB7XG4gICAgICAgIHRoaXMuYWxpdmUgPSAhdGhpcy5hbGl2ZTtcbiAgICB9XG59XG5jbGFzcyBDZWxsUG9zaXRpb24ge1xuICAgIGNvbnN0cnVjdG9yKHhQb3MsIHlQb3MpIHtcbiAgICAgICAgdGhpcy54UG9zID0geFBvcztcbiAgICAgICAgdGhpcy55UG9zID0geVBvcztcbiAgICB9XG4gICAgZ2V0IHhQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueFBvcztcbiAgICB9XG4gICAgZ2V0IHlQb3NpdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueVBvcztcbiAgICB9XG4gICAgdG9TdHJpbmcoKSB7XG4gICAgICAgIHJldHVybiBcInhcIiArIHRoaXMueFBvcyArIFwiLXlcIiArIHRoaXMueVBvcztcbiAgICB9XG59XG5jbGFzcyBTaGFwZSB7XG4gICAgaW5Cb3VuZHNQb3MocG9zaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5Cb3VuZHMocG9zaXRpb24ueFBvcywgcG9zaXRpb24ueVBvcyk7XG4gICAgfVxufVxuY2xhc3MgUmVjdGFuZ2xlIGV4dGVuZHMgU2hhcGUge1xuICAgIGNvbnN0cnVjdG9yKGxvd2VyTGVmdENvcm5lciwgdXBwZXJSaWdodENvcm5lcikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmxvd2VyTGVmdENvcm5lciA9IGxvd2VyTGVmdENvcm5lcjtcbiAgICAgICAgdGhpcy51cHBlclJpZ2h0Q29ybmVyID0gdXBwZXJSaWdodENvcm5lcjtcbiAgICB9XG4gICAgaW5Cb3VuZHMoeFBvcywgeVBvcykge1xuICAgICAgICByZXR1cm4gKHhQb3MgPiB0aGlzLmxvd2VyTGVmdENvcm5lci54UG9zICYmXG4gICAgICAgICAgICB4UG9zIDwgdGhpcy51cHBlclJpZ2h0Q29ybmVyLnlQb3MgJiZcbiAgICAgICAgICAgIHlQb3MgPiB0aGlzLmxvd2VyTGVmdENvcm5lci55UG9zICYmXG4gICAgICAgICAgICB5UG9zIDwgdGhpcy51cHBlclJpZ2h0Q29ybmVyLnlQb3MpO1xuICAgIH1cbn1cbmNsYXNzIFNoYXBlZENvbndheUdhbWVSdWxlIHtcbiAgICBjb25zdHJ1Y3RvcihzaGFwZSwgdmlld2VkX2NlbGxzLCBhbGl2ZV9nb2VzX3RvX25leHRfc3RhdGUgPSBbMiwgM10sIC8vIEZJWE1FIHN0YXRlIGludGlhbGlzYXRpb25cbiAgICBkZWFkX2dvZXNfdG9fbmV4dF9zdGF0ZSA9IFszXSkge1xuICAgICAgICB0aGlzLnNoYXBlID0gc2hhcGU7XG4gICAgICAgIHRoaXMudmlld2VkX2NlbGxfcG9zaXRpb25zID0gdmlld2VkX2NlbGxzO1xuICAgICAgICB0aGlzLmFsaXZlX2dvZXNfdG9fbmV4dF9zdGF0ZSA9IGFsaXZlX2dvZXNfdG9fbmV4dF9zdGF0ZTtcbiAgICAgICAgdGhpcy5kZWFkX2dvZXNfdG9fbmV4dF9zdGF0ZSA9IGRlYWRfZ29lc190b19uZXh0X3N0YXRlO1xuICAgICAgICB0aGlzLmxhc3RfY2VsbF93aGljaF9kaWVkID0gbnVsbDtcbiAgICB9XG4gICAgcnVsZUNhbkJlQXBwbGllZChwb3NpdGlvbikge1xuICAgICAgICBpZiAodGhpcy5zaGFwZSA9PSBudWxsIHx8ICh0aGlzLnNoYXBlICE9IG51bGwgJiYgIXRoaXMuc2hhcGUuaW5Cb3VuZHNQb3MocG9zaXRpb24pKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhcHBseVJ1bGVPblBvcyh4UG9zLCB5UG9zLCBjb253YXlHYW1lKSB7XG4gICAgICAgIGNvbnN0IGNlbGwgPSBjb253YXlHYW1lLmFjdGl2ZUZpZWxkLmdldF9jZWxsKHhQb3MsIHlQb3MpO1xuICAgICAgICBsZXQgcG9zaXRpb24gPSBjb253YXlHYW1lLmFjdGl2ZUZpZWxkLmJvcmRlcl9maXhlZF9ydWxlcyhuZXcgQ2VsbFBvc2l0aW9uKHhQb3MsIHlQb3MpKTtcbiAgICAgICAgaWYgKCF0aGlzLnJ1bGVDYW5CZUFwcGxpZWQocG9zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gY29ud2F5R2FtZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsaXZpbmdfbmVpZ2hib3VyX2NvdW50ID0gY29ud2F5R2FtZS5hY3RpdmVGaWVsZC5jZWxsX2xpdmluZ19uZWlnaGJvdXJzKHBvc2l0aW9uLnhQb3MsIHBvc2l0aW9uLnlQb3MsIHRoaXMudmlld2VkX2NlbGxfcG9zaXRpb25zKTtcbiAgICAgICAgY29uc3QgaXNfYWxpdmVfbmVpZ2hib3VyX2NvdW50ID0gdGhpcy5hbGl2ZV9nb2VzX3RvX25leHRfc3RhdGUuc29tZSgodmFsdWUpID0+IGxpdmluZ19uZWlnaGJvdXJfY291bnQgPT0gdmFsdWUpO1xuICAgICAgICBjb25zdCBpc19kZWFkX25laWdoYm91cl9jb3VudCA9IHRoaXMuZGVhZF9nb2VzX3RvX25leHRfc3RhdGUuc29tZSgodmFsdWUpID0+IGxpdmluZ19uZWlnaGJvdXJfY291bnQgPT0gdmFsdWUpO1xuICAgICAgICBsZXQgbmV4dENlbGwgPSBjb253YXlHYW1lLmluYWN0aXZlRmllbGQuZ2V0X2NlbGwocG9zaXRpb24ueFBvcywgcG9zaXRpb24ueVBvcyk7XG4gICAgICAgIGlmIChjZWxsLmlzQWxpdmUgJiYgaXNfYWxpdmVfbmVpZ2hib3VyX2NvdW50KSB7XG4gICAgICAgICAgICBuZXh0Q2VsbC5uZXh0U3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghY2VsbC5pc0FsaXZlICYmIGlzX2RlYWRfbmVpZ2hib3VyX2NvdW50KSB7XG4gICAgICAgICAgICBuZXh0Q2VsbC5uZXh0U3RhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjZWxsLmlzQWxpdmUpXG4gICAgICAgICAgICB0aGlzLmxhc3RfY2VsbF93aGljaF9kaWVkID0gbmV3IENlbGxQb3NpdGlvbihwb3NpdGlvbi54UG9zLCBwb3NpdGlvbi55UG9zKTtcbiAgICAgICAgcmV0dXJuIGNvbndheUdhbWU7XG4gICAgfVxuICAgIGdldElmTGFzdENlbGxLaWxsZWRBdFBvc2l0aW9uKCkge1xuICAgICAgICBsZXQgY2VsbCA9IHRoaXMubGFzdF9jZWxsX3doaWNoX2RpZWQ7XG4gICAgICAgIHRoaXMubGFzdF9jZWxsX3doaWNoX2RpZWQgPSBudWxsO1xuICAgICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG59XG5jbGFzcyBDb253YXlGaWVsZCB7XG4gICAgY29uc3RydWN0b3IocHhTaXplLCBweVNpemUsIGJvcmRlclJ1bGVzID0gXCJjdXRvZmZcIikge1xuICAgICAgICB0aGlzLnhTaXplID0gcHhTaXplO1xuICAgICAgICB0aGlzLnlTaXplID0gcHlTaXplO1xuICAgICAgICB0aGlzLmdhbWVGaWVsZCA9IHRoaXMuY3JlYXRlX2VtcHR5X2NvbndheXNfY2VsbF9hcnJheSgpO1xuICAgICAgICB0aGlzLmJvcmRlclJ1bGVzID0gYm9yZGVyUnVsZXM7XG4gICAgICAgIHRoaXMuX2xpdmluZ19jZWxsX2NvdW50ID0gMDtcbiAgICB9XG4gICAgY3JlYXRlX2VtcHR5X2NvbndheXNfY2VsbF9hcnJheSgpIHtcbiAgICAgICAgbGV0IGFyciA9IG5ldyBBcnJheSh0aGlzLnlTaXplKS5maWxsKGZhbHNlKS5tYXAoKCkgPT4gbmV3IEFycmF5KHRoaXMueFNpemUpLmZpbGwoZmFsc2UpKTtcbiAgICAgICAgcmV0dXJuIGFyci5tYXAoKHZlY3RvciwgaSwgYXJyKSA9PiB2ZWN0b3IubWFwKChlbCwgaSwgYXJyKSA9PiBuZXcgQm9vbGVhbkNlbGwoZmFsc2UpKSk7XG4gICAgfVxuICAgIGNsZWFyKCkge1xuICAgICAgICB0aGlzLmdhbWVGaWVsZCA9IHRoaXMuY3JlYXRlX2VtcHR5X2NvbndheXNfY2VsbF9hcnJheSgpO1xuICAgICAgICB0aGlzLl9saXZpbmdfY2VsbF9jb3VudCA9IDA7XG4gICAgfVxuICAgIGdldCBsaXZpbmdfY2VsbF9wZXJjZW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGl2aW5nX2NlbGxfY291bnQgLyAodGhpcy54U2l6ZSAqIHRoaXMueVNpemUpO1xuICAgIH1cbiAgICBjb3VudF9saXZpbmdfY2VsbHMoKSB7XG4gICAgICAgIGZvciAobGV0IGluZGV4WCA9IDA7IGluZGV4WCA8IHRoaXMueFNpemU7IGluZGV4WCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleFkgPSAwOyBpbmRleFkgPCB0aGlzLnlTaXplOyBpbmRleFkrKykge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdldF9jZWxsKGluZGV4WCwgaW5kZXhZKS5pc0FsaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xpdmluZ19jZWxsX2NvdW50ICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGdldF9jZWxsKHhQb3MsIHlQb3MpIHtcbiAgICAgICAgbGV0IGNlbGxQb3MgPSB0aGlzLmJvcmRlcl9maXhlZF9ydWxlcyhuZXcgQ2VsbFBvc2l0aW9uKHhQb3MsIHlQb3MpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUZpZWxkW2NlbGxQb3MueVBvc11bY2VsbFBvcy54UG9zXTtcbiAgICB9XG4gICAgc2V0X2NlbGwoeFBvcywgeVBvcywgdmFsdWUpIHtcbiAgICAgICAgbGV0IGNlbGxQb3MgPSB0aGlzLmJvcmRlcl9maXhlZF9ydWxlcyhuZXcgQ2VsbFBvc2l0aW9uKHhQb3MsIHlQb3MpKTtcbiAgICAgICAgaWYgKHZhbHVlLmlzQWxpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuX2xpdmluZ19jZWxsX2NvdW50ICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nYW1lRmllbGRbY2VsbFBvcy55UG9zXVtjZWxsUG9zLnhQb3NdID0gdmFsdWU7XG4gICAgfVxuICAgIGJvcmRlcl9maXhlZF9ydWxlcyhwb3MpIHtcbiAgICAgICAgbGV0IHhQb3NGaXhlZCA9IHBvcy54UG9zO1xuICAgICAgICBsZXQgeVBvc0ZpeGVkID0gcG9zLnlQb3M7XG4gICAgICAgIGlmICh0aGlzLmJvcmRlclJ1bGVzID09IFwiY3V0b2ZmXCIpIHtcbiAgICAgICAgICAgIGlmIChwb3MueFBvcyA+IHRoaXMueFNpemUpIHtcbiAgICAgICAgICAgICAgICB4UG9zRml4ZWQgPSB0aGlzLnhTaXplIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3MueVBvcyA+IHRoaXMueVNpemUpIHtcbiAgICAgICAgICAgICAgICB5UG9zRml4ZWQgPSB0aGlzLnlTaXplIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwb3MueVBvcyA8IDApIHtcbiAgICAgICAgICAgICAgICB5UG9zRml4ZWQgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvcy54UG9zIDwgMCkge1xuICAgICAgICAgICAgICAgIHhQb3NGaXhlZCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcG9zO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MueFBvcyA+PSB0aGlzLnhTaXplKSB7XG4gICAgICAgICAgICB4UG9zRml4ZWQgPSBwb3MueFBvcyAlIHRoaXMueFNpemU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcy54UG9zIDwgMCkge1xuICAgICAgICAgICAgeFBvc0ZpeGVkID0gKHBvcy54UG9zICUgdGhpcy54U2l6ZSkgKiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zLnlQb3MgPj0gdGhpcy55U2l6ZSkge1xuICAgICAgICAgICAgeVBvc0ZpeGVkID0gcG9zLnlQb3MgJSB0aGlzLnlTaXplO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MueVBvcyA8IDApIHtcbiAgICAgICAgICAgIHlQb3NGaXhlZCA9IChwb3MueVBvcyAlIHRoaXMueVNpemUpICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBDZWxsUG9zaXRpb24oeFBvc0ZpeGVkLCB5UG9zRml4ZWQpO1xuICAgIH1cbiAgICBjZWxsX2xpdmluZ19uZWlnaGJvdXJzKGluZGV4WCwgaW5kZXhZLCBsb29raW5nQXQpIHtcbiAgICAgICAgbGV0IGNvdW50ID0gMDtcbiAgICAgICAgbG9va2luZ0F0LmZvckVhY2goKGxpc3QsIHZhbCwgYXJyKSA9PiB7XG4gICAgICAgICAgICBsZXQgeDEgPSBsaXN0LnhQb3NpdGlvbjtcbiAgICAgICAgICAgIGxldCB5MSA9IGxpc3QueVBvc2l0aW9uO1xuICAgICAgICAgICAgbGV0IGEgPSBpbmRleFggKyB4MTtcbiAgICAgICAgICAgIGxldCBiID0gaW5kZXhZICsgeTE7XG4gICAgICAgICAgICBpZiAodGhpcy5pbl9maWVsZChhLCBiKSAmJiB0aGlzLmdldF9jZWxsKGEsIGIpLmlzQWxpdmUpIHtcbiAgICAgICAgICAgICAgICBjb3VudCArPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNvdW50O1xuICAgIH1cbiAgICBpbl9maWVsZChpbmRleFgsIGluZGV4WSkge1xuICAgICAgICBpZiAodGhpcy5ib3JkZXJSdWxlcyA9PSBcImV4dGVuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgaW5GaWVsZCA9IGluZGV4WCA+IDAgJiYgaW5kZXhZID4gMCAmJiBpbmRleFggPCB0aGlzLnhTaXplICYmIGluZGV4WSA8IHRoaXMueVNpemU7XG4gICAgICAgIHJldHVybiBpbkZpZWxkO1xuICAgIH1cbn1cbmNsYXNzIENvbndheUdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHB4U2l6ZSwgcHlTaXplLCBjZWxscywgcnVsZXMsIGZhbGxiYWNrUnVsZSA9IG51bGwsIGJvcmRlclJ1bGVzID0gXCJjdXRvZmZcIikge1xuICAgICAgICB0aGlzLnhTaXplID0gcHhTaXplO1xuICAgICAgICB0aGlzLnlTaXplID0gcHlTaXplO1xuICAgICAgICB0aGlzLmJvcmRlclJ1bGVzID0gYm9yZGVyUnVsZXM7XG4gICAgICAgIGlmIChjZWxscyA9PSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRHYW1lRmllbGQgPSB0aGlzLmNyZWF0ZUdhbWVGaWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50R2FtZUZpZWxkID0gY2VsbHM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sYXN0R2FtZUZpZWxkID0gdGhpcy5jcmVhdGVHYW1lRmllbGQoKTtcbiAgICAgICAgdGhpcy5hY3RpdmVHYW1lRmllbGRLaW5kID0gXCJjdXJyZW50XCI7XG4gICAgICAgIHRoaXMuZmFsbGJhY2tSdWxlID0gZmFsbGJhY2tSdWxlO1xuICAgICAgICB0aGlzLnBvc2l0aW9uYWxfcnVsZXMgPSBydWxlcztcbiAgICAgICAgdGhpcy5sYXN0U3RlcERpZWRDZWxscyA9IFtdO1xuICAgIH1cbiAgICBjbGVhcl9maWVsZCgpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVGaWVsZC5jbGVhcigpO1xuICAgIH1cbiAgICBjcmVhdGVHYW1lRmllbGQoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ29ud2F5RmllbGQodGhpcy54U2l6ZSwgdGhpcy55U2l6ZSwgdGhpcy5ib3JkZXJSdWxlcyk7XG4gICAgfVxuICAgIGdldCBsaXZpbmdfY2VsbF9jb3VudCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGl2aW5nX2NlbGxfY291bnQ7XG4gICAgfVxuICAgIGdldCBhY3RpdmVGaWVsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlR2FtZUZpZWxkS2luZCA9PSBcImN1cnJlbnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudEdhbWVGaWVsZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3RHYW1lRmllbGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IGluYWN0aXZlRmllbGQoKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUdhbWVGaWVsZEtpbmQgPT0gXCJjdXJyZW50XCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxhc3RHYW1lRmllbGQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUZpZWxkO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldE9uQWN0aXZlRmllbGQoeFBvcywgeVBvcywgY2VsbCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUZpZWxkLnNldF9jZWxsKHhQb3MsIHlQb3MsIGNlbGwpO1xuICAgIH1cbiAgICBnZXRDdXJyZW50Q2VsbCh4UG9zLCB5UG9zKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZUZpZWxkLmdldF9jZWxsKHhQb3MsIHlQb3MpO1xuICAgIH1cbiAgICBuZXh0U3RhdGUoKSB7XG4gICAgICAgIHRoaXMubGFzdFN0ZXBEaWVkQ2VsbHMgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaW5kZXhYID0gMDsgaW5kZXhYIDwgdGhpcy54U2l6ZTsgaW5kZXhYKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4WSA9IDA7IGluZGV4WSA8IHRoaXMueVNpemU7IGluZGV4WSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmFjdGl2ZUZpZWxkLmdldF9jZWxsKGluZGV4WCwgaW5kZXhZKS5yZXNldCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucG9zaXRpb25hbF9ydWxlcy5mb3JFYWNoKChydWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gZHJ5IHRoaXNcbiAgICAgICAgICAgICAgICAgICAgcnVsZS5hcHBseVJ1bGVPblBvcyhpbmRleFgsIGluZGV4WSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvcHRpb25hbF9jZWxsID0gcnVsZS5nZXRJZkxhc3RDZWxsS2lsbGVkQXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob3B0aW9uYWxfY2VsbCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RTdGVwRGllZENlbGxzLnB1c2gob3B0aW9uYWxfY2VsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mYWxsYmFja1J1bGVTaG91bGRCZUFwcGxpZWQoaW5kZXhYLCBpbmRleFkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFsbGJhY2tSdWxlLmFwcGx5UnVsZU9uUG9zKGluZGV4WCwgaW5kZXhZLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbmFsX2NlbGwgPSAodGhpcy5mYWxsYmFja1J1bGUpLmdldElmTGFzdENlbGxLaWxsZWRBdFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25hbF9jZWxsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFN0ZXBEaWVkQ2VsbHMucHVzaChvcHRpb25hbF9jZWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN3aXRjaEFjdGl2ZUdhbWVGaWVsZCgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZmFsbGJhY2tSdWxlU2hvdWxkQmVBcHBsaWVkKGluZGV4WCwgaW5kZXhZKSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uYWxSdWxlc0FwcGxpY2FibGUgPSB0aGlzLnBvc2l0aW9uYWxfcnVsZXMuc29tZSgocnVsZSwgaSwgYXJyKSA9PiBydWxlLnJ1bGVDYW5CZUFwcGxpZWQobmV3IENlbGxQb3NpdGlvbihpbmRleFgsIGluZGV4WSkpKTtcbiAgICAgICAgcmV0dXJuICFwb3NpdGlvbmFsUnVsZXNBcHBsaWNhYmxlICYmIHRoaXMuZmFsbGJhY2tSdWxlICE9IG51bGw7XG4gICAgfVxuICAgIHN3aXRjaEFjdGl2ZUdhbWVGaWVsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlR2FtZUZpZWxkS2luZCA9PSBcImxhc3RcIikge1xuICAgICAgICAgICAgdGhpcy5hY3RpdmVHYW1lRmllbGRLaW5kID0gXCJjdXJyZW50XCI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUdhbWVGaWVsZEtpbmQgPSBcImxhc3RcIjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRMYXN0U3RlcERpZWRDZWxsUG9zaXRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0U3RlcERpZWRDZWxscztcbiAgICB9XG59XG5jbGFzcyBSZXNldEdhbWVSdWxlIHtcbiAgICBjb25zdHJ1Y3RvcihyZXNldF9wZXJjZW50LCByZXBsYWNpbmdfZmFjdG9yeSkge1xuICAgICAgICB0aGlzLnJlc2V0X3BlcmNlbnQgPSByZXNldF9wZXJjZW50O1xuICAgICAgICB0aGlzLmVkaXRpbmdfY29ud2F5X2ZhY3RvcnkgPSByZXBsYWNpbmdfZmFjdG9yeTtcbiAgICB9XG4gICAgbmV4dEdhbWVXaXRoUnVsZShjb253YXlHYW1lKSB7XG4gICAgICAgIGlmIChjb253YXlHYW1lLmFjdGl2ZUZpZWxkLmxpdmluZ19jZWxsX3BlcmNlbnQgPiB0aGlzLnJlc2V0X3BlcmNlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdGluZ19jb253YXlfZmFjdG9yeS5jaXJjbGUoNSwgMSwgdW5kZWZpbmVkLCBjb253YXlHYW1lKTsgLy8gVE9ETyBtYWtlIGNyZWF0aW9uIGZ1bmN0aW9uIHRha2UgYW4gb2JqZWN0XG4gICAgICAgIH1cbiAgICB9XG59XG5jbGFzcyBDb253YXlHYW1lQWR2YW5jZXIgZXh0ZW5kcyBDb253YXlHYW1lIHtcbiAgICBjb25zdHJ1Y3RvcihweFNpemUsIHB5U2l6ZSwgY2VsbHMsIHJ1bGVzLCBmYWxsYmFja1J1bGUgPSBudWxsLCBib3JkZXJSdWxlcyA9IFwiY3V0b2ZmXCIsIGdlbmVyYWxSdWxlcykge1xuICAgICAgICBzdXBlcihweFNpemUsIHB5U2l6ZSwgY2VsbHMsIHJ1bGVzLCBmYWxsYmFja1J1bGUsIGJvcmRlclJ1bGVzKTtcbiAgICAgICAgdGhpcy5nZW5lcmFsUnVsZXMgPSBnZW5lcmFsUnVsZXM7XG4gICAgfVxuICAgIHN0YXRpYyBmcm9tQ29ud2F5R2FtZShjb253YXlHYW1lLCBnZW5lcmFsUnVsZXMgPSBudWxsKSB7XG4gICAgICAgIGxldCBnZW5lcmFsUiA9IGdlbmVyYWxSdWxlcyAhPT0gbnVsbCAmJiBnZW5lcmFsUnVsZXMgIT09IHZvaWQgMCA/IGdlbmVyYWxSdWxlcyA6IFtdO1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMoY29ud2F5R2FtZS54U2l6ZSwgY29ud2F5R2FtZS55U2l6ZSwgY29ud2F5R2FtZS5hY3RpdmVGaWVsZCwgY29ud2F5R2FtZS5wb3NpdGlvbmFsX3J1bGVzLCBjb253YXlHYW1lLmZhbGxiYWNrUnVsZSwgY29ud2F5R2FtZS5ib3JkZXJSdWxlcywgZ2VuZXJhbFIpO1xuICAgIH1cbiAgICBuZXh0U3RhdGUoKSB7XG4gICAgICAgIGZvciAoY29uc3QgcnVsZSBvZiB0aGlzLmdlbmVyYWxSdWxlcykge1xuICAgICAgICAgICAgcnVsZS5uZXh0R2FtZVdpdGhSdWxlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLm5leHRTdGF0ZSgpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYWRkUGF0aChwb3MpIHtcbiAgICAgICAgbGV0IHBhdGggPSB0aGlzLmNhbGNQYXRoKHBvcyk7XG4gICAgICAgIGZvciAoY29uc3QgcG9zaXRpb24gb2YgcGF0aCkge1xuICAgICAgICAgICAgdGhpcy5nZXRDdXJyZW50Q2VsbChwb3NpdGlvbi54UG9zLCBwb3NpdGlvbi55UG9zKS5uZXh0U3RhdGUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWxjUGF0aChwb3MpIHtcbiAgICAgICAgbGV0IHJlc3VsdFBhdGggPSBuZXcgU2V0KCk7XG4gICAgICAgIGNvbnN0IHhTdGFydCA9IE1hdGgucm91bmQocG9zLnN0YXJ0UG9zLnhQb3MpO1xuICAgICAgICBjb25zdCB5U3RhcnQgPSBNYXRoLnJvdW5kKHBvcy5zdGFydFBvcy55UG9zKTtcbiAgICAgICAgY29uc3QgeEVuZCA9IE1hdGgucm91bmQocG9zLmVuZFBvcy54UG9zKTtcbiAgICAgICAgY29uc3QgeUVuZCA9IE1hdGgucm91bmQocG9zLmVuZFBvcy55UG9zKTtcbiAgICAgICAgY29uc3QgeURpZiA9IHlFbmQgLSB5U3RhcnQ7XG4gICAgICAgIGNvbnN0IHhEaWYgPSB4RW5kIC0geFN0YXJ0O1xuICAgICAgICBsZXQgeE9mZnNldCA9IDA7XG4gICAgICAgIGxldCB5T2Zmc2V0ID0gMDtcbiAgICAgICAgaWYgKHhEaWYgPT0gMCkge1xuICAgICAgICAgICAgZm9yIChsZXQgY3VyeURpZiA9IDA7IGN1cnlEaWYgPD0gTWF0aC5hYnMoeURpZik7IGN1cnlEaWYrKykge1xuICAgICAgICAgICAgICAgIHJlc3VsdFBhdGguYWRkKG5ldyBDZWxsUG9zaXRpb24oTWF0aC5yb3VuZCh4U3RhcnQpLCBNYXRoLnJvdW5kKHlTdGFydCArIGN1cnlEaWYpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoeURpZiA9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjdXJ4RGlmID0gMDsgY3VyeERpZiA8PSBNYXRoLmFicyh4RGlmKTsgY3VyeERpZisrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0UGF0aC5hZGQobmV3IENlbGxQb3NpdGlvbihNYXRoLnJvdW5kKHhTdGFydCArIGN1cnhEaWYpLCBNYXRoLnJvdW5kKHlTdGFydCkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50RGlzdGFuY2UgPSBNYXRoLnNxcnQoTWF0aC5wb3coeERpZiwgMikgKyBNYXRoLnBvdyh5RGlmLCAyKSk7XG4gICAgICAgICAgICBsZXQgbSA9IHlEaWYgLyB4RGlmO1xuICAgICAgICAgICAgbGV0IHhQb3MgPSAwO1xuICAgICAgICAgICAgaWYgKG0gPiAwKSB7XG4gICAgICAgICAgICAgICAgeFBvcyA9IE1hdGgubWluKHhTdGFydCwgeEVuZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB4UG9zID0gTWF0aC5tYXgoeFN0YXJ0LCB4RW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBiID0geUVuZCAtIG0gKiB4RW5kO1xuICAgICAgICAgICAgZm9yIChsZXQgY3VyRGlzdCA9IDA7IGN1ckRpc3QgPCBwb2ludERpc3RhbmNlIC8gTWF0aC5hYnMobSkgLSBNYXRoLmFicyhtKTsgY3VyRGlzdCArPSAxKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0UGF0aC5hZGQobmV3IENlbGxQb3NpdGlvbihNYXRoLnJvdW5kKHhQb3MpLCBNYXRoLnJvdW5kKG0gKiB4UG9zICsgYikpKTtcbiAgICAgICAgICAgICAgICB4UG9zICs9IG07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIEFycmF5Lm9mKC4uLnJlc3VsdFBhdGgua2V5cygpKTtcbiAgICB9XG59XG5jbGFzcyBDb253YXlHYW1lRmFjdG9yeSB7XG4gICAgY29uc3RydWN0b3IoeFNpemUsIHlTaXplLCBydWxlcywgYWxpdmVDZWxsU3RhdGUsIGZhbGxiYWNrUnVsZSA9IG51bGwsIGJvcmRlclJ1bGVzID0gXCJjdXRvZmZcIikge1xuICAgICAgICB0aGlzLnhTaXplID0geFNpemU7XG4gICAgICAgIHRoaXMueVNpemUgPSB5U2l6ZTtcbiAgICAgICAgdGhpcy5ydWxlcyA9IHJ1bGVzO1xuICAgICAgICB0aGlzLmJvcmRlclJ1bGVzID0gYm9yZGVyUnVsZXM7XG4gICAgICAgIHRoaXMuYWxpdmVDZWxsU3RhdGUgPSBhbGl2ZUNlbGxTdGF0ZTtcbiAgICAgICAgdGhpcy5mYWxsYmFja1J1bGUgPSBmYWxsYmFja1J1bGU7XG4gICAgfVxuICAgIGNlbnRlcmVkZlBlbnRvbWlubyhjb253YXlfZ2FtZSkge1xuICAgICAgICBpZiAodGhpcy54U2l6ZSA8IDMgJiYgdGhpcy55U2l6ZSA8IDMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW5ub3QgY3JlYXRlIGEgUGVudG9taW5vIGluIGEgZmllbGQgc21hbGxlciB0aGFuIDMgdGltZXMgM1wiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmdldF9jZW50ZXIoKTtcbiAgICAgICAgaWYgKGNvbndheV9nYW1lID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUgPSB0aGlzLmNyZWF0ZV9jb253YXlfZ2FtZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUuY2xlYXJfZmllbGQoKTtcbiAgICAgICAgfVxuICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKHBvcy54UG9zLCBwb3MueVBvcywgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgY29ud2F5X2dhbWUuc2V0T25BY3RpdmVGaWVsZChwb3MueFBvcywgcG9zLnlQb3MgKyAxLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKHBvcy54UG9zLCBwb3MueVBvcyAtIDEsIG5ldyBCb29sZWFuQ2VsbCh0aGlzLmFsaXZlQ2VsbFN0YXRlKSk7XG4gICAgICAgIGNvbndheV9nYW1lLnNldE9uQWN0aXZlRmllbGQocG9zLnhQb3MgLSAxLCBwb3MueVBvcywgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgY29ud2F5X2dhbWUuc2V0T25BY3RpdmVGaWVsZChwb3MueFBvcyArIDEsIHBvcy55UG9zICsgMSwgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgcmV0dXJuIGNvbndheV9nYW1lO1xuICAgIH1cbiAgICBjcmVhdGVfY29ud2F5X2dhbWUoKSB7XG4gICAgICAgIGxldCBjb253YXlfZ2FtZSA9IG5ldyBDb253YXlHYW1lKHRoaXMueFNpemUsIHRoaXMueVNpemUsIG51bGwsIHRoaXMucnVsZXMsIHRoaXMuZmFsbGJhY2tSdWxlLCB0aGlzLmJvcmRlclJ1bGVzKTtcbiAgICAgICAgcmV0dXJuIGNvbndheV9nYW1lO1xuICAgIH1cbiAgICBjaXJjbGUocmFkaXVzLCBzdGVwcyA9IDEgLyAoMiAqIE1hdGguUEkpLCBvZmZzZXRzID0gdW5kZWZpbmVkLCBjb253YXlfZ2FtZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBUT0RPIGZpeCB0eXBlICsgdXNlXG4gICAgICAgIGxldCBwb3MgPSB0aGlzLmdldF9jZW50ZXIoKTtcbiAgICAgICAgb2Zmc2V0cyA9IG9mZnNldHMgIT09IG51bGwgJiYgb2Zmc2V0cyAhPT0gdm9pZCAwID8gb2Zmc2V0cyA6IFtuZXcgQ2VsbFBvc2l0aW9uKDAsIDApXTtcbiAgICAgICAgaWYgKGNvbndheV9nYW1lID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUgPSB0aGlzLmNyZWF0ZV9jb253YXlfZ2FtZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUuY2xlYXJfZmllbGQoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IG9mZnNldCBvZiBvZmZzZXRzKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGNhbGMgb3ZlcmxhcCBvZiBzaGFwZWRcbiAgICAgICAgICAgIGZvciAobGV0IHJhZGl1c0luYyA9IDA7IHJhZGl1c0luYyA8IHJhZGl1czsgcmFkaXVzSW5jKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zVG9Sb3RhdGUgPSBuZXcgQ2VsbFBvc2l0aW9uKDAsIHJhZGl1c0luYyk7XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgYW5nbGUgPSAwOyBhbmdsZSA8IDIgKiBNYXRoLlBJOyBhbmdsZSArPSBzdGVwcykge1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3WFBvcyA9IHBvcy54UG9zIC1cbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQocG9zVG9Sb3RhdGUueFBvcyAqIE1hdGguY29zKGFuZ2xlKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zVG9Sb3RhdGUueVBvcyAqIC0xICogTWF0aC5zaW4oYW5nbGUpKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG5ld1lQb3MgPSBwb3MueVBvcyArXG4gICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKHBvc1RvUm90YXRlLnhQb3MgKiBNYXRoLnNpbihhbmdsZSkgKyBwb3NUb1JvdGF0ZS55UG9zICogTWF0aC5jb3MoYW5nbGUpKTsgLy8gVE9ETyBtb3ZlIHBvcyBjYWxjdWxhdGlvbiBvdXRcbiAgICAgICAgICAgICAgICAgICAgY29ud2F5X2dhbWUuc2V0T25BY3RpdmVGaWVsZChuZXdYUG9zICsgb2Zmc2V0LnhQb3MsIG5ld1lQb3MgKyBvZmZzZXQueVBvcywgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbndheV9nYW1lO1xuICAgIH1cbiAgICB5bGluZShsZW5ndGgsIGNvbndheV9nYW1lID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGxldCBjZW50ZXIgPSB0aGlzLmdldF9jZW50ZXIoKTtcbiAgICAgICAgaWYgKGNvbndheV9nYW1lID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUgPSB0aGlzLmNyZWF0ZV9jb253YXlfZ2FtZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29ud2F5X2dhbWUuY2xlYXJfZmllbGQoKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGxldCBjdXJMZW5ndGggPSAwOyBjdXJMZW5ndGggPCBsZW5ndGg7IGN1ckxlbmd0aCsrKSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKGNlbnRlci54UG9zLCBjZW50ZXIueVBvcyArIGN1ckxlbmd0aCwgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ud2F5X2dhbWU7XG4gICAgfVxuICAgIGdldF9jZW50ZXIoKSB7XG4gICAgICAgIGxldCBtaWRkbGVYID0gTWF0aC5jZWlsKHRoaXMueFNpemUgLyAyKTtcbiAgICAgICAgbGV0IG1pZGRsZVkgPSBNYXRoLmNlaWwodGhpcy55U2l6ZSAvIDIpO1xuICAgICAgICByZXR1cm4gbmV3IENlbGxQb3NpdGlvbihtaWRkbGVYLCBtaWRkbGVZKTtcbiAgICB9XG4gICAgcmFuZG9taXplX2NlbGxzKGFsaXZlX2Fib3ZlID0gMywgc2NhbGVfcmFuZCA9IDEwLCBjb253YXlfZ2FtZSA9IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoY29ud2F5X2dhbWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZSA9IHRoaXMuY3JlYXRlX2NvbndheV9nYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZS5jbGVhcl9maWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGluZGV4WCA9IDA7IGluZGV4WCA8IHRoaXMueFNpemU7IGluZGV4WCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleFkgPSAwOyBpbmRleFkgPCB0aGlzLnlTaXplOyBpbmRleFkrKykge1xuICAgICAgICAgICAgICAgIGxldCByYW5kX3ZhbCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIHNjYWxlX3JhbmQpO1xuICAgICAgICAgICAgICAgIGlmIChyYW5kX3ZhbCA+PSBhbGl2ZV9hYm92ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKGluZGV4WCwgaW5kZXhZLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ud2F5X2dhbWU7XG4gICAgfVxufVxuY2xhc3MgQ2VsbENvbG9yIHtcbiAgICBjb25zdHJ1Y3RvcihyLCBnLCBiLCBhKSB7XG4gICAgICAgIHRoaXMuciA9IHI7XG4gICAgICAgIHRoaXMuZyA9IGc7XG4gICAgICAgIHRoaXMuYiA9IGI7XG4gICAgICAgIHRoaXMuYSA9IGE7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgQkxBQ0soKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2VsbENvbG9yKDAsIDAsIDAsIDEpO1xuICAgIH1cbiAgICBzdGF0aWMgZ2V0IFdISVRFKCkge1xuICAgICAgICByZXR1cm4gbmV3IENlbGxDb2xvcigyNTUsIDI1NSwgMjU1LCAxKTtcbiAgICB9XG4gICAgZ2V0IGRhdGEoKSB7XG4gICAgICAgIHJldHVybiBbdGhpcy5yLCB0aGlzLmcsIHRoaXMuYiwgdGhpcy5hXTtcbiAgICB9XG4gICAgZ2V0IHJnYmFfc3RyKCkge1xuICAgICAgICByZXR1cm4gXCJyZ2JhKFwiICsgdGhpcy5yICsgXCIsXCIgKyB0aGlzLmcgKyBcIixcIiArIHRoaXMuYiArIFwiLFwiICsgdGhpcy5hICsgXCIpXCI7XG4gICAgfVxuICAgIGNsb25lKCkge1xuICAgICAgICByZXR1cm4gbmV3IENlbGxDb2xvcih0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmEpO1xuICAgIH1cbn1cbmNsYXNzIEZhZGluZ0NlbGxDb2xvciBleHRlbmRzIENlbGxDb2xvciB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnRfcmVwciwgZmFkZV9zdHJlbmd0aCA9IDAuOCkge1xuICAgICAgICBjb25zdCBkYXRhID0gc3RhcnRfcmVwci5kYXRhO1xuICAgICAgICBzdXBlcihkYXRhWzBdLCBkYXRhWzFdLCBkYXRhWzJdLCBkYXRhWzNdKTtcbiAgICAgICAgdGhpcy5zdGFydF9yZXByID0gc3RhcnRfcmVwcjtcbiAgICAgICAgdGhpcy5jb2xvcl9mYWRlX2ZhY3RvciA9IGZhZGVfc3RyZW5ndGg7XG4gICAgfVxuICAgIGZhZGUodGltZXMpIHtcbiAgICAgICAgdGhpcy5yID0gdGhpcy5yICogdGhpcy5jb2xvcl9mYWRlX2ZhY3RvciAqIHRpbWVzO1xuICAgICAgICB0aGlzLmcgPSB0aGlzLmcgKiB0aGlzLmNvbG9yX2ZhZGVfZmFjdG9yICogdGltZXM7XG4gICAgICAgIHRoaXMuYiA9IHRoaXMuYiAqIHRoaXMuY29sb3JfZmFkZV9mYWN0b3IgKiB0aW1lcztcbiAgICB9XG59XG5jbGFzcyBDb253YXlHYW1lUmVwcmVzZW50ZXIge1xuICAgIGNvbnN0cnVjdG9yKGNvbndheV9nYW1lLCBjb25maWcpIHtcbiAgICAgICAgdGhpcy5kZWZhdWx0X2NlbGxfYWxpdmVfcmVwciA9IFwi8J+fqVwiO1xuICAgICAgICB0aGlzLmRlZmF1bHRfY2VsbF9kZWFkX3JlcHIgPSBcIuKsnFwiO1xuICAgICAgICB0aGlzLmNvbndheV9nYW1lID0gY29ud2F5X2dhbWU7XG4gICAgICAgIHRoaXMuY2VsbF9yZXByX2FsaXZlID0gY29uZmlnLmFsaXZlX2NlbGxfcmVwcjtcbiAgICAgICAgdGhpcy5jZWxsX3JlcHJfZGVhZCA9IGNvbmZpZy5kZWFkX2NlbGxfcmVwcjtcbiAgICAgICAgdGhpcy5jZWxsX3JlcHJfdHJhbnNwYXJlbnQgPSBuZXcgQ2VsbENvbG9yKDAsIDAsIDAsIDApO1xuICAgIH1cbiAgICByZXByZXNlbnRhdGlvbihjZWxsKSB7XG4gICAgICAgIGlmIChjZWxsLmlzQWxpdmUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRfY2VsbF9hbGl2ZV9yZXByO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRlZmF1bHRfY2VsbF9kZWFkX3JlcHI7XG4gICAgfVxuICAgIHN0cl9maWVsZCgpIHtcbiAgICAgICAgbGV0IHJlc3VsdF9zdHIgPSBcIlwiO1xuICAgICAgICBmb3IgKGxldCBpbmRleFggPSAwOyBpbmRleFggPCB0aGlzLmNvbndheV9nYW1lLnhTaXplOyBpbmRleFgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXhZID0gMDsgaW5kZXhZIDwgdGhpcy5jb253YXlfZ2FtZS55U2l6ZTsgaW5kZXhZKyspIHtcbiAgICAgICAgICAgICAgICBsZXQgY2VsbCA9IHRoaXMuY29ud2F5X2dhbWUuZ2V0Q3VycmVudENlbGwoaW5kZXhYLCBpbmRleFkpO1xuICAgICAgICAgICAgICAgIHJlc3VsdF9zdHIgKz0gdGhpcy5yZXByZXNlbnRhdGlvbihjZWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdF9zdHIgKz0gXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0X3N0cjtcbiAgICB9XG4gICAgYXNfbnVtYmVyX2NvbG9yc19hcnIoKSB7XG4gICAgICAgIGxldCByZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5jb253YXlfZ2FtZS54U2l6ZSAqIHRoaXMuY29ud2F5X2dhbWUueVNpemUpLmZpbGwodGhpcy5jZWxsX3JlcHJfdHJhbnNwYXJlbnQpO1xuICAgICAgICBmb3IgKGxldCBpbmRleFggPSAwOyBpbmRleFggPCB0aGlzLmNvbndheV9nYW1lLnhTaXplOyBpbmRleFgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXhZID0gMDsgaW5kZXhZIDwgdGhpcy5jb253YXlfZ2FtZS55U2l6ZTsgaW5kZXhZKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjZWxsID0gdGhpcy5jb253YXlfZ2FtZS5nZXRDdXJyZW50Q2VsbChpbmRleFgsIGluZGV4WSk7XG4gICAgICAgICAgICAgICAgbGV0IG9uZV9kaW1faW5kID0gaW5kZXhYICsgaW5kZXhZICogdGhpcy5jb253YXlfZ2FtZS54U2l6ZTtcbiAgICAgICAgICAgICAgICByZXN1bHRbb25lX2RpbV9pbmRdID0gY2VsbC5pc0FsaXZlID8gdGhpcy5jZWxsX3JlcHJfYWxpdmUgOiB0aGlzLmNlbGxfcmVwcl9kZWFkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICAgIG51bWJlcl9jb2xvcl9hcnIoaW5kZXhYLCBpbmRleFkpIHtcbiAgICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY29ud2F5X2dhbWUuZ2V0Q3VycmVudENlbGwoaW5kZXhYLCBpbmRleFkpO1xuICAgICAgICByZXR1cm4gY2VsbC5pc0FsaXZlID8gdGhpcy5jZWxsX3JlcHJfYWxpdmUgOiB0aGlzLmNlbGxfcmVwcl9kZWFkO1xuICAgIH1cbn1cbmNsYXNzIEFnaW5nQ2VsbFJlcHIge1xuICAgIGNvbnN0cnVjdG9yKHBvc2l0aW9uLCBzdGFydExpZmUsIHN0YXJ0X2NlbGxfcmVwcikge1xuICAgICAgICB0aGlzLnBvc2l0aW9uID0gcG9zaXRpb247XG4gICAgICAgIHRoaXMuY3VycmVudF9saWZlID0gc3RhcnRMaWZlO1xuICAgICAgICB0aGlzLnN0YXJ0X2xpZmUgPSBzdGFydExpZmU7XG4gICAgICAgIHRoaXMuZmFkaW5nX2NlbGxfY29sb3IgPSBuZXcgRmFkaW5nQ2VsbENvbG9yKHN0YXJ0X2NlbGxfcmVwcik7XG4gICAgfVxuICAgIGdldCBjb21wbGV0ZWx5RmFkZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRfbGlmZSA8PSAwO1xuICAgIH1cbiAgICBnZXQgaXNBZ2VkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFydF9saWZlICE9IHRoaXMuY3VycmVudF9saWZlO1xuICAgIH1cbiAgICBhZ2UoKSB7XG4gICAgICAgIHRoaXMuY3VycmVudF9saWZlIC09IDE7XG4gICAgICAgIHRoaXMuZmFkaW5nX2NlbGxfY29sb3IuZmFkZSgxKTtcbiAgICB9XG4gICAgZ2V0X2ZhZGVkX3JlcHIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZhZGluZ19jZWxsX2NvbG9yO1xuICAgIH1cbn1cbmNsYXNzIENvbndheUhUTUxEaXNwbGF5ZXIge1xuICAgIGNvbnN0cnVjdG9yKGNhbnZhcywgY29uZmlnLCBuZXh0Q2FudmFzQml0TWFwID0gbnVsbCwgcHJlUmVuZGVyQ2FudmFzID0gbnVsbCwgYml0bWFwQ29udGV4dCA9IG51bGwpIHtcbiAgICAgICAgdGhpcy5uZXh0Q2FudmFzQml0TWFwID0gbnVsbDtcbiAgICAgICAgdGhpcy5wcmVSZW5kZXJDYW52YXMgPSBudWxsO1xuICAgICAgICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgICAgIHRoaXMucG9zVG9DZWxsV2l0aFZpc3VhbFRyYWlsID0gbmV3IE1hcCgpO1xuICAgICAgICBpZiAoY2FudmFzICE9IHVuZGVmaW5lZCAmJiBwcmVSZW5kZXJDYW52YXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5iaXRtYXBDb250ZXh0ID0gKHRoaXMuY2FudmFzLmdldENvbnRleHQoXCJiaXRtYXByZW5kZXJlclwiKSk7XG4gICAgICAgICAgICB0aGlzLm5leHRDYW52YXNCaXRNYXAgPSBuZXh0Q2FudmFzQml0TWFwO1xuICAgICAgICAgICAgdGhpcy5wcmVSZW5kZXJDYW52YXMgPSBwcmVSZW5kZXJDYW52YXM7XG4gICAgICAgICAgICBsZXQgY29udGV4dCA9IHRoaXMucHJlUmVuZGVyQ2FudmFzLmdldENvbnRleHQoXCIyZFwiLCB7IGFscGhhOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGlmIChjb250ZXh0ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZVJlbmRlckNvbnRleHQgPSBjb250ZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaGFuZGxlQ29uZmlnVXBkYXRlKCk7XG4gICAgICAgIHRoaXMuY29uc3VtZVVwZGF0ZXMoKTtcbiAgICB9XG4gICAgYWRkVmlzdWFsVHJhaWxDZWxsc0FuZEFnZVRyYWlsKGNvbndheV9nYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbmZpZy50cmFpbF9sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5ld19jZWxsX3RyYWlsX3Bvc2l0aW9ucyA9IGNvbndheV9nYW1lLmdldExhc3RTdGVwRGllZENlbGxQb3NpdGlvbnMoKTtcbiAgICAgICAgbmV3X2NlbGxfdHJhaWxfcG9zaXRpb25zLmZvckVhY2goKHBvcywgaSwgYXJyKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBvc1RvQ2VsbFdpdGhWaXN1YWxUcmFpbC5zZXQocG9zLnRvU3RyaW5nKCksIG5ldyBBZ2luZ0NlbGxSZXByKHBvcywgdGhpcy5jb25maWcudHJhaWxfbGVuZ3RoLCB0aGlzLmNvbmZpZy5hbGl2ZV9jZWxsX3JlcHIpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGZvciAoY29uc3QgW3Bvc1N0cmluZywgdmFsXSBvZiB0aGlzLnBvc1RvQ2VsbFdpdGhWaXN1YWxUcmFpbC5lbnRyaWVzKCkpIHtcbiAgICAgICAgICAgIHZhbC5hZ2UoKTtcbiAgICAgICAgICAgIGxldCBhZ2luZ1JlcHIgPSB0aGlzLnBvc1RvQ2VsbFdpdGhWaXN1YWxUcmFpbC5nZXQocG9zU3RyaW5nKTtcbiAgICAgICAgICAgIGlmIChhZ2luZ1JlcHIgIT0gdW5kZWZpbmVkICYmIChhZ2luZ1JlcHIgPT09IG51bGwgfHwgYWdpbmdSZXByID09PSB2b2lkIDAgPyB2b2lkIDAgOiBhZ2luZ1JlcHIuY3VycmVudF9saWZlKSA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NUb0NlbGxXaXRoVmlzdWFsVHJhaWwuZGVsZXRlKHBvc1N0cmluZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlRW1vamlHYW1lRmllbGRBc1N0cmluZyhjb253YXlHYW1lKSB7XG4gICAgICAgIGxldCBnYW1lU3BhY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImdhbWVGaWVsZFwiKTtcbiAgICAgICAgaWYgKGdhbWVTcGFjZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgcmVwcmVzZW50ZXIgPSBuZXcgQ29ud2F5R2FtZVJlcHJlc2VudGVyKGNvbndheUdhbWUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIGdhbWVTcGFjZS5pbm5lckhUTUwgPSByZXByZXNlbnRlci5zdHJfZmllbGQoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwcmVwcmVuZGVyX2JpdG1hcChjb253YXlHYW1lKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FudmFzKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJubyBjYW52YXMgZGVmaW5lZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlcHJlc2VudGVyID0gbmV3IENvbndheUdhbWVSZXByZXNlbnRlcihjb253YXlHYW1lLCB0aGlzLmNvbmZpZyk7XG4gICAgICAgICAgICBjb25zdCB4U2l6ZVJlY3QgPSB0aGlzLmNhbnZhcy53aWR0aCAvIGNvbndheUdhbWUueFNpemU7XG4gICAgICAgICAgICBjb25zdCB5U2l6ZVJlY3QgPSB0aGlzLmNhbnZhcy5oZWlnaHQgLyBjb253YXlHYW1lLnlTaXplO1xuICAgICAgICAgICAgbGV0IGN1cl9yZXNfaW5kZXggPSAwO1xuICAgICAgICAgICAgbGV0IGFsaXZlUGF0aCA9IFtdO1xuICAgICAgICAgICAgbGV0IGZhZGluZ1BhdGhzID0gbmV3IE1hcCgpO1xuICAgICAgICAgICAgZm9yIChsZXQgeFBvcyA9IDA7IHhQb3MgPCBjb253YXlHYW1lLnhTaXplOyB4UG9zKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCB5UG9zID0gMDsgeVBvcyA8IGNvbndheUdhbWUueVNpemU7IHlQb3MrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29ud2F5R2FtZS5nZXRDdXJyZW50Q2VsbCh4UG9zLCB5UG9zKS5pc0FsaXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGl2ZVBhdGgucHVzaChbeFBvcyAqIHhTaXplUmVjdCwgeVBvcyAqIHlTaXplUmVjdCwgeFNpemVSZWN0LCB5U2l6ZVJlY3RdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBmYWRpbmdDZWxsID0gdGhpcy5wb3NUb0NlbGxXaXRoVmlzdWFsVHJhaWwuZ2V0KG5ldyBDZWxsUG9zaXRpb24oeFBvcywgeVBvcykudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWRpbmdDZWxsICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFmYWRpbmdQYXRocy5oYXMoZmFkaW5nQ2VsbC5jdXJyZW50X2xpZmUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFkaW5nUGF0aHMuc2V0KGZhZGluZ0NlbGwuY3VycmVudF9saWZlLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNlbGxfcmVwcjogZmFkaW5nQ2VsbC5mYWRpbmdfY2VsbF9jb2xvcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZmFkaW5nUGF0aDogW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmFkaW5nUGF0aCA9IChfYSA9IGZhZGluZ1BhdGhzLmdldChmYWRpbmdDZWxsLmN1cnJlbnRfbGlmZSkpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5mYWRpbmdQYXRoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmFkaW5nUGF0aCA9PT0gbnVsbCB8fCBmYWRpbmdQYXRoID09PSB2b2lkIDAgPyB2b2lkIDAgOiBmYWRpbmdQYXRoLnB1c2goW3hQb3MgKiB4U2l6ZVJlY3QsIHlQb3MgKiB5U2l6ZVJlY3QsIHhTaXplUmVjdCwgeVNpemVSZWN0XSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VyX3Jlc19pbmRleCsrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnByZVJlbmRlckNvbnRleHQgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiTm8gQ29udGV4dCBleGlzdHNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByZVJlbmRlckNvbnRleHQuaW1hZ2VTbW9vdGhpbmdFbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnByZVJlbmRlckNvbnRleHQuZmlsbFN0eWxlID0gcmVwcmVzZW50ZXIuY2VsbF9yZXByX2RlYWQucmdiYV9zdHI7XG4gICAgICAgICAgICB0aGlzLnByZVJlbmRlckNvbnRleHQuZmlsbFJlY3QoMCwgMCwgdGhpcy5jYW52YXMud2lkdGgsIHRoaXMuY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHsgY2VsbF9yZXByLCBmYWRpbmdQYXRoIH0gb2YgZmFkaW5nUGF0aHMudmFsdWVzKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBhdGgodGhpcy5wcmVSZW5kZXJDb250ZXh0LCBjZWxsX3JlcHIsIGZhZGluZ1BhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yZW5kZXJQYXRoKHRoaXMucHJlUmVuZGVyQ29udGV4dCwgcmVwcmVzZW50ZXIuY2VsbF9yZXByX2FsaXZlLCBhbGl2ZVBhdGgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJlUmVuZGVyQ2FudmFzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0Q2FudmFzQml0TWFwID0gdGhpcy5wcmVSZW5kZXJDYW52YXMudHJhbnNmZXJUb0ltYWdlQml0bWFwKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZW5kZXJQYXRoKGNhbnZhc0NvbnRleHQsIGNlbGxfcmVwciwgcmVjdFBhdGgpIHtcbiAgICAgICAgY2FudmFzQ29udGV4dCA9PT0gbnVsbCB8fCBjYW52YXNDb250ZXh0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjYW52YXNDb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjYW52YXNDb250ZXh0LmZpbGxTdHlsZSA9IGNlbGxfcmVwci5yZ2JhX3N0cjtcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHJlY3RQYXRoKSB7XG4gICAgICAgICAgICBjYW52YXNDb250ZXh0LnJlY3QocGF0aFswXSwgcGF0aFsxXSwgcGF0aFsyXSwgcGF0aFszXSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FudmFzQ29udGV4dCA9PT0gbnVsbCB8fCBjYW52YXNDb250ZXh0ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjYW52YXNDb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgICBjYW52YXNDb250ZXh0ID09PSBudWxsIHx8IGNhbnZhc0NvbnRleHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhbnZhc0NvbnRleHQuZmlsbCgpO1xuICAgIH1cbiAgICBnZXRQcmVSZW5kZXJlZEJpdG1hcChjb253YXlHYW1lKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmVSZW5kZXJDYW52YXMgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHlpZWxkIHRoaXMucHJlcHJlbmRlcl9iaXRtYXAoY29ud2F5R2FtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5uZXh0Q2FudmFzQml0TWFwO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdXBkYXRlX2dhbWVfZmllbGRfd2l0aF9zaGFwZXNfZnJvbV9wcmVyZW5kZXIoY29ud2F5R2FtZSwgb2Zmc2V0WCA9IDAsIG9mZnNldFkgPSAwKSB7XG4gICAgICAgIHRoaXMuYWRkVmlzdWFsVHJhaWxDZWxsc0FuZEFnZVRyYWlsKGNvbndheUdhbWUpO1xuICAgICAgICBpZiAoIXRoaXMuY2FudmFzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiQ2FudmFzIGlzIHVuZGVmaW5lZCBhbmQgdGhlcmVmb3JlIG5vdCB1c2FibGVcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYml0bWFwQ29udGV4dCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHByZXJlbmRlcmVkQ2FudmFzID0gdGhpcy5nZXRQcmVSZW5kZXJlZEJpdG1hcChjb253YXlHYW1lKTtcbiAgICAgICAgcHJlcmVuZGVyZWRDYW52YXMudGhlbigodikgPT4ge1xuICAgICAgICAgICAgdmFyIF9hO1xuICAgICAgICAgICAgKF9hID0gdGhpcy5iaXRtYXBDb250ZXh0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudHJhbnNmZXJGcm9tSW1hZ2VCaXRtYXAodik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLm5leHRDYW52YXNCaXRNYXAgPSBudWxsO1xuICAgIH1cbiAgICAvLyBwcm90ZWN0ZWQgZmFkZWRfY2VsbF9yZXByX2RhdGFfb3JfY2VsbF9yZXByKG9yaWdpbmFsX2NlbGxfcmVwcjogQ2VsbFJlcHIsIG9wdF9mYWRpbmdfY2VsbDogQWdpbmdDZWxsUmVwciB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZCkge1xuICAgIC8vICAgICBsZXQgY2VsbF9yZXByID0gb3JpZ2luYWxfY2VsbF9yZXByO1xuICAgIC8vICAgICBjb25zb2xlLmxvZygob3B0X2ZhZGluZ19jZWxsICE9IHVuZGVmaW5lZCkgKyBcIiBcIiArICghb3B0X2ZhZGluZ19jZWxsPy5jb21wbGV0ZWx5RmFkZWQpICsgXCJcIiArIChjZWxsX3JlcHIgPT0gdGhpcy5jb25maWcuZGVhZF9jZWxsX3JlcHIpICsgXCJcIiArIChvcHRfZmFkaW5nX2NlbGw/LmlzQWdlZCkpO1xuICAgIC8vICAgICBpZiAob3B0X2ZhZGluZ19jZWxsICE9IHVuZGVmaW5lZCAmJiAhb3B0X2ZhZGluZ19jZWxsLmNvbXBsZXRlbHlGYWRlZCAmJiBjZWxsX3JlcHIgPT0gdGhpcy5jb25maWcuZGVhZF9jZWxsX3JlcHIgJiYgb3B0X2ZhZGluZ19jZWxsLmlzQWdlZCkge1xuICAgIC8vICAgICAgICAgY2VsbF9yZXByID0gb3B0X2ZhZGluZ19jZWxsLmZhZGluZ19jZWxsX2NvbG9yO1xuICAgIC8vICAgICB9XG4gICAgLy8gICAgIHJldHVybiBjZWxsX3JlcHI7XG4gICAgLy8gfVxuICAgIGRpc3BsYXlHZW5lcmF0aW9uKGdlbmVyYXRpb24pIHtcbiAgICAgICAgbGV0IGN1cnJlbnRHZW5lcmF0aW9uRWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiR2FtZUZpZWxkQ3VycmVudEdlbmVyYXRpb25cIik7XG4gICAgICAgIGlmIChjdXJyZW50R2VuZXJhdGlvbkVsZW1lbnQgIT0gbnVsbCkge1xuICAgICAgICAgICAgbGV0IG5ld19lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImgxXCIpO1xuICAgICAgICAgICAgbmV3X2VsZW1lbnQuaW5uZXJIVE1MID0gXCJjdXJyZW50IEdlbmVyYXRpb246IFwiICsgZ2VuZXJhdGlvbi50b1N0cmluZygpO1xuICAgICAgICAgICAgY3VycmVudEdlbmVyYXRpb25FbGVtZW50LmNoaWxkTm9kZXMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGN1cnJlbnRHZW5lcmF0aW9uRWxlbWVudC5hcHBlbmRDaGlsZChuZXdfZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3VtZVVwZGF0ZXMoKSB7XG4gICAgICAgIHRoaXMuY29uZmlnLm9uX3NjcmVlbl9jaGFuZ2UoKS5vbih0aGlzLmhhbmRsZUNvbmZpZ1VwZGF0ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG4gICAgaGFuZGxlQ29uZmlnVXBkYXRlKCkge1xuICAgICAgICBpZiAodGhpcy5jYW52YXMgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNvbmZpZyB1cGRhdGUgZGV0ZWN0ZWRcIik7XG4gICAgICAgICAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuY29uZmlnLnhfcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuY29uZmlnLnNjcmVlbl9yYXRpbyAqIHRoaXMuY29uZmlnLnhfcmVzb2x1dGlvbjtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZVJlbmRlckNhbnZhcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wcmVSZW5kZXJDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhcy53aWR0aDtcbiAgICAgICAgICAgICAgICB0aGlzLnByZVJlbmRlckNhbnZhcy5oZWlnaHQgPSB0aGlzLmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgbWFwVG9Db253YXlGaWVsZFBvc2l0aW9uKHBvcywgY29ud2F5X2dhbWUpIHtcbiAgICAgICAgY29uc3Qgc3RhcnRQb3NYID0gKHBvcy5zdGFydFBvcy54UG9zIC8gdGhpcy5jb25maWcueF9yZXNvbHV0aW9uKSAqIGNvbndheV9nYW1lLnhTaXplO1xuICAgICAgICBjb25zdCBzdGFydFBvc1kgPSAocG9zLnN0YXJ0UG9zLnlQb3MgLyAodGhpcy5jb25maWcueF9yZXNvbHV0aW9uICogdGhpcy5jb25maWcuc2NyZWVuX3JhdGlvKSkgKlxuICAgICAgICAgICAgY29ud2F5X2dhbWUueVNpemU7XG4gICAgICAgIGNvbnN0IGVuZFBvc1ggPSAocG9zLmVuZFBvcy54UG9zIC8gdGhpcy5jb25maWcueF9yZXNvbHV0aW9uKSAqIGNvbndheV9nYW1lLnhTaXplO1xuICAgICAgICBjb25zdCBlbmRQb3NZID0gKHBvcy5lbmRQb3MueVBvcyAvICh0aGlzLmNvbmZpZy54X3Jlc29sdXRpb24gKiB0aGlzLmNvbmZpZy5zY3JlZW5fcmF0aW8pKSAqXG4gICAgICAgICAgICBjb253YXlfZ2FtZS55U2l6ZTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHN0YXJ0UG9zOiBuZXcgQ2VsbFBvc2l0aW9uKE1hdGgucm91bmQoc3RhcnRQb3NYKSwgTWF0aC5yb3VuZChzdGFydFBvc1kpKSxcbiAgICAgICAgICAgIGVuZFBvczogbmV3IENlbGxQb3NpdGlvbihNYXRoLnJvdW5kKGVuZFBvc1gpLCBNYXRoLnJvdW5kKGVuZFBvc1kpKSxcbiAgICAgICAgfTtcbiAgICB9XG59XG5jbGFzcyBNb3VzZVBvc2l0aW9uSGFuZGxlciB7XG4gICAgY29uc3RydWN0b3Ioc3RhcnRYUG9zLCBzdGFydFlQb3MpIHtcbiAgICAgICAgdGhpcy5sYXN0WFBvc2l0aW9uID0gc3RhcnRYUG9zO1xuICAgICAgICB0aGlzLmxhc3RZUG9zaXRpb24gPSBzdGFydFlQb3M7XG4gICAgICAgIHRoaXMudGltZVN0YW1wID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgIHRoaXMucGF0aCA9IG51bGw7XG4gICAgfVxuICAgIHVwZGF0ZU1vdXNlUG9zKHhQb3MsIHlQb3MpIHtcbiAgICAgICAgaWYgKHhQb3MgIT0gdGhpcy5sYXN0WFBvc2l0aW9uIHx8IHlQb3MgIT0gdGhpcy5sYXN0WVBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBwYXRoID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0UG9zOiBuZXcgQ2VsbFBvc2l0aW9uKHRoaXMubGFzdFhQb3NpdGlvbiwgdGhpcy5sYXN0WVBvc2l0aW9uKSxcbiAgICAgICAgICAgICAgICBlbmRQb3M6IG5ldyBDZWxsUG9zaXRpb24oeFBvcywgeVBvcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5wYXRoID0gcGF0aDtcbiAgICAgICAgICAgIHRoaXMubGFzdFhQb3NpdGlvbiA9IHhQb3M7XG4gICAgICAgICAgICB0aGlzLmxhc3RZUG9zaXRpb24gPSB5UG9zO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEFuZFJlc2V0UGF0aCgpIHtcbiAgICAgICAgdmFyIF9hLCBfYiwgX2MsIF9kLCBfZSwgX2Y7XG4gICAgICAgIGxldCBwID0gbnVsbDtcbiAgICAgICAgaWYgKCgoX2EgPSB0aGlzLnBhdGgpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5zdGFydFBvcykgIT0gbnVsbCAmJiAoKF9iID0gdGhpcy5wYXRoKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuZW5kUG9zKSAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9uZSBmdW5jdGlvbiB0byBjZWxsIHBvc2l0aW9uXG4gICAgICAgICAgICBwID0ge1xuICAgICAgICAgICAgICAgIHN0YXJ0UG9zOiBuZXcgQ2VsbFBvc2l0aW9uKChfYyA9IHRoaXMucGF0aCkgPT09IG51bGwgfHwgX2MgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9jLnN0YXJ0UG9zLnhQb3MsIChfZCA9IHRoaXMucGF0aCkgPT09IG51bGwgfHwgX2QgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9kLnN0YXJ0UG9zLnlQb3MpLFxuICAgICAgICAgICAgICAgIGVuZFBvczogbmV3IENlbGxQb3NpdGlvbigoX2UgPSB0aGlzLnBhdGgpID09PSBudWxsIHx8IF9lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZS5lbmRQb3MueFBvcywgKF9mID0gdGhpcy5wYXRoKSA9PT0gbnVsbCB8fCBfZiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2YuZW5kUG9zLnlQb3MpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGggPSBudWxsO1xuICAgICAgICByZXR1cm4gcDtcbiAgICB9XG59XG5jbGFzcyBTaW1wbGVFdmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSBbXTsgLy8ganVzdCBmdW5jdGlvbnMgd2hpY2ggYXJlIGNhbGxlZCBvbiB0cmlnZ2VyXG4gICAgfVxuICAgIG9uKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgIH1cbiAgICBvZmYoaGFuZGxlcikge1xuICAgICAgICB0aGlzLmhhbmRsZXJzID0gdGhpcy5oYW5kbGVycy5maWx0ZXIoKGgpID0+IGggIT09IGhhbmRsZXIpO1xuICAgIH1cbiAgICB0cmlnZ2VyKGRhdGEpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycy5zbGljZSgwKS5mb3JFYWNoKChoKSA9PiBoKGRhdGEpKTtcbiAgICB9XG4gICAgZXhwb3NlKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59XG5jbGFzcyBDb25maWdTdGF0ZSB7XG4gICAgb25fc2NyZWVuX2NoYW5nZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NyZWVuX2NoYW5nZV9ldmVudC5leHBvc2UoKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoY29sb3JfYWxpdmUgPSBuZXcgQ2VsbENvbG9yKDI1NSwgMjU1LCAyNTUsIDI1NSksIGNvbG9yX2RlYWQgPSBuZXcgQ2VsbENvbG9yKDAsIDAsIDIwLCAyNTUpLCBkaXNwbGF5X3RyYWlscyA9IDMsIHhfcmVzb2x1dGlvbiA9IDEwMDAsIHNjcmVlbl9yYXRpbyA9IDkgLyAxNikge1xuICAgICAgICB0aGlzLmN1cnJlbnRfQlBNID0gNjA7XG4gICAgICAgIHRoaXMuc2NyZWVuX2NoYW5nZV9ldmVudCA9IG5ldyBTaW1wbGVFdmVudCgpO1xuICAgICAgICB0aGlzLl9hbGl2ZV9jZWxsX2NvbG9yID0gY29sb3JfYWxpdmU7XG4gICAgICAgIHRoaXMuX2RlYWRfY2VsbF9jb2xvciA9IGNvbG9yX2RlYWQ7XG4gICAgICAgIHRoaXMuX2Rpc3BsYXlfdHJhaWxzID0gTWF0aC5tYXgoMSwgZGlzcGxheV90cmFpbHMpO1xuICAgICAgICB0aGlzLl94X3Jlc29sdXRpb24gPSB4X3Jlc29sdXRpb247XG4gICAgICAgIHRoaXMuX3NjcmVlbl9yYXRpbyA9IHNjcmVlbl9yYXRpbztcbiAgICAgICAgdGhpcy5fbW91c2VQb3NpdGlvbkhhbmRsZXIgPSBudWxsO1xuICAgICAgICB0aGlzLmdhbWVfc2V0dGluZ3NfdXBkYXRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9iZWF0X29mZnNldF90aW1lX21zID0gbnVsbDtcbiAgICB9XG4gICAgZ2V0IGFsaXZlX2NlbGxfcmVwcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FsaXZlX2NlbGxfY29sb3I7XG4gICAgfVxuICAgIHNldCBzZXRfYWxpdmVfY2VsbF9jb2xvcihjb2xvcikge1xuICAgICAgICB0aGlzLl9hbGl2ZV9jZWxsX2NvbG9yID0gbmV3IENlbGxDb2xvcihjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdLCBjb2xvclszXSk7XG4gICAgICAgIHRoaXMuZ2FtZV9zZXR0aW5nc191cGRhdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0IHNldF9kZWFkX2NlbGxfY29sb3IoY29sb3IpIHtcbiAgICAgICAgdGhpcy5fZGVhZF9jZWxsX2NvbG9yID0gbmV3IENlbGxDb2xvcihjb2xvclswXSwgY29sb3JbMV0sIGNvbG9yWzJdLCBjb2xvclszXSk7XG4gICAgICAgIHRoaXMuZ2FtZV9zZXR0aW5nc191cGRhdGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgc2V0IHhfcmVzb2x1dGlvbihyZXNvbHV0aW9uKSB7XG4gICAgICAgIHRoaXMuX3hfcmVzb2x1dGlvbiA9IE1hdGgubWF4KHJlc29sdXRpb24sIDEwMCk7XG4gICAgICAgIHRoaXMuc2NyZWVuX2NoYW5nZV9ldmVudC50cmlnZ2VyKCk7XG4gICAgfVxuICAgIGdldCB4X3Jlc29sdXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl94X3Jlc29sdXRpb247XG4gICAgfVxuICAgIHNldCBzY3JlZW5fcmF0aW8ocmF0aW8pIHtcbiAgICAgICAgdGhpcy5fc2NyZWVuX3JhdGlvID0gcmF0aW87XG4gICAgICAgIHRoaXMuc2NyZWVuX2NoYW5nZV9ldmVudC50cmlnZ2VyKCk7XG4gICAgfVxuICAgIGdldCBzY3JlZW5fcmF0aW8oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zY3JlZW5fcmF0aW87XG4gICAgfVxuICAgIGdldCBkZWFkX2NlbGxfcmVwcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RlYWRfY2VsbF9jb2xvcjtcbiAgICB9XG4gICAgc2V0IG1vdXNlUG9zaXRpb25IYW5kbGVyKGhhbmRsZXIpIHtcbiAgICAgICAgdGhpcy5fbW91c2VQb3NpdGlvbkhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIH1cbiAgICBnZXQgZ2V0TW91c2VQb3NpdGlvbkhhbmRsZXIoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9tb3VzZVBvc2l0aW9uSGFuZGxlcjtcbiAgICB9XG4gICAgZ2V0IHRyYWlsX2xlbmd0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2Rpc3BsYXlfdHJhaWxzO1xuICAgIH1cbiAgICBnZXQgYnBtX3RpbWVvdXRfc2Vjb25kcygpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAodGhpcy5icG0gLyA2MCk7XG4gICAgfVxuICAgIHNldCB1cGRhdGVfYnBtKG5ld19icG0pIHtcbiAgICAgICAgdGhpcy5jdXJyZW50X0JQTSA9IG5ld19icG07XG4gICAgfVxuICAgIGdldCBicG0oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRfQlBNO1xuICAgIH1cbiAgICBnZXRfYmVhdF9vZmZzZXRfc2Vjb25kcyh0aW1lX21zKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidGhlIG9mZnNldCBcIiwgdGhpcy5fYmVhdF9vZmZzZXRfdGltZV9tcyk7XG4gICAgICAgIGlmICh0aGlzLl9iZWF0X29mZnNldF90aW1lX21zID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aW1lX21zIC0gdGhpcy5fYmVhdF9vZmZzZXRfdGltZV9tcztcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KDAsIG9mZnNldCk7XG4gICAgfVxuICAgIHNldCBiZWF0X29mZnNldF9zZWNvbmRzKHRpbWVfbXMpIHtcbiAgICAgICAgdGhpcy5fYmVhdF9vZmZzZXRfdGltZV9tcyA9IHRpbWVfbXM7XG4gICAgfVxufVxuY29uc3QgU1VSUk9VTkRJTkdQT1NJVElPTlMgPSBuZXcgQXJyYXkobmV3IENlbGxQb3NpdGlvbigtMSwgLTEpLCBuZXcgQ2VsbFBvc2l0aW9uKC0xLCAwKSwgbmV3IENlbGxQb3NpdGlvbigtMSwgMSksIG5ldyBDZWxsUG9zaXRpb24oMCwgMSksIG5ldyBDZWxsUG9zaXRpb24oMCwgLTEpLCBuZXcgQ2VsbFBvc2l0aW9uKDEsIDEpLCBuZXcgQ2VsbFBvc2l0aW9uKDEsIDApLCBuZXcgQ2VsbFBvc2l0aW9uKDEsIC0xKSk7XG5jb25zdCBERUZBVUxUR0FNRVJVTEUgPSBuZXcgQXJyYXkobmV3IFNoYXBlZENvbndheUdhbWVSdWxlKG51bGwsIFNVUlJPVU5ESU5HUE9TSVRJT05TLCBbMiwgM10sIFszXSkpO1xuY29uc3QgTVVMVElQTElDQVRJT05HQU1FUlVMRSA9IG5ldyBBcnJheShuZXcgU2hhcGVkQ29ud2F5R2FtZVJ1bGUobnVsbCwgU1VSUk9VTkRJTkdQT1NJVElPTlMsIFsyXSwgWzJdKSk7XG5jb25zdCBDT1BZR0FNRVJVTEVTID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzEsIDMsIDUsIDddLCBbMSwgMywgNSwgN10pKTtcbmNvbnN0IFdPUkxEMzNSVUxFUyA9IG5ldyBBcnJheShuZXcgU2hhcGVkQ29ud2F5R2FtZVJ1bGUobnVsbCwgU1VSUk9VTkRJTkdQT1NJVElPTlMsIFszXSwgWzNdKSk7XG5jb25zdCBXT1JMRDIzNlJVTEVTID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzIsIDMsIDZdLCBbM10pKTtcbmNvbnN0IFNOQUtFS0lOR1JVTEVJREVBID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzJdLCBbMl0pKTtcbmNvbnN0IFdPUkxENDRSVUxFUyA9IG5ldyBBcnJheShuZXcgU2hhcGVkQ29ud2F5R2FtZVJ1bGUobnVsbCwgU1VSUk9VTkRJTkdQT1NJVElPTlMsIFszXSwgWzJdKSk7XG5jb25zdCBDRU5URVJERUZBVUxUR0FNRVJVTEUgPSBuZXcgQXJyYXkobmV3IFNoYXBlZENvbndheUdhbWVSdWxlKG5ldyBSZWN0YW5nbGUobmV3IENlbGxQb3NpdGlvbigxMDAsIDApLCBuZXcgQ2VsbFBvc2l0aW9uKDIwMCwgMjAwKSksIFNVUlJPVU5ESU5HUE9TSVRJT05TLCBbMiwgM10sIFszXSkpO1xuZXhwb3J0IHsgQ29ud2F5R2FtZSwgQ29ud2F5R2FtZUZhY3RvcnksIENFTlRFUkRFRkFVTFRHQU1FUlVMRSwgREVGQVVMVEdBTUVSVUxFLCBDb253YXlIVE1MRGlzcGxheWVyLCBDb253YXlHYW1lUmVwcmVzZW50ZXIsIENlbGxDb2xvciwgQ29uZmlnU3RhdGUgYXMgQ29uZmlnU3RvcmFnZSwgQ2VsbFBvc2l0aW9uLCBBZ2luZ0NlbGxSZXByLCBNVUxUSVBMSUNBVElPTkdBTUVSVUxFLCBCb29sZWFuQ2VsbCwgQ29ud2F5R2FtZUFkdmFuY2VyLCBNb3VzZVBvc2l0aW9uSGFuZGxlciwgUmVzZXRHYW1lUnVsZSwgU2hhcGVkQ29ud2F5R2FtZVJ1bGUsIH07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IENvbndheUdhbWVBZHZhbmNlciwgQ29ud2F5R2FtZUZhY3RvcnksIENFTlRFUkRFRkFVTFRHQU1FUlVMRSwgQ29ud2F5SFRNTERpc3BsYXllciwgQ29uZmlnU3RvcmFnZSwgQ2VsbFBvc2l0aW9uLCBNVUxUSVBMSUNBVElPTkdBTUVSVUxFLCBNb3VzZVBvc2l0aW9uSGFuZGxlciwgfSBmcm9tIFwiLi4vbWFpbi9nYW1lX29mX2xpZmVfZGVmYXVsdFwiO1xuY29uc3QgQ09OV0FZQ09ORklHID0gbmV3IENvbmZpZ1N0b3JhZ2UoKTtcbnNlbGYub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgY29uc29sZS5kZWJ1ZyhcIldvcmtlciByZWNlaXZlZCBtZXNzYWdlIFwiICsgZXZlbnQuZGF0YSk7XG4gICAgbGV0IHJlY2VpdmVkX2RhdGEgPSBldmVudC5kYXRhO1xuICAgIHN3aXRjaCAocmVjZWl2ZWRfZGF0YS5tZXNzYWdlKSB7XG4gICAgICAgIGNhc2UgXCJzdGFydFwiOlxuICAgICAgICAgICAgaWYgKHJlY2VpdmVkX2RhdGEuY2FudmFzID09IHVuZGVmaW5lZCB8fCByZWNlaXZlZF9kYXRhLnByZXJlbmRlckNhbnZhcyA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIlN0YXJ0IGlzIG1pc3NpbmcgYXJndW1lbnRzXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IG1haW5DYW52YXMgPSByZWNlaXZlZF9kYXRhLmNhbnZhcztcbiAgICAgICAgICAgIGxldCBvcHRDYW52YXMgPSByZWNlaXZlZF9kYXRhLnByZXJlbmRlckNhbnZhcztcbiAgICAgICAgICAgIHN0YXJ0X2NvbndheV9nYW1lX29uX2NhbnZhcyhtYWluQ2FudmFzLCBvcHRDYW52YXMpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZXRYUmVzb2x1dGlvblwiOlxuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcIldvcmtlciByZWNlaXZlZCByZXNvbHV0aW9uIG1lc3NhZ2VcIiArIHJlY2VpdmVkX2RhdGEpO1xuICAgICAgICAgICAgQ09OV0FZQ09ORklHLnhfcmVzb2x1dGlvbiA9IHJlY2VpdmVkX2RhdGEud2lkdGg7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInNldFNjcmVlblJhdGlvXCI6XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiV29ya2VyIHJlY2VpdmVkIHNjcmVlbiByYXRpbyBtZXNzYWdlXCIgKyByZWNlaXZlZF9kYXRhLnNjcmVlbl9yYXRpbyk7XG4gICAgICAgICAgICBDT05XQVlDT05GSUcuc2NyZWVuX3JhdGlvID0gcmVjZWl2ZWRfZGF0YS5zY3JlZW5fcmF0aW87XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInNldENvbG9yQWxpdmVcIjpcbiAgICAgICAgICAgIENPTldBWUNPTkZJRy5zZXRfYWxpdmVfY2VsbF9jb2xvciA9IHJlY2VpdmVkX2RhdGEucmdiYTsgLy8gVE9ETyBtYWtlIHRoaXMgYWxzbyBiZSBhYmxlIHRvIHRha2UgYSBmdW5jdGlvbiAvIG9yIHVzZSBhIHByZWRlZmluZWQgZnVuY3Rpb25cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic2V0Q29sb3JEZWFkXCI6XG4gICAgICAgICAgICBDT05XQVlDT05GSUcuc2V0X2RlYWRfY2VsbF9jb2xvciA9IHJlY2VpdmVkX2RhdGEucmdiYTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibW91c2Vwb3NpdGlvblwiOlxuICAgICAgICAgICAgaWYgKENPTldBWUNPTkZJRy5nZXRNb3VzZVBvc2l0aW9uSGFuZGxlciA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgQ09OV0FZQ09ORklHLm1vdXNlUG9zaXRpb25IYW5kbGVyID0gbmV3IE1vdXNlUG9zaXRpb25IYW5kbGVyKHJlY2VpdmVkX2RhdGEueFBvcywgcmVjZWl2ZWRfZGF0YS55UG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIENPTldBWUNPTkZJRy5nZXRNb3VzZVBvc2l0aW9uSGFuZGxlci51cGRhdGVNb3VzZVBvcyhyZWNlaXZlZF9kYXRhLnhQb3MsIHJlY2VpdmVkX2RhdGEueVBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcImJwbVVwZGF0ZVwiOlxuICAgICAgICAgICAgQ09OV0FZQ09ORklHLnVwZGF0ZV9icG0gPSByZWNlaXZlZF9kYXRhLmJwbTtcbiAgICAgICAgICAgIENPTldBWUNPTkZJRy5iZWF0X29mZnNldF9zZWNvbmRzID0gcmVjZWl2ZWRfZGF0YS5uZXh0X2JlYXRfdGltZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlVua25vd24gZGF0YVwiICsgcmVjZWl2ZWRfZGF0YSk7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5rbm93biBtZXNzYWdlIFwiICsgcmVjZWl2ZWRfZGF0YS5tZXNzYWdlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbn07XG5mdW5jdGlvbiBnZXRfcmF0aW9feV90b194KHgsIGNhbnZhcykge1xuICAgIC8vIFRPRE8gdXNlIG9mZnNjcmVlbiBjYW52YXMgcmF0aW9cbiAgICByZXR1cm4gTWF0aC5jZWlsKHggKiAwLjU2MjUpO1xufVxuZnVuY3Rpb24gc3RhcnRfY29ud2F5X2dhbWVfb25fY2FudmFzKGNhbnZhcywgcHJlcmVuZGVyQ2FudmFzKSB7XG4gICAgbGV0IGZwcyA9IDMwO1xuICAgIGNvbnN0IHhfcGl4ZWxfZGVmYXVsdCA9IDE1MDtcbiAgICBjb25zdCB5X3BpeGVsX2RlZmF1bHQgPSBnZXRfcmF0aW9feV90b194KHhfcGl4ZWxfZGVmYXVsdCwgY2FudmFzKTtcbiAgICBjb25zdCBjb253YXlHYW1lRmFjdG9yeSA9IG5ldyBDb253YXlHYW1lRmFjdG9yeSh4X3BpeGVsX2RlZmF1bHQsIHlfcGl4ZWxfZGVmYXVsdCwgQ0VOVEVSREVGQVVMVEdBTUVSVUxFLCB0cnVlLCBNVUxUSVBMSUNBVElPTkdBTUVSVUxFWzBdLCBcImV4dGVuZFwiKTsgLy8gdG9kbyByZWFsIHNjcmVlbiBwcm9wb3J0aW9ucywgZS5nLiB3aW5kb3cgaXMgc2l6ZWRcbiAgICBsZXQgY3VycmVudENvbndheUdhbWVPcmlnaW5hbCA9IGNvbndheUdhbWVGYWN0b3J5LmNpcmNsZSgyMCwgKDEgLyAyMCkgKiBNYXRoLlBJLCBbXG4gICAgICAgIG5ldyBDZWxsUG9zaXRpb24oMCwgMCksXG4gICAgXSk7XG4gICAgbGV0IGN1cnJlbnRDb253YXlHYW1lID0gQ29ud2F5R2FtZUFkdmFuY2VyLmZyb21Db253YXlHYW1lKGN1cnJlbnRDb253YXlHYW1lT3JpZ2luYWwsIHVuZGVmaW5lZCk7XG4gICAgY29uc3QgZmllbGRfZHJhd2VyID0gbmV3IENvbndheUhUTUxEaXNwbGF5ZXIoY2FudmFzLCBDT05XQVlDT05GSUcsIG51bGwsIHByZXJlbmRlckNhbnZhcyk7XG4gICAgZmllbGRfZHJhd2VyLnVwZGF0ZV9nYW1lX2ZpZWxkX3dpdGhfc2hhcGVzX2Zyb21fcHJlcmVuZGVyKGN1cnJlbnRDb253YXlHYW1lKTtcbiAgICBsZXQgZ2FtZVN0YXRlU3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIGxldCB0aW1lb3V0X3VwZGF0ZV9yZWNlaXZlZCA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uIGRyYXdfY29ud2F5X2dhbWUodGltZVN0YW1wKSB7XG4gICAgICAgIHRpbWVTdGFtcCA9IERhdGUubm93KCk7XG4gICAgICAgIGlmICghY3VycmVudENvbndheUdhbWUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJObyBDb253YXkgZ2FtZSB3YXMgY3JlYXRlZFwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBlbGFwc2VkX2dhbWVfc3RhdGUgPSB0aW1lU3RhbXAgLSBnYW1lU3RhdGVTdGFydDtcbiAgICAgICAgY29uc3QgbmVlZGVkX3RpbWUgPSAoQ09OV0FZQ09ORklHLmJwbV90aW1lb3V0X3NlY29uZHMgKyBDT05XQVlDT05GSUcuZ2V0X2JlYXRfb2Zmc2V0X3NlY29uZHModGltZVN0YW1wKSkgKlxuICAgICAgICAgICAgMTAwMDtcbiAgICAgICAgaWYgKGVsYXBzZWRfZ2FtZV9zdGF0ZSA+IG5lZWRlZF90aW1lKSB7XG4gICAgICAgICAgICBnYW1lU3RhdGVTdGFydCA9IHRpbWVTdGFtcDtcbiAgICAgICAgICAgIHVwZGF0ZUNvbndheUdhbWUoKTtcbiAgICAgICAgICAgIENPTldBWUNPTkZJRy5iZWF0X29mZnNldF9zZWNvbmRzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGltZW91dF91cGRhdGVfcmVjZWl2ZWQpIHtcbiAgICAgICAgICAgIGZpZWxkX2RyYXdlci51cGRhdGVfZ2FtZV9maWVsZF93aXRoX3NoYXBlc19mcm9tX3ByZXJlbmRlcihjdXJyZW50Q29ud2F5R2FtZSk7XG4gICAgICAgICAgICB0aW1lb3V0X3VwZGF0ZV9yZWNlaXZlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgodCkgPT4gZHJhd19jb253YXlfZ2FtZSh0KSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbndheUdhbWUoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKGN1cnJlbnRDb253YXlHYW1lKSB7XG4gICAgICAgICAgICBjdXJyZW50Q29ud2F5R2FtZS5uZXh0U3RhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvcyA9IChfYSA9IENPTldBWUNPTkZJRy5nZXRNb3VzZVBvc2l0aW9uSGFuZGxlcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdldEFuZFJlc2V0UGF0aCgpO1xuICAgICAgICAgICAgaWYgKHBvcyAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZyhcImFkZGluZyBwYXRoIGF0XCIgKyBwb3Muc3RhcnRQb3MgKyBcInRvIFwiICsgcG9zLmVuZFBvcyk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zRml4ZWQgPSBmaWVsZF9kcmF3ZXIubWFwVG9Db253YXlGaWVsZFBvc2l0aW9uKHBvcywgY3VycmVudENvbndheUdhbWUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXCJtYXBwZWQgcGF0aCB0b1wiICsgcG9zRml4ZWQuc3RhcnRQb3MgKyBcInRvIFwiICsgcG9zRml4ZWQuZW5kUG9zKTtcbiAgICAgICAgICAgICAgICBjdXJyZW50Q29ud2F5R2FtZS5hZGRQYXRoKHBvc0ZpeGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZpZWxkX2RyYXdlclxuICAgICAgICAgICAgICAgIC5wcmVwcmVuZGVyX2JpdG1hcChjdXJyZW50Q29ud2F5R2FtZSlcbiAgICAgICAgICAgICAgICAudGhlbigoZikgPT4gKHRpbWVvdXRfdXBkYXRlX3JlY2VpdmVkID0gdHJ1ZSkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3X2NvbndheV9nYW1lKTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==