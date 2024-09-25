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
    updategameFieldWithShapesFromPreRender(conwayGame, offsetX = 0, offsetY = 0) {
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
    field_drawer.updategameFieldWithShapesFromPreRender(currentConwayGame);
    let start = performance.now();
    let gameStateStart = start;
    let timeout_update_received = false;
    let generation = -1;
    function draw_conway_game(timeStamp) {
        if (!currentConwayGame) {
            return;
        }
        if (start == undefined) {
            start = timeStamp;
        }
        const elapsed = timeStamp - start;
        const elapsed_game_state = timeStamp - gameStateStart;
        const needed_time = (CONWAYCONFIG.bpm_timeout_seconds + CONWAYCONFIG.get_beat_offset_seconds(timeStamp)) *
            1000;
        if (elapsed_game_state > needed_time) {
            gameStateStart = timeStamp;
            updateConwayGame();
            CONWAYCONFIG.beat_offset_seconds = null;
        }
        if (elapsed > 1000 / fps && timeout_update_received) {
            field_drawer.updategameFieldWithShapesFromPreRender(currentConwayGame);
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
            generation += 1;
        }
    }
    requestAnimationFrame(draw_conway_game);
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FudmFzX3dvcmtlci5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpQkFBaUIsU0FBSSxJQUFJLFNBQUk7QUFDN0IsNEJBQTRCLCtEQUErRCxpQkFBaUI7QUFDNUc7QUFDQSxvQ0FBb0MsTUFBTSwrQkFBK0IsWUFBWTtBQUNyRixtQ0FBbUMsTUFBTSxtQ0FBbUMsWUFBWTtBQUN4RixnQ0FBZ0M7QUFDaEM7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIscUJBQXFCO0FBQ2xELGlDQUFpQyxxQkFBcUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIscUJBQXFCO0FBQ2xELGlDQUFpQyxxQkFBcUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkVBQTZFO0FBQzdFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQywyQkFBMkI7QUFDN0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsMkJBQTJCO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MscURBQXFEO0FBQ3ZGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxvQkFBb0I7QUFDeEQ7QUFDQSxvQ0FBb0MscUJBQXFCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkdBQTZHO0FBQzdHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0Msb0JBQW9CO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHFCQUFxQjtBQUNsRCxpQ0FBaUMscUJBQXFCO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsaUNBQWlDO0FBQzlELGlDQUFpQyxpQ0FBaUM7QUFDbEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLGlDQUFpQztBQUM5RCxpQ0FBaUMsaUNBQWlDO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrRUFBa0UsY0FBYztBQUNoRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQix5QkFBeUI7QUFDeEQsbUNBQW1DLHlCQUF5QjtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkI7QUFDN0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsd0JBQXdCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ3dUOzs7Ozs7O1VDejBCeFQ7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7QUNONk07QUFDN00seUJBQXlCLHFFQUFhO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9FQUFvRTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3REFBd0QsNEVBQW9CO0FBQzVFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MseUVBQWlCLG1DQUFtQyw2RUFBcUIsUUFBUSw4RUFBc0IsZ0JBQWdCO0FBQ3pKO0FBQ0EsWUFBWSxvRUFBWTtBQUN4QjtBQUNBLDRCQUE0QiwwRUFBa0I7QUFDOUMsNkJBQTZCLDJFQUFtQjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3NyYy9tYWluL2dhbWVfb2ZfbGlmZV9kZWZhdWx0LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy93b3JrZXJzL2NhbnZhc193b3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG5jbGFzcyBCb29sZWFuQ2VsbCB7XG4gICAgY29uc3RydWN0b3IoYWxpdmUpIHtcbiAgICAgICAgdGhpcy5hbGl2ZSA9IGFsaXZlO1xuICAgIH1cbiAgICBnZXQgaXNBbGl2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWxpdmU7XG4gICAgfVxuICAgIHJlc2V0KCkge1xuICAgICAgICB0aGlzLmFsaXZlID0gZmFsc2U7XG4gICAgfVxuICAgIG5leHRTdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5hbGl2ZSA9ICF0aGlzLmFsaXZlO1xuICAgIH1cbn1cbmNsYXNzIENlbGxQb3NpdGlvbiB7XG4gICAgY29uc3RydWN0b3IoeFBvcywgeVBvcykge1xuICAgICAgICB0aGlzLnhQb3MgPSB4UG9zO1xuICAgICAgICB0aGlzLnlQb3MgPSB5UG9zO1xuICAgIH1cbiAgICBnZXQgeFBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy54UG9zO1xuICAgIH1cbiAgICBnZXQgeVBvc2l0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy55UG9zO1xuICAgIH1cbiAgICB0b1N0cmluZygpIHtcbiAgICAgICAgcmV0dXJuIFwieFwiICsgdGhpcy54UG9zICsgXCIteVwiICsgdGhpcy55UG9zO1xuICAgIH1cbn1cbmNsYXNzIFNoYXBlIHtcbiAgICBpbkJvdW5kc1Bvcyhwb3NpdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy5pbkJvdW5kcyhwb3NpdGlvbi54UG9zLCBwb3NpdGlvbi55UG9zKTtcbiAgICB9XG59XG5jbGFzcyBSZWN0YW5nbGUgZXh0ZW5kcyBTaGFwZSB7XG4gICAgY29uc3RydWN0b3IobG93ZXJMZWZ0Q29ybmVyLCB1cHBlclJpZ2h0Q29ybmVyKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMubG93ZXJMZWZ0Q29ybmVyID0gbG93ZXJMZWZ0Q29ybmVyO1xuICAgICAgICB0aGlzLnVwcGVyUmlnaHRDb3JuZXIgPSB1cHBlclJpZ2h0Q29ybmVyO1xuICAgIH1cbiAgICBpbkJvdW5kcyh4UG9zLCB5UG9zKSB7XG4gICAgICAgIHJldHVybiAoeFBvcyA+IHRoaXMubG93ZXJMZWZ0Q29ybmVyLnhQb3MgJiZcbiAgICAgICAgICAgIHhQb3MgPCB0aGlzLnVwcGVyUmlnaHRDb3JuZXIueVBvcyAmJlxuICAgICAgICAgICAgeVBvcyA+IHRoaXMubG93ZXJMZWZ0Q29ybmVyLnlQb3MgJiZcbiAgICAgICAgICAgIHlQb3MgPCB0aGlzLnVwcGVyUmlnaHRDb3JuZXIueVBvcyk7XG4gICAgfVxufVxuY2xhc3MgU2hhcGVkQ29ud2F5R2FtZVJ1bGUge1xuICAgIGNvbnN0cnVjdG9yKHNoYXBlLCB2aWV3ZWRfY2VsbHMsIGFsaXZlX2dvZXNfdG9fbmV4dF9zdGF0ZSA9IFsyLCAzXSwgLy8gRklYTUUgc3RhdGUgaW50aWFsaXNhdGlvblxuICAgIGRlYWRfZ29lc190b19uZXh0X3N0YXRlID0gWzNdKSB7XG4gICAgICAgIHRoaXMuc2hhcGUgPSBzaGFwZTtcbiAgICAgICAgdGhpcy52aWV3ZWRfY2VsbF9wb3NpdGlvbnMgPSB2aWV3ZWRfY2VsbHM7XG4gICAgICAgIHRoaXMuYWxpdmVfZ29lc190b19uZXh0X3N0YXRlID0gYWxpdmVfZ29lc190b19uZXh0X3N0YXRlO1xuICAgICAgICB0aGlzLmRlYWRfZ29lc190b19uZXh0X3N0YXRlID0gZGVhZF9nb2VzX3RvX25leHRfc3RhdGU7XG4gICAgICAgIHRoaXMubGFzdF9jZWxsX3doaWNoX2RpZWQgPSBudWxsO1xuICAgIH1cbiAgICBydWxlQ2FuQmVBcHBsaWVkKHBvc2l0aW9uKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYXBlID09IG51bGwgfHwgKHRoaXMuc2hhcGUgIT0gbnVsbCAmJiAhdGhpcy5zaGFwZS5pbkJvdW5kc1Bvcyhwb3NpdGlvbikpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGFwcGx5UnVsZU9uUG9zKHhQb3MsIHlQb3MsIGNvbndheUdhbWUpIHtcbiAgICAgICAgY29uc3QgY2VsbCA9IGNvbndheUdhbWUuYWN0aXZlRmllbGQuZ2V0X2NlbGwoeFBvcywgeVBvcyk7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IGNvbndheUdhbWUuYWN0aXZlRmllbGQuYm9yZGVyX2ZpeGVkX3J1bGVzKG5ldyBDZWxsUG9zaXRpb24oeFBvcywgeVBvcykpO1xuICAgICAgICBpZiAoIXRoaXMucnVsZUNhbkJlQXBwbGllZChwb3NpdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBjb253YXlHYW1lO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGxpdmluZ19uZWlnaGJvdXJfY291bnQgPSBjb253YXlHYW1lLmFjdGl2ZUZpZWxkLmNlbGxfbGl2aW5nX25laWdoYm91cnMocG9zaXRpb24ueFBvcywgcG9zaXRpb24ueVBvcywgdGhpcy52aWV3ZWRfY2VsbF9wb3NpdGlvbnMpO1xuICAgICAgICBjb25zdCBpc19hbGl2ZV9uZWlnaGJvdXJfY291bnQgPSB0aGlzLmFsaXZlX2dvZXNfdG9fbmV4dF9zdGF0ZS5zb21lKCh2YWx1ZSkgPT4gbGl2aW5nX25laWdoYm91cl9jb3VudCA9PSB2YWx1ZSk7XG4gICAgICAgIGNvbnN0IGlzX2RlYWRfbmVpZ2hib3VyX2NvdW50ID0gdGhpcy5kZWFkX2dvZXNfdG9fbmV4dF9zdGF0ZS5zb21lKCh2YWx1ZSkgPT4gbGl2aW5nX25laWdoYm91cl9jb3VudCA9PSB2YWx1ZSk7XG4gICAgICAgIGxldCBuZXh0Q2VsbCA9IGNvbndheUdhbWUuaW5hY3RpdmVGaWVsZC5nZXRfY2VsbChwb3NpdGlvbi54UG9zLCBwb3NpdGlvbi55UG9zKTtcbiAgICAgICAgaWYgKGNlbGwuaXNBbGl2ZSAmJiBpc19hbGl2ZV9uZWlnaGJvdXJfY291bnQpIHtcbiAgICAgICAgICAgIG5leHRDZWxsLm5leHRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFjZWxsLmlzQWxpdmUgJiYgaXNfZGVhZF9uZWlnaGJvdXJfY291bnQpIHtcbiAgICAgICAgICAgIG5leHRDZWxsLm5leHRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNlbGwuaXNBbGl2ZSlcbiAgICAgICAgICAgIHRoaXMubGFzdF9jZWxsX3doaWNoX2RpZWQgPSBuZXcgQ2VsbFBvc2l0aW9uKHBvc2l0aW9uLnhQb3MsIHBvc2l0aW9uLnlQb3MpO1xuICAgICAgICByZXR1cm4gY29ud2F5R2FtZTtcbiAgICB9XG4gICAgZ2V0SWZMYXN0Q2VsbEtpbGxlZEF0UG9zaXRpb24oKSB7XG4gICAgICAgIGxldCBjZWxsID0gdGhpcy5sYXN0X2NlbGxfd2hpY2hfZGllZDtcbiAgICAgICAgdGhpcy5sYXN0X2NlbGxfd2hpY2hfZGllZCA9IG51bGw7XG4gICAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cbn1cbmNsYXNzIENvbndheUZpZWxkIHtcbiAgICBjb25zdHJ1Y3RvcihweFNpemUsIHB5U2l6ZSwgYm9yZGVyUnVsZXMgPSBcImN1dG9mZlwiKSB7XG4gICAgICAgIHRoaXMueFNpemUgPSBweFNpemU7XG4gICAgICAgIHRoaXMueVNpemUgPSBweVNpemU7XG4gICAgICAgIHRoaXMuZ2FtZUZpZWxkID0gdGhpcy5jcmVhdGVfZW1wdHlfY29ud2F5c19jZWxsX2FycmF5KCk7XG4gICAgICAgIHRoaXMuYm9yZGVyUnVsZXMgPSBib3JkZXJSdWxlcztcbiAgICAgICAgdGhpcy5fbGl2aW5nX2NlbGxfY291bnQgPSAwO1xuICAgIH1cbiAgICBjcmVhdGVfZW1wdHlfY29ud2F5c19jZWxsX2FycmF5KCkge1xuICAgICAgICBsZXQgYXJyID0gbmV3IEFycmF5KHRoaXMueVNpemUpLmZpbGwoZmFsc2UpLm1hcCgoKSA9PiBuZXcgQXJyYXkodGhpcy54U2l6ZSkuZmlsbChmYWxzZSkpO1xuICAgICAgICByZXR1cm4gYXJyLm1hcCgodmVjdG9yLCBpLCBhcnIpID0+IHZlY3Rvci5tYXAoKGVsLCBpLCBhcnIpID0+IG5ldyBCb29sZWFuQ2VsbChmYWxzZSkpKTtcbiAgICB9XG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuZ2FtZUZpZWxkID0gdGhpcy5jcmVhdGVfZW1wdHlfY29ud2F5c19jZWxsX2FycmF5KCk7XG4gICAgICAgIHRoaXMuX2xpdmluZ19jZWxsX2NvdW50ID0gMDtcbiAgICB9XG4gICAgZ2V0IGxpdmluZ19jZWxsX3BlcmNlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saXZpbmdfY2VsbF9jb3VudCAvICh0aGlzLnhTaXplICogdGhpcy55U2l6ZSk7XG4gICAgfVxuICAgIGNvdW50X2xpdmluZ19jZWxscygpIHtcbiAgICAgICAgZm9yIChsZXQgaW5kZXhYID0gMDsgaW5kZXhYIDwgdGhpcy54U2l6ZTsgaW5kZXhYKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4WSA9IDA7IGluZGV4WSA8IHRoaXMueVNpemU7IGluZGV4WSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ2V0X2NlbGwoaW5kZXhYLCBpbmRleFkpLmlzQWxpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGl2aW5nX2NlbGxfY291bnQgKz0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0X2NlbGwoeFBvcywgeVBvcykge1xuICAgICAgICBsZXQgY2VsbFBvcyA9IHRoaXMuYm9yZGVyX2ZpeGVkX3J1bGVzKG5ldyBDZWxsUG9zaXRpb24oeFBvcywgeVBvcykpO1xuICAgICAgICByZXR1cm4gdGhpcy5nYW1lRmllbGRbY2VsbFBvcy55UG9zXVtjZWxsUG9zLnhQb3NdO1xuICAgIH1cbiAgICBzZXRfY2VsbCh4UG9zLCB5UG9zLCB2YWx1ZSkge1xuICAgICAgICBsZXQgY2VsbFBvcyA9IHRoaXMuYm9yZGVyX2ZpeGVkX3J1bGVzKG5ldyBDZWxsUG9zaXRpb24oeFBvcywgeVBvcykpO1xuICAgICAgICBpZiAodmFsdWUuaXNBbGl2ZSkge1xuICAgICAgICAgICAgdGhpcy5fbGl2aW5nX2NlbGxfY291bnQgKz0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhbWVGaWVsZFtjZWxsUG9zLnlQb3NdW2NlbGxQb3MueFBvc10gPSB2YWx1ZTtcbiAgICB9XG4gICAgYm9yZGVyX2ZpeGVkX3J1bGVzKHBvcykge1xuICAgICAgICBsZXQgeFBvc0ZpeGVkID0gcG9zLnhQb3M7XG4gICAgICAgIGxldCB5UG9zRml4ZWQgPSBwb3MueVBvcztcbiAgICAgICAgaWYgKHRoaXMuYm9yZGVyUnVsZXMgPT0gXCJjdXRvZmZcIikge1xuICAgICAgICAgICAgaWYgKHBvcy54UG9zID4gdGhpcy54U2l6ZSkge1xuICAgICAgICAgICAgICAgIHhQb3NGaXhlZCA9IHRoaXMueFNpemUgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvcy55UG9zID4gdGhpcy55U2l6ZSkge1xuICAgICAgICAgICAgICAgIHlQb3NGaXhlZCA9IHRoaXMueVNpemUgLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBvcy55UG9zIDwgMCkge1xuICAgICAgICAgICAgICAgIHlQb3NGaXhlZCA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocG9zLnhQb3MgPCAwKSB7XG4gICAgICAgICAgICAgICAgeFBvc0ZpeGVkID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwb3M7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcy54UG9zID49IHRoaXMueFNpemUpIHtcbiAgICAgICAgICAgIHhQb3NGaXhlZCA9IHBvcy54UG9zICUgdGhpcy54U2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocG9zLnhQb3MgPCAwKSB7XG4gICAgICAgICAgICB4UG9zRml4ZWQgPSAocG9zLnhQb3MgJSB0aGlzLnhTaXplKSAqIC0xO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwb3MueVBvcyA+PSB0aGlzLnlTaXplKSB7XG4gICAgICAgICAgICB5UG9zRml4ZWQgPSBwb3MueVBvcyAlIHRoaXMueVNpemU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBvcy55UG9zIDwgMCkge1xuICAgICAgICAgICAgeVBvc0ZpeGVkID0gKHBvcy55UG9zICUgdGhpcy55U2l6ZSkgKiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IENlbGxQb3NpdGlvbih4UG9zRml4ZWQsIHlQb3NGaXhlZCk7XG4gICAgfVxuICAgIGNlbGxfbGl2aW5nX25laWdoYm91cnMoaW5kZXhYLCBpbmRleFksIGxvb2tpbmdBdCkge1xuICAgICAgICBsZXQgY291bnQgPSAwO1xuICAgICAgICBsb29raW5nQXQuZm9yRWFjaCgobGlzdCwgdmFsLCBhcnIpID0+IHtcbiAgICAgICAgICAgIGxldCB4MSA9IGxpc3QueFBvc2l0aW9uO1xuICAgICAgICAgICAgbGV0IHkxID0gbGlzdC55UG9zaXRpb247XG4gICAgICAgICAgICBsZXQgYSA9IGluZGV4WCArIHgxO1xuICAgICAgICAgICAgbGV0IGIgPSBpbmRleFkgKyB5MTtcbiAgICAgICAgICAgIGlmICh0aGlzLmluX2ZpZWxkKGEsIGIpICYmIHRoaXMuZ2V0X2NlbGwoYSwgYikuaXNBbGl2ZSkge1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGluX2ZpZWxkKGluZGV4WCwgaW5kZXhZKSB7XG4gICAgICAgIGlmICh0aGlzLmJvcmRlclJ1bGVzID09IFwiZXh0ZW5kXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGxldCBpbkZpZWxkID0gaW5kZXhYID4gMCAmJiBpbmRleFkgPiAwICYmIGluZGV4WCA8IHRoaXMueFNpemUgJiYgaW5kZXhZIDwgdGhpcy55U2l6ZTtcbiAgICAgICAgcmV0dXJuIGluRmllbGQ7XG4gICAgfVxufVxuY2xhc3MgQ29ud2F5R2FtZSB7XG4gICAgY29uc3RydWN0b3IocHhTaXplLCBweVNpemUsIGNlbGxzLCBydWxlcywgZmFsbGJhY2tSdWxlID0gbnVsbCwgYm9yZGVyUnVsZXMgPSBcImN1dG9mZlwiKSB7XG4gICAgICAgIHRoaXMueFNpemUgPSBweFNpemU7XG4gICAgICAgIHRoaXMueVNpemUgPSBweVNpemU7XG4gICAgICAgIHRoaXMuYm9yZGVyUnVsZXMgPSBib3JkZXJSdWxlcztcbiAgICAgICAgaWYgKGNlbGxzID09IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudEdhbWVGaWVsZCA9IHRoaXMuY3JlYXRlR2FtZUZpZWxkKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRHYW1lRmllbGQgPSBjZWxscztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RHYW1lRmllbGQgPSB0aGlzLmNyZWF0ZUdhbWVGaWVsZCgpO1xuICAgICAgICB0aGlzLmFjdGl2ZUdhbWVGaWVsZEtpbmQgPSBcImN1cnJlbnRcIjtcbiAgICAgICAgdGhpcy5mYWxsYmFja1J1bGUgPSBmYWxsYmFja1J1bGU7XG4gICAgICAgIHRoaXMucG9zaXRpb25hbF9ydWxlcyA9IHJ1bGVzO1xuICAgICAgICB0aGlzLmxhc3RTdGVwRGllZENlbGxzID0gW107XG4gICAgfVxuICAgIGNsZWFyX2ZpZWxkKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZUZpZWxkLmNsZWFyKCk7XG4gICAgfVxuICAgIGNyZWF0ZUdhbWVGaWVsZCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDb253YXlGaWVsZCh0aGlzLnhTaXplLCB0aGlzLnlTaXplLCB0aGlzLmJvcmRlclJ1bGVzKTtcbiAgICB9XG4gICAgZ2V0IGxpdmluZ19jZWxsX2NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5saXZpbmdfY2VsbF9jb3VudDtcbiAgICB9XG4gICAgZ2V0IGFjdGl2ZUZpZWxkKCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVHYW1lRmllbGRLaW5kID09IFwiY3VycmVudFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50R2FtZUZpZWxkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdEdhbWVGaWVsZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXQgaW5hY3RpdmVGaWVsZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZlR2FtZUZpZWxkS2luZCA9PSBcImN1cnJlbnRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubGFzdEdhbWVGaWVsZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRHYW1lRmllbGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2V0T25BY3RpdmVGaWVsZCh4UG9zLCB5UG9zLCBjZWxsKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlRmllbGQuc2V0X2NlbGwoeFBvcywgeVBvcywgY2VsbCk7XG4gICAgfVxuICAgIGdldEN1cnJlbnRDZWxsKHhQb3MsIHlQb3MpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlRmllbGQuZ2V0X2NlbGwoeFBvcywgeVBvcyk7XG4gICAgfVxuICAgIG5leHRTdGF0ZSgpIHtcbiAgICAgICAgdGhpcy5sYXN0U3RlcERpZWRDZWxscyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpbmRleFggPSAwOyBpbmRleFggPCB0aGlzLnhTaXplOyBpbmRleFgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaW5kZXhZID0gMDsgaW5kZXhZIDwgdGhpcy55U2l6ZTsgaW5kZXhZKyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluYWN0aXZlRmllbGQuZ2V0X2NlbGwoaW5kZXhYLCBpbmRleFkpLnJlc2V0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5wb3NpdGlvbmFsX3J1bGVzLmZvckVhY2goKHJ1bGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBkcnkgdGhpc1xuICAgICAgICAgICAgICAgICAgICBydWxlLmFwcGx5UnVsZU9uUG9zKGluZGV4WCwgaW5kZXhZLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9wdGlvbmFsX2NlbGwgPSBydWxlLmdldElmTGFzdENlbGxLaWxsZWRBdFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcHRpb25hbF9jZWxsICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFN0ZXBEaWVkQ2VsbHMucHVzaChvcHRpb25hbF9jZWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZhbGxiYWNrUnVsZVNob3VsZEJlQXBwbGllZChpbmRleFgsIGluZGV4WSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mYWxsYmFja1J1bGUuYXBwbHlSdWxlT25Qb3MoaW5kZXhYLCBpbmRleFksIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgb3B0aW9uYWxfY2VsbCA9ICh0aGlzLmZhbGxiYWNrUnVsZSkuZ2V0SWZMYXN0Q2VsbEtpbGxlZEF0UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbmFsX2NlbGwgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0U3RlcERpZWRDZWxscy5wdXNoKG9wdGlvbmFsX2NlbGwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3dpdGNoQWN0aXZlR2FtZUZpZWxkKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBmYWxsYmFja1J1bGVTaG91bGRCZUFwcGxpZWQoaW5kZXhYLCBpbmRleFkpIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25hbFJ1bGVzQXBwbGljYWJsZSA9IHRoaXMucG9zaXRpb25hbF9ydWxlcy5zb21lKChydWxlLCBpLCBhcnIpID0+IHJ1bGUucnVsZUNhbkJlQXBwbGllZChuZXcgQ2VsbFBvc2l0aW9uKGluZGV4WCwgaW5kZXhZKSkpO1xuICAgICAgICByZXR1cm4gIXBvc2l0aW9uYWxSdWxlc0FwcGxpY2FibGUgJiYgdGhpcy5mYWxsYmFja1J1bGUgIT0gbnVsbDtcbiAgICB9XG4gICAgc3dpdGNoQWN0aXZlR2FtZUZpZWxkKCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVHYW1lRmllbGRLaW5kID09IFwibGFzdFwiKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUdhbWVGaWVsZEtpbmQgPSBcImN1cnJlbnRcIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlR2FtZUZpZWxkS2luZCA9IFwibGFzdFwiO1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldExhc3RTdGVwRGllZENlbGxQb3NpdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RTdGVwRGllZENlbGxzO1xuICAgIH1cbn1cbmNsYXNzIFJlc2V0R2FtZVJ1bGUge1xuICAgIGNvbnN0cnVjdG9yKHJlc2V0X3BlcmNlbnQsIHJlcGxhY2luZ19mYWN0b3J5KSB7XG4gICAgICAgIHRoaXMucmVzZXRfcGVyY2VudCA9IHJlc2V0X3BlcmNlbnQ7XG4gICAgICAgIHRoaXMuZWRpdGluZ19jb253YXlfZmFjdG9yeSA9IHJlcGxhY2luZ19mYWN0b3J5O1xuICAgIH1cbiAgICBuZXh0R2FtZVdpdGhSdWxlKGNvbndheUdhbWUpIHtcbiAgICAgICAgaWYgKGNvbndheUdhbWUuYWN0aXZlRmllbGQubGl2aW5nX2NlbGxfcGVyY2VudCA+IHRoaXMucmVzZXRfcGVyY2VudCkge1xuICAgICAgICAgICAgdGhpcy5lZGl0aW5nX2NvbndheV9mYWN0b3J5LmNpcmNsZSg1LCAxLCB1bmRlZmluZWQsIGNvbndheUdhbWUpOyAvLyBUT0RPIG1ha2UgY3JlYXRpb24gZnVuY3Rpb24gdGFrZSBhbiBvYmplY3RcbiAgICAgICAgfVxuICAgIH1cbn1cbmNsYXNzIENvbndheUdhbWVBZHZhbmNlciBleHRlbmRzIENvbndheUdhbWUge1xuICAgIGNvbnN0cnVjdG9yKHB4U2l6ZSwgcHlTaXplLCBjZWxscywgcnVsZXMsIGZhbGxiYWNrUnVsZSA9IG51bGwsIGJvcmRlclJ1bGVzID0gXCJjdXRvZmZcIiwgZ2VuZXJhbFJ1bGVzKSB7XG4gICAgICAgIHN1cGVyKHB4U2l6ZSwgcHlTaXplLCBjZWxscywgcnVsZXMsIGZhbGxiYWNrUnVsZSwgYm9yZGVyUnVsZXMpO1xuICAgICAgICB0aGlzLmdlbmVyYWxSdWxlcyA9IGdlbmVyYWxSdWxlcztcbiAgICB9XG4gICAgc3RhdGljIGZyb21Db253YXlHYW1lKGNvbndheUdhbWUsIGdlbmVyYWxSdWxlcyA9IG51bGwpIHtcbiAgICAgICAgbGV0IGdlbmVyYWxSID0gZ2VuZXJhbFJ1bGVzICE9PSBudWxsICYmIGdlbmVyYWxSdWxlcyAhPT0gdm9pZCAwID8gZ2VuZXJhbFJ1bGVzIDogW107XG4gICAgICAgIHJldHVybiBuZXcgdGhpcyhjb253YXlHYW1lLnhTaXplLCBjb253YXlHYW1lLnlTaXplLCBjb253YXlHYW1lLmFjdGl2ZUZpZWxkLCBjb253YXlHYW1lLnBvc2l0aW9uYWxfcnVsZXMsIGNvbndheUdhbWUuZmFsbGJhY2tSdWxlLCBjb253YXlHYW1lLmJvcmRlclJ1bGVzLCBnZW5lcmFsUik7XG4gICAgfVxuICAgIG5leHRTdGF0ZSgpIHtcbiAgICAgICAgZm9yIChjb25zdCBydWxlIG9mIHRoaXMuZ2VuZXJhbFJ1bGVzKSB7XG4gICAgICAgICAgICBydWxlLm5leHRHYW1lV2l0aFJ1bGUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIubmV4dFN0YXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBhZGRQYXRoKHBvcykge1xuICAgICAgICBsZXQgcGF0aCA9IHRoaXMuY2FsY1BhdGgocG9zKTtcbiAgICAgICAgZm9yIChjb25zdCBwb3NpdGlvbiBvZiBwYXRoKSB7XG4gICAgICAgICAgICB0aGlzLmdldEN1cnJlbnRDZWxsKHBvc2l0aW9uLnhQb3MsIHBvc2l0aW9uLnlQb3MpLm5leHRTdGF0ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhbGNQYXRoKHBvcykge1xuICAgICAgICBsZXQgcmVzdWx0UGF0aCA9IG5ldyBTZXQoKTtcbiAgICAgICAgY29uc3QgeFN0YXJ0ID0gTWF0aC5yb3VuZChwb3Muc3RhcnRQb3MueFBvcyk7XG4gICAgICAgIGNvbnN0IHlTdGFydCA9IE1hdGgucm91bmQocG9zLnN0YXJ0UG9zLnlQb3MpO1xuICAgICAgICBjb25zdCB4RW5kID0gTWF0aC5yb3VuZChwb3MuZW5kUG9zLnhQb3MpO1xuICAgICAgICBjb25zdCB5RW5kID0gTWF0aC5yb3VuZChwb3MuZW5kUG9zLnlQb3MpO1xuICAgICAgICBjb25zdCB5RGlmID0geUVuZCAtIHlTdGFydDtcbiAgICAgICAgY29uc3QgeERpZiA9IHhFbmQgLSB4U3RhcnQ7XG4gICAgICAgIGxldCB4T2Zmc2V0ID0gMDtcbiAgICAgICAgbGV0IHlPZmZzZXQgPSAwO1xuICAgICAgICBpZiAoeERpZiA9PSAwKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBjdXJ5RGlmID0gMDsgY3VyeURpZiA8PSBNYXRoLmFicyh5RGlmKTsgY3VyeURpZisrKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0UGF0aC5hZGQobmV3IENlbGxQb3NpdGlvbihNYXRoLnJvdW5kKHhTdGFydCksIE1hdGgucm91bmQoeVN0YXJ0ICsgY3VyeURpZikpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh5RGlmID09IDApIHtcbiAgICAgICAgICAgIGZvciAobGV0IGN1cnhEaWYgPSAwOyBjdXJ4RGlmIDw9IE1hdGguYWJzKHhEaWYpOyBjdXJ4RGlmKyspIHtcbiAgICAgICAgICAgICAgICByZXN1bHRQYXRoLmFkZChuZXcgQ2VsbFBvc2l0aW9uKE1hdGgucm91bmQoeFN0YXJ0ICsgY3VyeERpZiksIE1hdGgucm91bmQoeVN0YXJ0KSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcG9pbnREaXN0YW5jZSA9IE1hdGguc3FydChNYXRoLnBvdyh4RGlmLCAyKSArIE1hdGgucG93KHlEaWYsIDIpKTtcbiAgICAgICAgICAgIGxldCBtID0geURpZiAvIHhEaWY7XG4gICAgICAgICAgICBsZXQgeFBvcyA9IDA7XG4gICAgICAgICAgICBpZiAobSA+IDApIHtcbiAgICAgICAgICAgICAgICB4UG9zID0gTWF0aC5taW4oeFN0YXJ0LCB4RW5kKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHhQb3MgPSBNYXRoLm1heCh4U3RhcnQsIHhFbmQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGIgPSB5RW5kIC0gbSAqIHhFbmQ7XG4gICAgICAgICAgICBmb3IgKGxldCBjdXJEaXN0ID0gMDsgY3VyRGlzdCA8IHBvaW50RGlzdGFuY2UgLyBNYXRoLmFicyhtKSAtIE1hdGguYWJzKG0pOyBjdXJEaXN0ICs9IDEpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRQYXRoLmFkZChuZXcgQ2VsbFBvc2l0aW9uKE1hdGgucm91bmQoeFBvcyksIE1hdGgucm91bmQobSAqIHhQb3MgKyBiKSkpO1xuICAgICAgICAgICAgICAgIHhQb3MgKz0gbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gQXJyYXkub2YoLi4ucmVzdWx0UGF0aC5rZXlzKCkpO1xuICAgIH1cbn1cbmNsYXNzIENvbndheUdhbWVGYWN0b3J5IHtcbiAgICBjb25zdHJ1Y3Rvcih4U2l6ZSwgeVNpemUsIHJ1bGVzLCBhbGl2ZUNlbGxTdGF0ZSwgZmFsbGJhY2tSdWxlID0gbnVsbCwgYm9yZGVyUnVsZXMgPSBcImN1dG9mZlwiKSB7XG4gICAgICAgIHRoaXMueFNpemUgPSB4U2l6ZTtcbiAgICAgICAgdGhpcy55U2l6ZSA9IHlTaXplO1xuICAgICAgICB0aGlzLnJ1bGVzID0gcnVsZXM7XG4gICAgICAgIHRoaXMuYm9yZGVyUnVsZXMgPSBib3JkZXJSdWxlcztcbiAgICAgICAgdGhpcy5hbGl2ZUNlbGxTdGF0ZSA9IGFsaXZlQ2VsbFN0YXRlO1xuICAgICAgICB0aGlzLmZhbGxiYWNrUnVsZSA9IGZhbGxiYWNrUnVsZTtcbiAgICB9XG4gICAgY2VudGVyZWRmUGVudG9taW5vKGNvbndheV9nYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLnhTaXplIDwgMyAmJiB0aGlzLnlTaXplIDwgMykge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkNhbm5vdCBjcmVhdGUgYSBQZW50b21pbm8gaW4gYSBmaWVsZCBzbWFsbGVyIHRoYW4gMyB0aW1lcyAzXCIpO1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ2V0X2NlbnRlcigpO1xuICAgICAgICBpZiAoY29ud2F5X2dhbWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZSA9IHRoaXMuY3JlYXRlX2NvbndheV9nYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZS5jbGVhcl9maWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbndheV9nYW1lLnNldE9uQWN0aXZlRmllbGQocG9zLnhQb3MsIHBvcy55UG9zLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKHBvcy54UG9zLCBwb3MueVBvcyArIDEsIG5ldyBCb29sZWFuQ2VsbCh0aGlzLmFsaXZlQ2VsbFN0YXRlKSk7XG4gICAgICAgIGNvbndheV9nYW1lLnNldE9uQWN0aXZlRmllbGQocG9zLnhQb3MsIHBvcy55UG9zIC0gMSwgbmV3IEJvb2xlYW5DZWxsKHRoaXMuYWxpdmVDZWxsU3RhdGUpKTtcbiAgICAgICAgY29ud2F5X2dhbWUuc2V0T25BY3RpdmVGaWVsZChwb3MueFBvcyAtIDEsIHBvcy55UG9zLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKHBvcy54UG9zICsgMSwgcG9zLnlQb3MgKyAxLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICByZXR1cm4gY29ud2F5X2dhbWU7XG4gICAgfVxuICAgIGNyZWF0ZV9jb253YXlfZ2FtZSgpIHtcbiAgICAgICAgbGV0IGNvbndheV9nYW1lID0gbmV3IENvbndheUdhbWUodGhpcy54U2l6ZSwgdGhpcy55U2l6ZSwgbnVsbCwgdGhpcy5ydWxlcywgdGhpcy5mYWxsYmFja1J1bGUsIHRoaXMuYm9yZGVyUnVsZXMpO1xuICAgICAgICByZXR1cm4gY29ud2F5X2dhbWU7XG4gICAgfVxuICAgIGNpcmNsZShyYWRpdXMsIHN0ZXBzID0gMSAvICgyICogTWF0aC5QSSksIG9mZnNldHMgPSB1bmRlZmluZWQsIGNvbndheV9nYW1lID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIFRPRE8gZml4IHR5cGUgKyB1c2VcbiAgICAgICAgbGV0IHBvcyA9IHRoaXMuZ2V0X2NlbnRlcigpO1xuICAgICAgICBvZmZzZXRzID0gb2Zmc2V0cyAhPT0gbnVsbCAmJiBvZmZzZXRzICE9PSB2b2lkIDAgPyBvZmZzZXRzIDogW25ldyBDZWxsUG9zaXRpb24oMCwgMCldO1xuICAgICAgICBpZiAoY29ud2F5X2dhbWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZSA9IHRoaXMuY3JlYXRlX2NvbndheV9nYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZS5jbGVhcl9maWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgb2Zmc2V0IG9mIG9mZnNldHMpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gY2FsYyBvdmVybGFwIG9mIHNoYXBlZFxuICAgICAgICAgICAgZm9yIChsZXQgcmFkaXVzSW5jID0gMDsgcmFkaXVzSW5jIDwgcmFkaXVzOyByYWRpdXNJbmMrKykge1xuICAgICAgICAgICAgICAgIGxldCBwb3NUb1JvdGF0ZSA9IG5ldyBDZWxsUG9zaXRpb24oMCwgcmFkaXVzSW5jKTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBhbmdsZSA9IDA7IGFuZ2xlIDwgMiAqIE1hdGguUEk7IGFuZ2xlICs9IHN0ZXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBuZXdYUG9zID0gcG9zLnhQb3MgLVxuICAgICAgICAgICAgICAgICAgICAgICAgTWF0aC5yb3VuZChwb3NUb1JvdGF0ZS54UG9zICogTWF0aC5jb3MoYW5nbGUpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb3NUb1JvdGF0ZS55UG9zICogLTEgKiBNYXRoLnNpbihhbmdsZSkpO1xuICAgICAgICAgICAgICAgICAgICBsZXQgbmV3WVBvcyA9IHBvcy55UG9zICtcbiAgICAgICAgICAgICAgICAgICAgICAgIE1hdGgucm91bmQocG9zVG9Sb3RhdGUueFBvcyAqIE1hdGguc2luKGFuZ2xlKSArIHBvc1RvUm90YXRlLnlQb3MgKiBNYXRoLmNvcyhhbmdsZSkpOyAvLyBUT0RPIG1vdmUgcG9zIGNhbGN1bGF0aW9uIG91dFxuICAgICAgICAgICAgICAgICAgICBjb253YXlfZ2FtZS5zZXRPbkFjdGl2ZUZpZWxkKG5ld1hQb3MgKyBvZmZzZXQueFBvcywgbmV3WVBvcyArIG9mZnNldC55UG9zLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY29ud2F5X2dhbWU7XG4gICAgfVxuICAgIHlsaW5lKGxlbmd0aCwgY29ud2F5X2dhbWUgPSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IGNlbnRlciA9IHRoaXMuZ2V0X2NlbnRlcigpO1xuICAgICAgICBpZiAoY29ud2F5X2dhbWUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZSA9IHRoaXMuY3JlYXRlX2NvbndheV9nYW1lKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb253YXlfZ2FtZS5jbGVhcl9maWVsZCgpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAobGV0IGN1ckxlbmd0aCA9IDA7IGN1ckxlbmd0aCA8IGxlbmd0aDsgY3VyTGVuZ3RoKyspIHtcbiAgICAgICAgICAgIGNvbndheV9nYW1lLnNldE9uQWN0aXZlRmllbGQoY2VudGVyLnhQb3MsIGNlbnRlci55UG9zICsgY3VyTGVuZ3RoLCBuZXcgQm9vbGVhbkNlbGwodGhpcy5hbGl2ZUNlbGxTdGF0ZSkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb253YXlfZ2FtZTtcbiAgICB9XG4gICAgZ2V0X2NlbnRlcigpIHtcbiAgICAgICAgbGV0IG1pZGRsZVggPSBNYXRoLmNlaWwodGhpcy54U2l6ZSAvIDIpO1xuICAgICAgICBsZXQgbWlkZGxlWSA9IE1hdGguY2VpbCh0aGlzLnlTaXplIC8gMik7XG4gICAgICAgIHJldHVybiBuZXcgQ2VsbFBvc2l0aW9uKG1pZGRsZVgsIG1pZGRsZVkpO1xuICAgIH1cbiAgICByYW5kb21pemVfY2VsbHMoYWxpdmVfYWJvdmUgPSAzLCBzY2FsZV9yYW5kID0gMTAsIGNvbndheV9nYW1lID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChjb253YXlfZ2FtZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbndheV9nYW1lID0gdGhpcy5jcmVhdGVfY29ud2F5X2dhbWUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbndheV9nYW1lLmNsZWFyX2ZpZWxkKCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChsZXQgaW5kZXhYID0gMDsgaW5kZXhYIDwgdGhpcy54U2l6ZTsgaW5kZXhYKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGluZGV4WSA9IDA7IGluZGV4WSA8IHRoaXMueVNpemU7IGluZGV4WSsrKSB7XG4gICAgICAgICAgICAgICAgbGV0IHJhbmRfdmFsID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogc2NhbGVfcmFuZCk7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmRfdmFsID49IGFsaXZlX2Fib3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbndheV9nYW1lLnNldE9uQWN0aXZlRmllbGQoaW5kZXhYLCBpbmRleFksIG5ldyBCb29sZWFuQ2VsbCh0aGlzLmFsaXZlQ2VsbFN0YXRlKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb253YXlfZ2FtZTtcbiAgICB9XG59XG5jbGFzcyBDZWxsQ29sb3Ige1xuICAgIGNvbnN0cnVjdG9yKHIsIGcsIGIsIGEpIHtcbiAgICAgICAgdGhpcy5yID0gcjtcbiAgICAgICAgdGhpcy5nID0gZztcbiAgICAgICAgdGhpcy5iID0gYjtcbiAgICAgICAgdGhpcy5hID0gYTtcbiAgICB9XG4gICAgc3RhdGljIGdldCBCTEFDSygpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBDZWxsQ29sb3IoMCwgMCwgMCwgMSk7XG4gICAgfVxuICAgIHN0YXRpYyBnZXQgV0hJVEUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2VsbENvbG9yKDI1NSwgMjU1LCAyNTUsIDEpO1xuICAgIH1cbiAgICBnZXQgZGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIFt0aGlzLnIsIHRoaXMuZywgdGhpcy5iLCB0aGlzLmFdO1xuICAgIH1cbiAgICBnZXQgcmdiYV9zdHIoKSB7XG4gICAgICAgIHJldHVybiBcInJnYmEoXCIgKyB0aGlzLnIgKyBcIixcIiArIHRoaXMuZyArIFwiLFwiICsgdGhpcy5iICsgXCIsXCIgKyB0aGlzLmEgKyBcIilcIjtcbiAgICB9XG4gICAgY2xvbmUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgQ2VsbENvbG9yKHRoaXMuciwgdGhpcy5nLCB0aGlzLmIsIHRoaXMuYSk7XG4gICAgfVxufVxuY2xhc3MgRmFkaW5nQ2VsbENvbG9yIGV4dGVuZHMgQ2VsbENvbG9yIHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydF9yZXByLCBmYWRlX3N0cmVuZ3RoID0gMC44KSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSBzdGFydF9yZXByLmRhdGE7XG4gICAgICAgIHN1cGVyKGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0sIGRhdGFbM10pO1xuICAgICAgICB0aGlzLnN0YXJ0X3JlcHIgPSBzdGFydF9yZXByO1xuICAgICAgICB0aGlzLmNvbG9yX2ZhZGVfZmFjdG9yID0gZmFkZV9zdHJlbmd0aDtcbiAgICB9XG4gICAgZmFkZSh0aW1lcykge1xuICAgICAgICB0aGlzLnIgPSB0aGlzLnIgKiB0aGlzLmNvbG9yX2ZhZGVfZmFjdG9yICogdGltZXM7XG4gICAgICAgIHRoaXMuZyA9IHRoaXMuZyAqIHRoaXMuY29sb3JfZmFkZV9mYWN0b3IgKiB0aW1lcztcbiAgICAgICAgdGhpcy5iID0gdGhpcy5iICogdGhpcy5jb2xvcl9mYWRlX2ZhY3RvciAqIHRpbWVzO1xuICAgIH1cbn1cbmNsYXNzIENvbndheUdhbWVSZXByZXNlbnRlciB7XG4gICAgY29uc3RydWN0b3IoY29ud2F5X2dhbWUsIGNvbmZpZykge1xuICAgICAgICB0aGlzLmRlZmF1bHRfY2VsbF9hbGl2ZV9yZXByID0gXCLwn5+pXCI7XG4gICAgICAgIHRoaXMuZGVmYXVsdF9jZWxsX2RlYWRfcmVwciA9IFwi4qycXCI7XG4gICAgICAgIHRoaXMuY29ud2F5X2dhbWUgPSBjb253YXlfZ2FtZTtcbiAgICAgICAgdGhpcy5jZWxsX3JlcHJfYWxpdmUgPSBjb25maWcuYWxpdmVfY2VsbF9yZXByO1xuICAgICAgICB0aGlzLmNlbGxfcmVwcl9kZWFkID0gY29uZmlnLmRlYWRfY2VsbF9yZXByO1xuICAgICAgICB0aGlzLmNlbGxfcmVwcl90cmFuc3BhcmVudCA9IG5ldyBDZWxsQ29sb3IoMCwgMCwgMCwgMCk7XG4gICAgfVxuICAgIHJlcHJlc2VudGF0aW9uKGNlbGwpIHtcbiAgICAgICAgaWYgKGNlbGwuaXNBbGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdF9jZWxsX2FsaXZlX3JlcHI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdF9jZWxsX2RlYWRfcmVwcjtcbiAgICB9XG4gICAgc3RyX2ZpZWxkKCkge1xuICAgICAgICBsZXQgcmVzdWx0X3N0ciA9IFwiXCI7XG4gICAgICAgIGZvciAobGV0IGluZGV4WCA9IDA7IGluZGV4WCA8IHRoaXMuY29ud2F5X2dhbWUueFNpemU7IGluZGV4WCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleFkgPSAwOyBpbmRleFkgPCB0aGlzLmNvbndheV9nYW1lLnlTaXplOyBpbmRleFkrKykge1xuICAgICAgICAgICAgICAgIGxldCBjZWxsID0gdGhpcy5jb253YXlfZ2FtZS5nZXRDdXJyZW50Q2VsbChpbmRleFgsIGluZGV4WSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0X3N0ciArPSB0aGlzLnJlcHJlc2VudGF0aW9uKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzdWx0X3N0ciArPSBcIlxcblwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHRfc3RyO1xuICAgIH1cbiAgICBhc19udW1iZXJfY29sb3JzX2FycigpIHtcbiAgICAgICAgbGV0IHJlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmNvbndheV9nYW1lLnhTaXplICogdGhpcy5jb253YXlfZ2FtZS55U2l6ZSkuZmlsbCh0aGlzLmNlbGxfcmVwcl90cmFuc3BhcmVudCk7XG4gICAgICAgIGZvciAobGV0IGluZGV4WCA9IDA7IGluZGV4WCA8IHRoaXMuY29ud2F5X2dhbWUueFNpemU7IGluZGV4WCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpbmRleFkgPSAwOyBpbmRleFkgPCB0aGlzLmNvbndheV9nYW1lLnlTaXplOyBpbmRleFkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNvbndheV9nYW1lLmdldEN1cnJlbnRDZWxsKGluZGV4WCwgaW5kZXhZKTtcbiAgICAgICAgICAgICAgICBsZXQgb25lX2RpbV9pbmQgPSBpbmRleFggKyBpbmRleFkgKiB0aGlzLmNvbndheV9nYW1lLnhTaXplO1xuICAgICAgICAgICAgICAgIHJlc3VsdFtvbmVfZGltX2luZF0gPSBjZWxsLmlzQWxpdmUgPyB0aGlzLmNlbGxfcmVwcl9hbGl2ZSA6IHRoaXMuY2VsbF9yZXByX2RlYWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gICAgbnVtYmVyX2NvbG9yX2FycihpbmRleFgsIGluZGV4WSkge1xuICAgICAgICBjb25zdCBjZWxsID0gdGhpcy5jb253YXlfZ2FtZS5nZXRDdXJyZW50Q2VsbChpbmRleFgsIGluZGV4WSk7XG4gICAgICAgIHJldHVybiBjZWxsLmlzQWxpdmUgPyB0aGlzLmNlbGxfcmVwcl9hbGl2ZSA6IHRoaXMuY2VsbF9yZXByX2RlYWQ7XG4gICAgfVxufVxuY2xhc3MgQWdpbmdDZWxsUmVwciB7XG4gICAgY29uc3RydWN0b3IocG9zaXRpb24sIHN0YXJ0TGlmZSwgc3RhcnRfY2VsbF9yZXByKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24gPSBwb3NpdGlvbjtcbiAgICAgICAgdGhpcy5jdXJyZW50X2xpZmUgPSBzdGFydExpZmU7XG4gICAgICAgIHRoaXMuc3RhcnRfbGlmZSA9IHN0YXJ0TGlmZTtcbiAgICAgICAgdGhpcy5mYWRpbmdfY2VsbF9jb2xvciA9IG5ldyBGYWRpbmdDZWxsQ29sb3Ioc3RhcnRfY2VsbF9yZXByKTtcbiAgICB9XG4gICAgZ2V0IGNvbXBsZXRlbHlGYWRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudF9saWZlIDw9IDA7XG4gICAgfVxuICAgIGdldCBpc0FnZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXJ0X2xpZmUgIT0gdGhpcy5jdXJyZW50X2xpZmU7XG4gICAgfVxuICAgIGFnZSgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50X2xpZmUgLT0gMTtcbiAgICAgICAgdGhpcy5mYWRpbmdfY2VsbF9jb2xvci5mYWRlKDEpO1xuICAgIH1cbiAgICBnZXRfZmFkZWRfcmVwcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmFkaW5nX2NlbGxfY29sb3I7XG4gICAgfVxufVxuY2xhc3MgQ29ud2F5SFRNTERpc3BsYXllciB7XG4gICAgY29uc3RydWN0b3IoY2FudmFzLCBjb25maWcsIG5leHRDYW52YXNCaXRNYXAgPSBudWxsLCBwcmVSZW5kZXJDYW52YXMgPSBudWxsLCBiaXRtYXBDb250ZXh0ID0gbnVsbCkge1xuICAgICAgICB0aGlzLm5leHRDYW52YXNCaXRNYXAgPSBudWxsO1xuICAgICAgICB0aGlzLnByZVJlbmRlckNhbnZhcyA9IG51bGw7XG4gICAgICAgIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICAgICAgdGhpcy5wb3NUb0NlbGxXaXRoVmlzdWFsVHJhaWwgPSBuZXcgTWFwKCk7XG4gICAgICAgIGlmIChjYW52YXMgIT0gdW5kZWZpbmVkICYmIHByZVJlbmRlckNhbnZhcyAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLmJpdG1hcENvbnRleHQgPSAodGhpcy5jYW52YXMuZ2V0Q29udGV4dChcImJpdG1hcHJlbmRlcmVyXCIpKTtcbiAgICAgICAgICAgIHRoaXMubmV4dENhbnZhc0JpdE1hcCA9IG5leHRDYW52YXNCaXRNYXA7XG4gICAgICAgICAgICB0aGlzLnByZVJlbmRlckNhbnZhcyA9IHByZVJlbmRlckNhbnZhcztcbiAgICAgICAgICAgIGxldCBjb250ZXh0ID0gdGhpcy5wcmVSZW5kZXJDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIsIHsgYWxwaGE6IGZhbHNlIH0pO1xuICAgICAgICAgICAgaWYgKGNvbnRleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHJlUmVuZGVyQ29udGV4dCA9IGNvbnRleHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYW5kbGVDb25maWdVcGRhdGUoKTtcbiAgICAgICAgdGhpcy5jb25zdW1lVXBkYXRlcygpO1xuICAgIH1cbiAgICBhZGRWaXN1YWxUcmFpbENlbGxzQW5kQWdlVHJhaWwoY29ud2F5X2dhbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uZmlnLnRyYWlsX2xlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmV3X2NlbGxfdHJhaWxfcG9zaXRpb25zID0gY29ud2F5X2dhbWUuZ2V0TGFzdFN0ZXBEaWVkQ2VsbFBvc2l0aW9ucygpO1xuICAgICAgICBuZXdfY2VsbF90cmFpbF9wb3NpdGlvbnMuZm9yRWFjaCgocG9zLCBpLCBhcnIpID0+IHtcbiAgICAgICAgICAgIHRoaXMucG9zVG9DZWxsV2l0aFZpc3VhbFRyYWlsLnNldChwb3MudG9TdHJpbmcoKSwgbmV3IEFnaW5nQ2VsbFJlcHIocG9zLCB0aGlzLmNvbmZpZy50cmFpbF9sZW5ndGgsIHRoaXMuY29uZmlnLmFsaXZlX2NlbGxfcmVwcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBbcG9zU3RyaW5nLCB2YWxdIG9mIHRoaXMucG9zVG9DZWxsV2l0aFZpc3VhbFRyYWlsLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgdmFsLmFnZSgpO1xuICAgICAgICAgICAgbGV0IGFnaW5nUmVwciA9IHRoaXMucG9zVG9DZWxsV2l0aFZpc3VhbFRyYWlsLmdldChwb3NTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGFnaW5nUmVwciAhPSB1bmRlZmluZWQgJiYgKGFnaW5nUmVwciA9PT0gbnVsbCB8fCBhZ2luZ1JlcHIgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGFnaW5nUmVwci5jdXJyZW50X2xpZmUpIDw9IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBvc1RvQ2VsbFdpdGhWaXN1YWxUcmFpbC5kZWxldGUocG9zU3RyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB1cGRhdGVFbW9qaUdhbWVGaWVsZEFzU3RyaW5nKGNvbndheUdhbWUpIHtcbiAgICAgICAgbGV0IGdhbWVTcGFjZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZ2FtZUZpZWxkXCIpO1xuICAgICAgICBpZiAoZ2FtZVNwYWNlICE9IG51bGwpIHtcbiAgICAgICAgICAgIGxldCByZXByZXNlbnRlciA9IG5ldyBDb253YXlHYW1lUmVwcmVzZW50ZXIoY29ud2F5R2FtZSwgdGhpcy5jb25maWcpO1xuICAgICAgICAgICAgZ2FtZVNwYWNlLmlubmVySFRNTCA9IHJlcHJlc2VudGVyLnN0cl9maWVsZCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHByZXByZW5kZXJfYml0bWFwKGNvbndheUdhbWUpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgIGlmICghdGhpcy5jYW52YXMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihcIm5vIGNhbnZhcyBkZWZpbmVkXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmVwcmVzZW50ZXIgPSBuZXcgQ29ud2F5R2FtZVJlcHJlc2VudGVyKGNvbndheUdhbWUsIHRoaXMuY29uZmlnKTtcbiAgICAgICAgICAgIGNvbnN0IHhTaXplUmVjdCA9IHRoaXMuY2FudmFzLndpZHRoIC8gY29ud2F5R2FtZS54U2l6ZTtcbiAgICAgICAgICAgIGNvbnN0IHlTaXplUmVjdCA9IHRoaXMuY2FudmFzLmhlaWdodCAvIGNvbndheUdhbWUueVNpemU7XG4gICAgICAgICAgICBsZXQgY3VyX3Jlc19pbmRleCA9IDA7XG4gICAgICAgICAgICBsZXQgYWxpdmVQYXRoID0gW107XG4gICAgICAgICAgICBsZXQgZmFkaW5nUGF0aHMgPSBuZXcgTWFwKCk7XG4gICAgICAgICAgICBmb3IgKGxldCB4UG9zID0gMDsgeFBvcyA8IGNvbndheUdhbWUueFNpemU7IHhQb3MrKykge1xuICAgICAgICAgICAgICAgIGZvciAobGV0IHlQb3MgPSAwOyB5UG9zIDwgY29ud2F5R2FtZS55U2l6ZTsgeVBvcysrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb253YXlHYW1lLmdldEN1cnJlbnRDZWxsKHhQb3MsIHlQb3MpLmlzQWxpdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFsaXZlUGF0aC5wdXNoKFt4UG9zICogeFNpemVSZWN0LCB5UG9zICogeVNpemVSZWN0LCB4U2l6ZVJlY3QsIHlTaXplUmVjdF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZhZGluZ0NlbGwgPSB0aGlzLnBvc1RvQ2VsbFdpdGhWaXN1YWxUcmFpbC5nZXQobmV3IENlbGxQb3NpdGlvbih4UG9zLCB5UG9zKS50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZhZGluZ0NlbGwgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWZhZGluZ1BhdGhzLmhhcyhmYWRpbmdDZWxsLmN1cnJlbnRfbGlmZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWRpbmdQYXRocy5zZXQoZmFkaW5nQ2VsbC5jdXJyZW50X2xpZmUsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2VsbF9yZXByOiBmYWRpbmdDZWxsLmZhZGluZ19jZWxsX2NvbG9yLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmYWRpbmdQYXRoOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmYWRpbmdQYXRoID0gKF9hID0gZmFkaW5nUGF0aHMuZ2V0KGZhZGluZ0NlbGwuY3VycmVudF9saWZlKSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmZhZGluZ1BhdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBmYWRpbmdQYXRoID09PSBudWxsIHx8IGZhZGluZ1BhdGggPT09IHZvaWQgMCA/IHZvaWQgMCA6IGZhZGluZ1BhdGgucHVzaChbeFBvcyAqIHhTaXplUmVjdCwgeVBvcyAqIHlTaXplUmVjdCwgeFNpemVSZWN0LCB5U2l6ZVJlY3RdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjdXJfcmVzX2luZGV4Kys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucHJlUmVuZGVyQ29udGV4dCA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJObyBDb250ZXh0IGV4aXN0c1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucHJlUmVuZGVyQ29udGV4dC5pbWFnZVNtb290aGluZ0VuYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucHJlUmVuZGVyQ29udGV4dC5maWxsU3R5bGUgPSByZXByZXNlbnRlci5jZWxsX3JlcHJfZGVhZC5yZ2JhX3N0cjtcbiAgICAgICAgICAgIHRoaXMucHJlUmVuZGVyQ29udGV4dC5maWxsUmVjdCgwLCAwLCB0aGlzLmNhbnZhcy53aWR0aCwgdGhpcy5jYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgeyBjZWxsX3JlcHIsIGZhZGluZ1BhdGggfSBvZiBmYWRpbmdQYXRocy52YWx1ZXMoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGF0aCh0aGlzLnByZVJlbmRlckNvbnRleHQsIGNlbGxfcmVwciwgZmFkaW5nUGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlbmRlclBhdGgodGhpcy5wcmVSZW5kZXJDb250ZXh0LCByZXByZXNlbnRlci5jZWxsX3JlcHJfYWxpdmUsIGFsaXZlUGF0aCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmVSZW5kZXJDYW52YXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5leHRDYW52YXNCaXRNYXAgPSB0aGlzLnByZVJlbmRlckNhbnZhcy50cmFuc2ZlclRvSW1hZ2VCaXRtYXAoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlclBhdGgoY2FudmFzQ29udGV4dCwgY2VsbF9yZXByLCByZWN0UGF0aCkge1xuICAgICAgICBjYW52YXNDb250ZXh0ID09PSBudWxsIHx8IGNhbnZhc0NvbnRleHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhbnZhc0NvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNhbnZhc0NvbnRleHQuZmlsbFN0eWxlID0gY2VsbF9yZXByLnJnYmFfc3RyO1xuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcmVjdFBhdGgpIHtcbiAgICAgICAgICAgIGNhbnZhc0NvbnRleHQucmVjdChwYXRoWzBdLCBwYXRoWzFdLCBwYXRoWzJdLCBwYXRoWzNdKTtcbiAgICAgICAgfVxuICAgICAgICBjYW52YXNDb250ZXh0ID09PSBudWxsIHx8IGNhbnZhc0NvbnRleHQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGNhbnZhc0NvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgIGNhbnZhc0NvbnRleHQgPT09IG51bGwgfHwgY2FudmFzQ29udGV4dCA9PT0gdm9pZCAwID8gdm9pZCAwIDogY2FudmFzQ29udGV4dC5maWxsKCk7XG4gICAgfVxuICAgIGdldFByZVJlbmRlcmVkQml0bWFwKGNvbndheUdhbWUpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZVJlbmRlckNhbnZhcyA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgeWllbGQgdGhpcy5wcmVwcmVuZGVyX2JpdG1hcChjb253YXlHYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLm5leHRDYW52YXNCaXRNYXA7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB1cGRhdGVnYW1lRmllbGRXaXRoU2hhcGVzRnJvbVByZVJlbmRlcihjb253YXlHYW1lLCBvZmZzZXRYID0gMCwgb2Zmc2V0WSA9IDApIHtcbiAgICAgICAgdGhpcy5hZGRWaXN1YWxUcmFpbENlbGxzQW5kQWdlVHJhaWwoY29ud2F5R2FtZSk7XG4gICAgICAgIGlmICghdGhpcy5jYW52YXMpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYW52YXMgaXMgdW5kZWZpbmVkIGFuZCB0aGVyZWZvcmUgbm90IHVzYWJsZVwiKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5iaXRtYXBDb250ZXh0ID09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcHJlcmVuZGVyZWRDYW52YXMgPSB0aGlzLmdldFByZVJlbmRlcmVkQml0bWFwKGNvbndheUdhbWUpO1xuICAgICAgICBwcmVyZW5kZXJlZENhbnZhcy50aGVuKCh2KSA9PiB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICAoX2EgPSB0aGlzLmJpdG1hcENvbnRleHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50cmFuc2ZlckZyb21JbWFnZUJpdG1hcCh2KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMubmV4dENhbnZhc0JpdE1hcCA9IG51bGw7XG4gICAgfVxuICAgIC8vIHByb3RlY3RlZCBmYWRlZF9jZWxsX3JlcHJfZGF0YV9vcl9jZWxsX3JlcHIob3JpZ2luYWxfY2VsbF9yZXByOiBDZWxsUmVwciwgb3B0X2ZhZGluZ19jZWxsOiBBZ2luZ0NlbGxSZXByIHwgdW5kZWZpbmVkID0gdW5kZWZpbmVkKSB7XG4gICAgLy8gICAgIGxldCBjZWxsX3JlcHIgPSBvcmlnaW5hbF9jZWxsX3JlcHI7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKChvcHRfZmFkaW5nX2NlbGwgIT0gdW5kZWZpbmVkKSArIFwiIFwiICsgKCFvcHRfZmFkaW5nX2NlbGw/LmNvbXBsZXRlbHlGYWRlZCkgKyBcIlwiICsgKGNlbGxfcmVwciA9PSB0aGlzLmNvbmZpZy5kZWFkX2NlbGxfcmVwcikgKyBcIlwiICsgKG9wdF9mYWRpbmdfY2VsbD8uaXNBZ2VkKSk7XG4gICAgLy8gICAgIGlmIChvcHRfZmFkaW5nX2NlbGwgIT0gdW5kZWZpbmVkICYmICFvcHRfZmFkaW5nX2NlbGwuY29tcGxldGVseUZhZGVkICYmIGNlbGxfcmVwciA9PSB0aGlzLmNvbmZpZy5kZWFkX2NlbGxfcmVwciAmJiBvcHRfZmFkaW5nX2NlbGwuaXNBZ2VkKSB7XG4gICAgLy8gICAgICAgICBjZWxsX3JlcHIgPSBvcHRfZmFkaW5nX2NlbGwuZmFkaW5nX2NlbGxfY29sb3I7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgcmV0dXJuIGNlbGxfcmVwcjtcbiAgICAvLyB9XG4gICAgZGlzcGxheUdlbmVyYXRpb24oZ2VuZXJhdGlvbikge1xuICAgICAgICBsZXQgY3VycmVudEdlbmVyYXRpb25FbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJHYW1lRmllbGRDdXJyZW50R2VuZXJhdGlvblwiKTtcbiAgICAgICAgaWYgKGN1cnJlbnRHZW5lcmF0aW9uRWxlbWVudCAhPSBudWxsKSB7XG4gICAgICAgICAgICBsZXQgbmV3X2VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaDFcIik7XG4gICAgICAgICAgICBuZXdfZWxlbWVudC5pbm5lckhUTUwgPSBcImN1cnJlbnQgR2VuZXJhdGlvbjogXCIgKyBnZW5lcmF0aW9uLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjdXJyZW50R2VuZXJhdGlvbkVsZW1lbnQuY2hpbGROb2Rlcy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3VycmVudEdlbmVyYXRpb25FbGVtZW50LmFwcGVuZENoaWxkKG5ld19lbGVtZW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdW1lVXBkYXRlcygpIHtcbiAgICAgICAgdGhpcy5jb25maWcub25fc2NyZWVuX2NoYW5nZSgpLm9uKHRoaXMuaGFuZGxlQ29uZmlnVXBkYXRlLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICBoYW5kbGVDb25maWdVcGRhdGUoKSB7XG4gICAgICAgIGlmICh0aGlzLmNhbnZhcyAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ29uZmlnIHVwZGF0ZSBkZXRlY3RlZFwiKTtcbiAgICAgICAgICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5jb25maWcueF9yZXNvbHV0aW9uO1xuICAgICAgICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5jb25maWcuc2NyZWVuX3JhdGlvICogdGhpcy5jb25maWcueF9yZXNvbHV0aW9uO1xuICAgICAgICAgICAgaWYgKHRoaXMucHJlUmVuZGVyQ2FudmFzICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZVJlbmRlckNhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgICAgIHRoaXMucHJlUmVuZGVyQ2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzLmhlaWdodDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBtYXBUb0NvbndheUZpZWxkUG9zaXRpb24ocG9zLCBjb253YXlfZ2FtZSkge1xuICAgICAgICBjb25zdCBzdGFydFBvc1ggPSAocG9zLnN0YXJ0UG9zLnhQb3MgLyB0aGlzLmNvbmZpZy54X3Jlc29sdXRpb24pICogY29ud2F5X2dhbWUueFNpemU7XG4gICAgICAgIGNvbnN0IHN0YXJ0UG9zWSA9IChwb3Muc3RhcnRQb3MueVBvcyAvICh0aGlzLmNvbmZpZy54X3Jlc29sdXRpb24gKiB0aGlzLmNvbmZpZy5zY3JlZW5fcmF0aW8pKSAqXG4gICAgICAgICAgICBjb253YXlfZ2FtZS55U2l6ZTtcbiAgICAgICAgY29uc3QgZW5kUG9zWCA9IChwb3MuZW5kUG9zLnhQb3MgLyB0aGlzLmNvbmZpZy54X3Jlc29sdXRpb24pICogY29ud2F5X2dhbWUueFNpemU7XG4gICAgICAgIGNvbnN0IGVuZFBvc1kgPSAocG9zLmVuZFBvcy55UG9zIC8gKHRoaXMuY29uZmlnLnhfcmVzb2x1dGlvbiAqIHRoaXMuY29uZmlnLnNjcmVlbl9yYXRpbykpICpcbiAgICAgICAgICAgIGNvbndheV9nYW1lLnlTaXplO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3RhcnRQb3M6IG5ldyBDZWxsUG9zaXRpb24oTWF0aC5yb3VuZChzdGFydFBvc1gpLCBNYXRoLnJvdW5kKHN0YXJ0UG9zWSkpLFxuICAgICAgICAgICAgZW5kUG9zOiBuZXcgQ2VsbFBvc2l0aW9uKE1hdGgucm91bmQoZW5kUG9zWCksIE1hdGgucm91bmQoZW5kUG9zWSkpLFxuICAgICAgICB9O1xuICAgIH1cbn1cbmNsYXNzIE1vdXNlUG9zaXRpb25IYW5kbGVyIHtcbiAgICBjb25zdHJ1Y3RvcihzdGFydFhQb3MsIHN0YXJ0WVBvcykge1xuICAgICAgICB0aGlzLmxhc3RYUG9zaXRpb24gPSBzdGFydFhQb3M7XG4gICAgICAgIHRoaXMubGFzdFlQb3NpdGlvbiA9IHN0YXJ0WVBvcztcbiAgICAgICAgdGhpcy50aW1lU3RhbXAgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgdGhpcy5wYXRoID0gbnVsbDtcbiAgICB9XG4gICAgdXBkYXRlTW91c2VQb3MoeFBvcywgeVBvcykge1xuICAgICAgICBpZiAoeFBvcyAhPSB0aGlzLmxhc3RYUG9zaXRpb24gfHwgeVBvcyAhPSB0aGlzLmxhc3RZUG9zaXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSB7XG4gICAgICAgICAgICAgICAgc3RhcnRQb3M6IG5ldyBDZWxsUG9zaXRpb24odGhpcy5sYXN0WFBvc2l0aW9uLCB0aGlzLmxhc3RZUG9zaXRpb24pLFxuICAgICAgICAgICAgICAgIGVuZFBvczogbmV3IENlbGxQb3NpdGlvbih4UG9zLCB5UG9zKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xuICAgICAgICAgICAgdGhpcy5sYXN0WFBvc2l0aW9uID0geFBvcztcbiAgICAgICAgICAgIHRoaXMubGFzdFlQb3NpdGlvbiA9IHlQb3M7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0QW5kUmVzZXRQYXRoKCkge1xuICAgICAgICB2YXIgX2EsIF9iLCBfYywgX2QsIF9lLCBfZjtcbiAgICAgICAgbGV0IHAgPSBudWxsO1xuICAgICAgICBpZiAoKChfYSA9IHRoaXMucGF0aCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnN0YXJ0UG9zKSAhPSBudWxsICYmICgoX2IgPSB0aGlzLnBhdGgpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5lbmRQb3MpICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gYWRkIGNsb25lIGZ1bmN0aW9uIHRvIGNlbGwgcG9zaXRpb25cbiAgICAgICAgICAgIHAgPSB7XG4gICAgICAgICAgICAgICAgc3RhcnRQb3M6IG5ldyBDZWxsUG9zaXRpb24oKF9jID0gdGhpcy5wYXRoKSA9PT0gbnVsbCB8fCBfYyA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Muc3RhcnRQb3MueFBvcywgKF9kID0gdGhpcy5wYXRoKSA9PT0gbnVsbCB8fCBfZCA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2Quc3RhcnRQb3MueVBvcyksXG4gICAgICAgICAgICAgICAgZW5kUG9zOiBuZXcgQ2VsbFBvc2l0aW9uKChfZSA9IHRoaXMucGF0aCkgPT09IG51bGwgfHwgX2UgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9lLmVuZFBvcy54UG9zLCAoX2YgPSB0aGlzLnBhdGgpID09PSBudWxsIHx8IF9mID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfZi5lbmRQb3MueVBvcyksXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGF0aCA9IG51bGw7XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cbn1cbmNsYXNzIFNpbXBsZUV2ZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IFtdOyAvLyBqdXN0IGZ1bmN0aW9ucyB3aGljaCBhcmUgY2FsbGVkIG9uIHRyaWdnZXJcbiAgICB9XG4gICAgb24oaGFuZGxlcikge1xuICAgICAgICB0aGlzLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgfVxuICAgIG9mZihoYW5kbGVyKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB0aGlzLmhhbmRsZXJzLmZpbHRlcigoaCkgPT4gaCAhPT0gaGFuZGxlcik7XG4gICAgfVxuICAgIHRyaWdnZXIoZGF0YSkge1xuICAgICAgICB0aGlzLmhhbmRsZXJzLnNsaWNlKDApLmZvckVhY2goKGgpID0+IGgoZGF0YSkpO1xuICAgIH1cbiAgICBleHBvc2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbn1cbmNsYXNzIENvbmZpZ1N0YXRlIHtcbiAgICBvbl9zY3JlZW5fY2hhbmdlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY3JlZW5fY2hhbmdlX2V2ZW50LmV4cG9zZSgpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihjb2xvcl9hbGl2ZSA9IG5ldyBDZWxsQ29sb3IoMjU1LCAyNTUsIDI1NSwgMjU1KSwgY29sb3JfZGVhZCA9IG5ldyBDZWxsQ29sb3IoMCwgMCwgMjAsIDI1NSksIGRpc3BsYXlfdHJhaWxzID0gMywgeF9yZXNvbHV0aW9uID0gMTAwMCwgc2NyZWVuX3JhdGlvID0gOSAvIDE2KSB7XG4gICAgICAgIHRoaXMuY3VycmVudF9CUE0gPSA2MDtcbiAgICAgICAgdGhpcy5zY3JlZW5fY2hhbmdlX2V2ZW50ID0gbmV3IFNpbXBsZUV2ZW50KCk7XG4gICAgICAgIHRoaXMuX2FsaXZlX2NlbGxfY29sb3IgPSBjb2xvcl9hbGl2ZTtcbiAgICAgICAgdGhpcy5fZGVhZF9jZWxsX2NvbG9yID0gY29sb3JfZGVhZDtcbiAgICAgICAgdGhpcy5fZGlzcGxheV90cmFpbHMgPSBNYXRoLm1heCgxLCBkaXNwbGF5X3RyYWlscyk7XG4gICAgICAgIHRoaXMuX3hfcmVzb2x1dGlvbiA9IHhfcmVzb2x1dGlvbjtcbiAgICAgICAgdGhpcy5fc2NyZWVuX3JhdGlvID0gc2NyZWVuX3JhdGlvO1xuICAgICAgICB0aGlzLl9tb3VzZVBvc2l0aW9uSGFuZGxlciA9IG51bGw7XG4gICAgICAgIHRoaXMuZ2FtZV9zZXR0aW5nc191cGRhdGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2JlYXRfb2Zmc2V0X3RpbWVfbXMgPSBudWxsO1xuICAgIH1cbiAgICBnZXQgYWxpdmVfY2VsbF9yZXByKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWxpdmVfY2VsbF9jb2xvcjtcbiAgICB9XG4gICAgc2V0IHNldF9hbGl2ZV9jZWxsX2NvbG9yKGNvbG9yKSB7XG4gICAgICAgIHRoaXMuX2FsaXZlX2NlbGxfY29sb3IgPSBuZXcgQ2VsbENvbG9yKGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sIGNvbG9yWzNdKTtcbiAgICAgICAgdGhpcy5nYW1lX3NldHRpbmdzX3VwZGF0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXQgc2V0X2RlYWRfY2VsbF9jb2xvcihjb2xvcikge1xuICAgICAgICB0aGlzLl9kZWFkX2NlbGxfY29sb3IgPSBuZXcgQ2VsbENvbG9yKGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sIGNvbG9yWzNdKTtcbiAgICAgICAgdGhpcy5nYW1lX3NldHRpbmdzX3VwZGF0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICBzZXQgeF9yZXNvbHV0aW9uKHJlc29sdXRpb24pIHtcbiAgICAgICAgdGhpcy5feF9yZXNvbHV0aW9uID0gTWF0aC5tYXgocmVzb2x1dGlvbiwgMTAwKTtcbiAgICAgICAgdGhpcy5zY3JlZW5fY2hhbmdlX2V2ZW50LnRyaWdnZXIoKTtcbiAgICB9XG4gICAgZ2V0IHhfcmVzb2x1dGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3hfcmVzb2x1dGlvbjtcbiAgICB9XG4gICAgc2V0IHNjcmVlbl9yYXRpbyhyYXRpbykge1xuICAgICAgICB0aGlzLl9zY3JlZW5fcmF0aW8gPSByYXRpbztcbiAgICAgICAgdGhpcy5zY3JlZW5fY2hhbmdlX2V2ZW50LnRyaWdnZXIoKTtcbiAgICB9XG4gICAgZ2V0IHNjcmVlbl9yYXRpbygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NjcmVlbl9yYXRpbztcbiAgICB9XG4gICAgZ2V0IGRlYWRfY2VsbF9yZXByKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGVhZF9jZWxsX2NvbG9yO1xuICAgIH1cbiAgICBzZXQgbW91c2VQb3NpdGlvbkhhbmRsZXIoaGFuZGxlcikge1xuICAgICAgICB0aGlzLl9tb3VzZVBvc2l0aW9uSGFuZGxlciA9IGhhbmRsZXI7XG4gICAgfVxuICAgIGdldCBnZXRNb3VzZVBvc2l0aW9uSGFuZGxlcigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX21vdXNlUG9zaXRpb25IYW5kbGVyO1xuICAgIH1cbiAgICBnZXQgdHJhaWxfbGVuZ3RoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlzcGxheV90cmFpbHM7XG4gICAgfVxuICAgIGdldCBicG1fdGltZW91dF9zZWNvbmRzKCkge1xuICAgICAgICByZXR1cm4gMSAvICh0aGlzLmJwbSAvIDYwKTtcbiAgICB9XG4gICAgc2V0IHVwZGF0ZV9icG0obmV3X2JwbSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRfQlBNID0gbmV3X2JwbTtcbiAgICB9XG4gICAgZ2V0IGJwbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudF9CUE07XG4gICAgfVxuICAgIGdldF9iZWF0X29mZnNldF9zZWNvbmRzKHRpbWVfbXMpIHtcbiAgICAgICAgaWYgKHRoaXMuX2JlYXRfb2Zmc2V0X3RpbWVfbXMgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9mZnNldCA9IHRpbWVfbXMgLSB0aGlzLl9iZWF0X29mZnNldF90aW1lX21zO1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgoMCwgb2Zmc2V0KTtcbiAgICB9XG4gICAgc2V0IGJlYXRfb2Zmc2V0X3NlY29uZHModGltZV9tcykge1xuICAgICAgICB0aGlzLl9iZWF0X29mZnNldF90aW1lX21zID0gdGltZV9tcztcbiAgICB9XG59XG5jb25zdCBTVVJST1VORElOR1BPU0lUSU9OUyA9IG5ldyBBcnJheShuZXcgQ2VsbFBvc2l0aW9uKC0xLCAtMSksIG5ldyBDZWxsUG9zaXRpb24oLTEsIDApLCBuZXcgQ2VsbFBvc2l0aW9uKC0xLCAxKSwgbmV3IENlbGxQb3NpdGlvbigwLCAxKSwgbmV3IENlbGxQb3NpdGlvbigwLCAtMSksIG5ldyBDZWxsUG9zaXRpb24oMSwgMSksIG5ldyBDZWxsUG9zaXRpb24oMSwgMCksIG5ldyBDZWxsUG9zaXRpb24oMSwgLTEpKTtcbmNvbnN0IERFRkFVTFRHQU1FUlVMRSA9IG5ldyBBcnJheShuZXcgU2hhcGVkQ29ud2F5R2FtZVJ1bGUobnVsbCwgU1VSUk9VTkRJTkdQT1NJVElPTlMsIFsyLCAzXSwgWzNdKSk7XG5jb25zdCBNVUxUSVBMSUNBVElPTkdBTUVSVUxFID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzJdLCBbMl0pKTtcbmNvbnN0IENPUFlHQU1FUlVMRVMgPSBuZXcgQXJyYXkobmV3IFNoYXBlZENvbndheUdhbWVSdWxlKG51bGwsIFNVUlJPVU5ESU5HUE9TSVRJT05TLCBbMSwgMywgNSwgN10sIFsxLCAzLCA1LCA3XSkpO1xuY29uc3QgV09STEQzM1JVTEVTID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzNdLCBbM10pKTtcbmNvbnN0IFdPUkxEMjM2UlVMRVMgPSBuZXcgQXJyYXkobmV3IFNoYXBlZENvbndheUdhbWVSdWxlKG51bGwsIFNVUlJPVU5ESU5HUE9TSVRJT05TLCBbMiwgMywgNl0sIFszXSkpO1xuY29uc3QgU05BS0VLSU5HUlVMRUlERUEgPSBuZXcgQXJyYXkobmV3IFNoYXBlZENvbndheUdhbWVSdWxlKG51bGwsIFNVUlJPVU5ESU5HUE9TSVRJT05TLCBbMl0sIFsyXSkpO1xuY29uc3QgV09STEQ0NFJVTEVTID0gbmV3IEFycmF5KG5ldyBTaGFwZWRDb253YXlHYW1lUnVsZShudWxsLCBTVVJST1VORElOR1BPU0lUSU9OUywgWzNdLCBbMl0pKTtcbmNvbnN0IENFTlRFUkRFRkFVTFRHQU1FUlVMRSA9IG5ldyBBcnJheShuZXcgU2hhcGVkQ29ud2F5R2FtZVJ1bGUobmV3IFJlY3RhbmdsZShuZXcgQ2VsbFBvc2l0aW9uKDEwMCwgMCksIG5ldyBDZWxsUG9zaXRpb24oMjAwLCAyMDApKSwgU1VSUk9VTkRJTkdQT1NJVElPTlMsIFsyLCAzXSwgWzNdKSk7XG5leHBvcnQgeyBDb253YXlHYW1lLCBDb253YXlHYW1lRmFjdG9yeSwgQ0VOVEVSREVGQVVMVEdBTUVSVUxFLCBERUZBVUxUR0FNRVJVTEUsIENvbndheUhUTUxEaXNwbGF5ZXIsIENvbndheUdhbWVSZXByZXNlbnRlciwgQ2VsbENvbG9yLCBDb25maWdTdGF0ZSBhcyBDb25maWdTdG9yYWdlLCBDZWxsUG9zaXRpb24sIEFnaW5nQ2VsbFJlcHIsIE1VTFRJUExJQ0FUSU9OR0FNRVJVTEUsIEJvb2xlYW5DZWxsLCBDb253YXlHYW1lQWR2YW5jZXIsIE1vdXNlUG9zaXRpb25IYW5kbGVyLCBSZXNldEdhbWVSdWxlLCBTaGFwZWRDb253YXlHYW1lUnVsZSwgfTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQ29ud2F5R2FtZUFkdmFuY2VyLCBDb253YXlHYW1lRmFjdG9yeSwgQ0VOVEVSREVGQVVMVEdBTUVSVUxFLCBDb253YXlIVE1MRGlzcGxheWVyLCBDb25maWdTdG9yYWdlLCBDZWxsUG9zaXRpb24sIE1VTFRJUExJQ0FUSU9OR0FNRVJVTEUsIE1vdXNlUG9zaXRpb25IYW5kbGVyLCB9IGZyb20gXCIuLi9tYWluL2dhbWVfb2ZfbGlmZV9kZWZhdWx0XCI7XG5jb25zdCBDT05XQVlDT05GSUcgPSBuZXcgQ29uZmlnU3RvcmFnZSgpO1xuc2VsZi5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICBjb25zb2xlLmRlYnVnKFwiV29ya2VyIHJlY2VpdmVkIG1lc3NhZ2UgXCIgKyBldmVudC5kYXRhKTtcbiAgICBsZXQgcmVjZWl2ZWRfZGF0YSA9IGV2ZW50LmRhdGE7XG4gICAgc3dpdGNoIChyZWNlaXZlZF9kYXRhLm1lc3NhZ2UpIHtcbiAgICAgICAgY2FzZSBcInN0YXJ0XCI6XG4gICAgICAgICAgICBpZiAocmVjZWl2ZWRfZGF0YS5jYW52YXMgPT0gdW5kZWZpbmVkIHx8IHJlY2VpdmVkX2RhdGEucHJlcmVuZGVyQ2FudmFzID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRocm93IEVycm9yKFwiU3RhcnQgaXMgbWlzc2luZyBhcmd1bWVudHNcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgbWFpbkNhbnZhcyA9IHJlY2VpdmVkX2RhdGEuY2FudmFzO1xuICAgICAgICAgICAgbGV0IG9wdENhbnZhcyA9IHJlY2VpdmVkX2RhdGEucHJlcmVuZGVyQ2FudmFzO1xuICAgICAgICAgICAgc3RhcnRfY29ud2F5X2dhbWVfb25fY2FudmFzKG1haW5DYW52YXMsIG9wdENhbnZhcyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInNldFhSZXNvbHV0aW9uXCI6XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwiV29ya2VyIHJlY2VpdmVkIHJlc29sdXRpb24gbWVzc2FnZVwiICsgcmVjZWl2ZWRfZGF0YSk7XG4gICAgICAgICAgICBDT05XQVlDT05GSUcueF9yZXNvbHV0aW9uID0gcmVjZWl2ZWRfZGF0YS53aWR0aDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic2V0U2NyZWVuUmF0aW9cIjpcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXCJXb3JrZXIgcmVjZWl2ZWQgc2NyZWVuIHJhdGlvIG1lc3NhZ2VcIiArIHJlY2VpdmVkX2RhdGEuc2NyZWVuX3JhdGlvKTtcbiAgICAgICAgICAgIENPTldBWUNPTkZJRy5zY3JlZW5fcmF0aW8gPSByZWNlaXZlZF9kYXRhLnNjcmVlbl9yYXRpbztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwic2V0Q29sb3JBbGl2ZVwiOlxuICAgICAgICAgICAgQ09OV0FZQ09ORklHLnNldF9hbGl2ZV9jZWxsX2NvbG9yID0gcmVjZWl2ZWRfZGF0YS5yZ2JhOyAvLyBUT0RPIG1ha2UgdGhpcyBhbHNvIGJlIGFibGUgdG8gdGFrZSBhIGZ1bmN0aW9uIC8gb3IgdXNlIGEgcHJlZGVmaW5lZCBmdW5jdGlvblxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzZXRDb2xvckRlYWRcIjpcbiAgICAgICAgICAgIENPTldBWUNPTkZJRy5zZXRfZGVhZF9jZWxsX2NvbG9yID0gcmVjZWl2ZWRfZGF0YS5yZ2JhO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJtb3VzZXBvc2l0aW9uXCI6XG4gICAgICAgICAgICBpZiAoQ09OV0FZQ09ORklHLmdldE1vdXNlUG9zaXRpb25IYW5kbGVyID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBDT05XQVlDT05GSUcubW91c2VQb3NpdGlvbkhhbmRsZXIgPSBuZXcgTW91c2VQb3NpdGlvbkhhbmRsZXIocmVjZWl2ZWRfZGF0YS54UG9zLCByZWNlaXZlZF9kYXRhLnlQb3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgQ09OV0FZQ09ORklHLmdldE1vdXNlUG9zaXRpb25IYW5kbGVyLnVwZGF0ZU1vdXNlUG9zKHJlY2VpdmVkX2RhdGEueFBvcywgcmVjZWl2ZWRfZGF0YS55UG9zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiYnBtVXBkYXRlXCI6XG4gICAgICAgICAgICBDT05XQVlDT05GSUcudXBkYXRlX2JwbSA9IHJlY2VpdmVkX2RhdGEuYnBtO1xuICAgICAgICAgICAgQ09OV0FZQ09ORklHLmJlYXRfb2Zmc2V0X3NlY29uZHMgPSByZWNlaXZlZF9kYXRhLm5leHRfYmVhdF90aW1lO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiVW5rbm93biBkYXRhXCIgKyByZWNlaXZlZF9kYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbmtub3duIG1lc3NhZ2UgXCIgKyByZWNlaXZlZF9kYXRhLm1lc3NhZ2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgfVxufTtcbmZ1bmN0aW9uIGdldF9yYXRpb195X3RvX3goeCwgY2FudmFzKSB7XG4gICAgLy8gVE9ETyB1c2Ugb2Zmc2NyZWVuIGNhbnZhcyByYXRpb1xuICAgIHJldHVybiBNYXRoLmNlaWwoeCAqIDAuNTYyNSk7XG59XG5mdW5jdGlvbiBzdGFydF9jb253YXlfZ2FtZV9vbl9jYW52YXMoY2FudmFzLCBwcmVyZW5kZXJDYW52YXMpIHtcbiAgICBsZXQgZnBzID0gMzA7XG4gICAgY29uc3QgeF9waXhlbF9kZWZhdWx0ID0gMTUwO1xuICAgIGNvbnN0IHlfcGl4ZWxfZGVmYXVsdCA9IGdldF9yYXRpb195X3RvX3goeF9waXhlbF9kZWZhdWx0LCBjYW52YXMpO1xuICAgIGNvbnN0IGNvbndheUdhbWVGYWN0b3J5ID0gbmV3IENvbndheUdhbWVGYWN0b3J5KHhfcGl4ZWxfZGVmYXVsdCwgeV9waXhlbF9kZWZhdWx0LCBDRU5URVJERUZBVUxUR0FNRVJVTEUsIHRydWUsIE1VTFRJUExJQ0FUSU9OR0FNRVJVTEVbMF0sIFwiZXh0ZW5kXCIpOyAvLyB0b2RvIHJlYWwgc2NyZWVuIHByb3BvcnRpb25zLCBlLmcuIHdpbmRvdyBpcyBzaXplZFxuICAgIGxldCBjdXJyZW50Q29ud2F5R2FtZU9yaWdpbmFsID0gY29ud2F5R2FtZUZhY3RvcnkuY2lyY2xlKDIwLCAoMSAvIDIwKSAqIE1hdGguUEksIFtcbiAgICAgICAgbmV3IENlbGxQb3NpdGlvbigwLCAwKSxcbiAgICBdKTtcbiAgICBsZXQgY3VycmVudENvbndheUdhbWUgPSBDb253YXlHYW1lQWR2YW5jZXIuZnJvbUNvbndheUdhbWUoY3VycmVudENvbndheUdhbWVPcmlnaW5hbCwgdW5kZWZpbmVkKTtcbiAgICBjb25zdCBmaWVsZF9kcmF3ZXIgPSBuZXcgQ29ud2F5SFRNTERpc3BsYXllcihjYW52YXMsIENPTldBWUNPTkZJRywgbnVsbCwgcHJlcmVuZGVyQ2FudmFzKTtcbiAgICBmaWVsZF9kcmF3ZXIudXBkYXRlZ2FtZUZpZWxkV2l0aFNoYXBlc0Zyb21QcmVSZW5kZXIoY3VycmVudENvbndheUdhbWUpO1xuICAgIGxldCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGxldCBnYW1lU3RhdGVTdGFydCA9IHN0YXJ0O1xuICAgIGxldCB0aW1lb3V0X3VwZGF0ZV9yZWNlaXZlZCA9IGZhbHNlO1xuICAgIGxldCBnZW5lcmF0aW9uID0gLTE7XG4gICAgZnVuY3Rpb24gZHJhd19jb253YXlfZ2FtZSh0aW1lU3RhbXApIHtcbiAgICAgICAgaWYgKCFjdXJyZW50Q29ud2F5R2FtZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gdGltZVN0YW1wO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGVsYXBzZWQgPSB0aW1lU3RhbXAgLSBzdGFydDtcbiAgICAgICAgY29uc3QgZWxhcHNlZF9nYW1lX3N0YXRlID0gdGltZVN0YW1wIC0gZ2FtZVN0YXRlU3RhcnQ7XG4gICAgICAgIGNvbnN0IG5lZWRlZF90aW1lID0gKENPTldBWUNPTkZJRy5icG1fdGltZW91dF9zZWNvbmRzICsgQ09OV0FZQ09ORklHLmdldF9iZWF0X29mZnNldF9zZWNvbmRzKHRpbWVTdGFtcCkpICpcbiAgICAgICAgICAgIDEwMDA7XG4gICAgICAgIGlmIChlbGFwc2VkX2dhbWVfc3RhdGUgPiBuZWVkZWRfdGltZSkge1xuICAgICAgICAgICAgZ2FtZVN0YXRlU3RhcnQgPSB0aW1lU3RhbXA7XG4gICAgICAgICAgICB1cGRhdGVDb253YXlHYW1lKCk7XG4gICAgICAgICAgICBDT05XQVlDT05GSUcuYmVhdF9vZmZzZXRfc2Vjb25kcyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsYXBzZWQgPiAxMDAwIC8gZnBzICYmIHRpbWVvdXRfdXBkYXRlX3JlY2VpdmVkKSB7XG4gICAgICAgICAgICBmaWVsZF9kcmF3ZXIudXBkYXRlZ2FtZUZpZWxkV2l0aFNoYXBlc0Zyb21QcmVSZW5kZXIoY3VycmVudENvbndheUdhbWUpO1xuICAgICAgICAgICAgdGltZW91dF91cGRhdGVfcmVjZWl2ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKHQpID0+IGRyYXdfY29ud2F5X2dhbWUodCkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiB1cGRhdGVDb253YXlHYW1lKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmIChjdXJyZW50Q29ud2F5R2FtZSkge1xuICAgICAgICAgICAgY3VycmVudENvbndheUdhbWUubmV4dFN0YXRlKCk7XG4gICAgICAgICAgICBjb25zdCBwb3MgPSAoX2EgPSBDT05XQVlDT05GSUcuZ2V0TW91c2VQb3NpdGlvbkhhbmRsZXIpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nZXRBbmRSZXNldFBhdGgoKTtcbiAgICAgICAgICAgIGlmIChwb3MgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoXCJhZGRpbmcgcGF0aCBhdFwiICsgcG9zLnN0YXJ0UG9zICsgXCJ0byBcIiArIHBvcy5lbmRQb3MpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvc0ZpeGVkID0gZmllbGRfZHJhd2VyLm1hcFRvQ29ud2F5RmllbGRQb3NpdGlvbihwb3MsIGN1cnJlbnRDb253YXlHYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKFwibWFwcGVkIHBhdGggdG9cIiArIHBvc0ZpeGVkLnN0YXJ0UG9zICsgXCJ0byBcIiArIHBvc0ZpeGVkLmVuZFBvcyk7XG4gICAgICAgICAgICAgICAgY3VycmVudENvbndheUdhbWUuYWRkUGF0aChwb3NGaXhlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZF9kcmF3ZXJcbiAgICAgICAgICAgICAgICAucHJlcHJlbmRlcl9iaXRtYXAoY3VycmVudENvbndheUdhbWUpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGYpID0+ICh0aW1lb3V0X3VwZGF0ZV9yZWNlaXZlZCA9IHRydWUpKTtcbiAgICAgICAgICAgIGdlbmVyYXRpb24gKz0gMTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZHJhd19jb253YXlfZ2FtZSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=