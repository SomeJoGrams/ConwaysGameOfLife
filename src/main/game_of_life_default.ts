interface ConwayCell {
    reset(): void;
    get isAlive(): boolean;
    nextState(): void;
}

class BooleanCell implements ConwayCell {
    alive: boolean;
    constructor(alive: boolean) {
        this.alive = alive;
    }
    get isAlive(): boolean {
        return this.alive;
    }

    public reset() {
        this.alive = false;
    }
    public nextState(): void {
        this.alive = !this.alive;
    }
}

interface Position {
    xPos: number; // TODO fix naming mark attributes as private
    yPos: number;

    get xPosition(): number;

    get yPosition(): number;

    toString(): string;
}

class CellPosition implements Position {
    xPos: number;
    yPos: number;

    constructor(xPos: number, yPos: number) {
        this.xPos = xPos;
        this.yPos = yPos;
    }

    get xPosition(): number {
        return this.xPos;
    }

    get yPosition(): number {
        return this.yPos;
    }

    toString() {
        return "x" + this.xPos + "-y" + this.yPos;
    }
}

interface ConwayGameRule {
    applyRuleOnPos(xPos: number, yPos: number, conwayGame: ConwayGame): ConwayGame;
    getIfLastCellKilledAtPosition(): CellPosition | null;
}

abstract class Shape {
    abstract inBounds(xPos: number, yPos: number): boolean;

    inBoundsPos(position: Position): boolean {
        return this.inBounds(position.xPos, position.yPos);
    }
}

class Rectangle extends Shape {
    lowerLeftCorner: Position;
    upperRightCorner: Position;

    constructor(lowerLeftCorner: Position, upperRightCorner: Position) {
        super();
        this.lowerLeftCorner = lowerLeftCorner;
        this.upperRightCorner = upperRightCorner;
    }

    public inBounds(xPos: number, yPos: number): boolean {
        return (
            xPos > this.lowerLeftCorner.xPos &&
            xPos < this.upperRightCorner.yPos &&
            yPos > this.lowerLeftCorner.yPos &&
            yPos < this.upperRightCorner.yPos
        );
    }
}

class ShapedConwayGameRule implements ConwayGameRule {
    viewed_cell_positions: CellPosition[];
    alive_goes_to_next_state: number[];
    dead_goes_to_next_state: number[];
    last_cell_which_died: CellPosition | null;
    shape: Shape | null;

    constructor(
        shape: Shape | null,
        viewed_cells: CellPosition[],
        alive_goes_to_next_state: number[] = [2, 3], // FIXME state intialisation
        dead_goes_to_next_state: number[] = [3]
    ) {
        this.shape = shape;
        this.viewed_cell_positions = viewed_cells;
        this.alive_goes_to_next_state = alive_goes_to_next_state;
        this.dead_goes_to_next_state = dead_goes_to_next_state;
        this.last_cell_which_died = null;
    }

    public ruleCanBeApplied(position: Position): boolean {
        if (this.shape == null || (this.shape != null && !this.shape.inBoundsPos(position))) {
            return true;
        }
        return false;
    }

    public applyRuleOnPos(xPos: number, yPos: number, conwayGame: ConwayGame): ConwayGame {
        const cell: ConwayCell = conwayGame.activeField.get_cell(xPos, yPos);
        let position = conwayGame.activeField.border_fixed_rules(new CellPosition(xPos, yPos));
        if (!this.ruleCanBeApplied(position)) {
            return conwayGame;
        }
        const living_neighbour_count = conwayGame.activeField.cell_living_neighbours(
            position.xPos,
            position.yPos,
            this.viewed_cell_positions
        );
        const is_alive_neighbour_count = this.alive_goes_to_next_state.some(
            (value) => living_neighbour_count == value
        );
        const is_dead_neighbour_count = this.dead_goes_to_next_state.some(
            (value) => living_neighbour_count == value
        );
        let nextCell = conwayGame.inactiveField.get_cell(position.xPos, position.yPos);
        if (cell.isAlive && is_alive_neighbour_count) {
            nextCell.nextState();
        } else if (!cell.isAlive && is_dead_neighbour_count) {
            nextCell.nextState();
        } else if (cell.isAlive)
            this.last_cell_which_died = new CellPosition(position.xPos, position.yPos);
        return conwayGame;
    }

    public getIfLastCellKilledAtPosition(): CellPosition | null {
        let cell = this.last_cell_which_died;
        this.last_cell_which_died = null;
        return cell;
    }
}

interface IConwayField {
    clear(): void;
    set_cell(xPos: number, yPos: number, value: ConwayCell): void;
    get_cell(xPos: number, yPos: number): ConwayCell;
    border_fixed_rules(pos: CellPosition): CellPosition;
    cell_living_neighbours(indexX: number, indexY: number, lookingAt: Position[]): number;
}

class ConwayField implements IConwayField {
    xSize: number;
    ySize: number;
    borderRules: "cutoff" | "extend";
    gameField: ConwayCell[][];
    _living_cell_count: number;

    constructor(pxSize: number, pySize: number, borderRules: "cutoff" | "extend" = "cutoff") {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.gameField = this.create_empty_conways_cell_array();
        this.borderRules = borderRules;
        this._living_cell_count = 0;
    }

    protected create_empty_conways_cell_array(): ConwayCell[][] {
        let arr = new Array(this.ySize).fill(false).map(() => new Array(this.xSize).fill(false));
        return arr.map((vector, i, arr) => vector.map((el, i, arr) => new BooleanCell(false)));
    }

    public clear() {
        this.gameField = this.create_empty_conways_cell_array();
        this._living_cell_count = 0;
    }

    get living_cell_percent(): number {
        return this._living_cell_count / (this.xSize * this.ySize);
    }

    protected count_living_cells() {
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                if (this.get_cell(indexX, indexY).isAlive) {
                    this._living_cell_count += 1;
                }
            }
        }
    }

    public get_cell(xPos: number, yPos: number): ConwayCell {
        let cellPos: CellPosition = this.border_fixed_rules(new CellPosition(xPos, yPos));
        return this.gameField[cellPos.yPos][cellPos.xPos];
    }

    public set_cell(xPos: number, yPos: number, value: ConwayCell): void {
        let cellPos: CellPosition = this.border_fixed_rules(new CellPosition(xPos, yPos));
        if (value.isAlive) {
            this._living_cell_count += 1;
        }
        this.gameField[cellPos.yPos][cellPos.xPos] = value;
    }

    public border_fixed_rules(pos: CellPosition): CellPosition {
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

    public cell_living_neighbours(indexX: number, indexY: number, lookingAt: Position[]) {
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

    protected in_field(indexX: number, indexY: number) {
        if (this.borderRules == "extend") {
            return true;
        }
        let inField = indexX > 0 && indexY > 0 && indexX < this.xSize && indexY < this.ySize;
        return inField;
    }
}

class ConwayGame {
    xSize: number;
    ySize: number;
    currentGameField: ConwayField;
    lastGameField: ConwayField;
    positional_rules: ShapedConwayGameRule[];
    fallbackRule: ShapedConwayGameRule | null;
    lastStepDiedCells: CellPosition[];
    borderRules: "cutoff" | "extend";
    activeGameFieldKind: "last" | "current";

    constructor(
        pxSize: number,
        pySize: number,
        cells: null | ConwayField,
        rules: ShapedConwayGameRule[],
        fallbackRule: ShapedConwayGameRule | null = null,
        borderRules: "cutoff" | "extend" = "cutoff"
    ) {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.borderRules = borderRules;
        if (cells == null) {
            this.currentGameField = this.createGameField();
        } else {
            this.currentGameField = cells;
        }
        this.lastGameField = this.createGameField();
        this.activeGameFieldKind = "current";
        this.fallbackRule = fallbackRule;
        this.positional_rules = rules;
        this.lastStepDiedCells = [];
    }

    public clear_field() {
        this.activeField.clear();
    }

    protected createGameField() {
        return new ConwayField(this.xSize, this.ySize, this.borderRules);
    }

    get living_cell_count(): number {
        return this.living_cell_count;
    }

    get activeField(): ConwayField {
        if (this.activeGameFieldKind == "current") {
            return this.currentGameField;
        } else {
            return this.lastGameField;
        }
    }

    get inactiveField(): ConwayField {
        if (this.activeGameFieldKind == "current") {
            return this.lastGameField;
        } else {
            return this.currentGameField;
        }
    }

    public setOnActiveField(xPos: number, yPos: number, cell: ConwayCell) {
        this.activeField.set_cell(xPos, yPos, cell);
    }

    public getCurrentCell(xPos: number, yPos: number): ConwayCell {
        return this.activeField.get_cell(xPos, yPos);
    }

    public nextState(): ConwayGame {
        this.lastStepDiedCells = [];
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                this.inactiveField.get_cell(indexX, indexY).reset();
                this.positional_rules.forEach((rule) => {
                    // TODO dry this
                    rule.applyRuleOnPos(indexX, indexY, this);
                    let optional_cell: CellPosition | null = rule.getIfLastCellKilledAtPosition();
                    if (optional_cell != null) {
                        this.lastStepDiedCells.push(optional_cell);
                    }
                });
                if (this.fallbackRuleShouldBeApplied(indexX, indexY)) {
                    (<ShapedConwayGameRule>this.fallbackRule).applyRuleOnPos(indexX, indexY, this);
                    let optional_cell: CellPosition | null = (<ShapedConwayGameRule>(
                        this.fallbackRule
                    )).getIfLastCellKilledAtPosition();
                    if (optional_cell != null) {
                        this.lastStepDiedCells.push(optional_cell);
                    }
                }
            }
        }
        this.switchActiveGameField();
        return this;
    }

    protected fallbackRuleShouldBeApplied(indexX: number, indexY: number) {
        const positionalRulesApplicable = this.positional_rules.some((rule, i, arr) =>
            rule.ruleCanBeApplied(new CellPosition(indexX, indexY))
        );
        return !positionalRulesApplicable && this.fallbackRule != null;
    }

    protected switchActiveGameField() {
        if (this.activeGameFieldKind == "last") {
            this.activeGameFieldKind = "current";
        } else {
            this.activeGameFieldKind = "last";
        }
    }

    public getLastStepDiedCellPositions(): CellPosition[] {
        return this.lastStepDiedCells;
    }
}

interface GeneralGameRules {
    nextGameWithRule(conwayGame: ConwayGame): void;
}

class ResetGameRule implements GeneralGameRules {
    private readonly reset_percent: number;
    private readonly editing_conway_factory: ConwayGameFactory;

    constructor(reset_percent: number, replacing_factory: ConwayGameFactory) {
        this.reset_percent = reset_percent;
        this.editing_conway_factory = replacing_factory;
    }

    public nextGameWithRule(conwayGame: ConwayGame): void {
        if (conwayGame.activeField.living_cell_percent > this.reset_percent) {
            this.editing_conway_factory.circle(5, 1, undefined, conwayGame); // TODO make creation function take an object
        }
    }
}

class ConwayGameAdvancer extends ConwayGame {
    generalRules: GeneralGameRules[];

    constructor(
        pxSize: number,
        pySize: number,
        cells: null | ConwayField,
        rules: ShapedConwayGameRule[],
        fallbackRule: ShapedConwayGameRule | null = null,
        borderRules: "cutoff" | "extend" = "cutoff",
        generalRules: GeneralGameRules[]
    ) {
        super(pxSize, pySize, cells, rules, fallbackRule, borderRules);
        this.generalRules = generalRules;
    }

    static fromConwayGame(conwayGame: ConwayGame, generalRules: GeneralGameRules[] | null = null) {
        let generalR = generalRules ?? [];
        return new this(
            conwayGame.xSize,
            conwayGame.ySize,
            conwayGame.activeField,
            conwayGame.positional_rules,
            conwayGame.fallbackRule,
            conwayGame.borderRules,
            generalR
        );
    }

    public nextState(): ConwayGame {
        for (const rule of this.generalRules) {
            rule.nextGameWithRule(this);
        }
        super.nextState();
        return this;
    }

    public addPath(pos: { startPos: CellPosition; endPos: CellPosition }): void {
        let path: CellPosition[] = this.calcPath(pos);
        for (const position of path) {
            this.getCurrentCell(position.xPos, position.yPos).nextState();
        }
    }

    public calcPath(pos: { startPos: CellPosition; endPos: CellPosition }): CellPosition[] {
        let resultPath: Set<CellPosition> = new Set();
        const xStart: number = Math.round(pos.startPos.xPos);
        const yStart: number = Math.round(pos.startPos.yPos);
        const xEnd: number = Math.round(pos.endPos.xPos);
        const yEnd: number = Math.round(pos.endPos.yPos);
        const yDif = yEnd - yStart;
        const xDif = xEnd - xStart;
        let xOffset = 0;
        let yOffset = 0;

        if (xDif == 0) {
            for (let curyDif = 0; curyDif <= Math.abs(yDif); curyDif++) {
                resultPath.add(new CellPosition(Math.round(xStart), Math.round(yStart + curyDif)));
            }
        } else if (yDif == 0) {
            for (let curxDif = 0; curxDif <= Math.abs(xDif); curxDif++) {
                resultPath.add(new CellPosition(Math.round(xStart + curxDif), Math.round(yStart)));
            }
        } else {
            const pointDistance = Math.sqrt(Math.pow(xDif, 2) + Math.pow(yDif, 2));
            let m = yDif / xDif;
            let xPos: number = 0;
            if (m > 0) {
                xPos = Math.min(xStart, xEnd);
            } else {
                xPos = Math.max(xStart, xEnd);
            }
            let b: number = yEnd - m * xEnd;
            for (
                let curDist = 0;
                curDist < pointDistance / Math.abs(m) - Math.abs(m);
                curDist += 1
            ) {
                resultPath.add(new CellPosition(Math.round(xPos), Math.round(m * xPos + b)));
                xPos += m;
            }
        }
        return Array.of(...resultPath.keys());
    }
}

class ConwayGameFactory {
    xSize: number;
    ySize: number;
    rules: ShapedConwayGameRule[];
    fallbackRule: ShapedConwayGameRule | null;
    borderRules: "cutoff" | "extend";
    aliveCellState: boolean;

    constructor(
        xSize: number,
        ySize: number,
        rules: ShapedConwayGameRule[],
        aliveCellState: boolean,
        fallbackRule: ShapedConwayGameRule | null = null,
        borderRules: "cutoff" | "extend" = "cutoff"
    ) {
        this.xSize = xSize;
        this.ySize = ySize;
        this.rules = rules;
        this.borderRules = borderRules;
        this.aliveCellState = aliveCellState;
        this.fallbackRule = fallbackRule;
    }

    public centeredfPentomino(conway_game: ConwayGame | undefined): ConwayGame | null {
        if (this.xSize < 3 && this.ySize < 3) {
            console.error("Cannot create a Pentomino in a field smaller than 3 times 3");
            return null;
        }
        let pos = this.get_center();
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        } else {
            conway_game.clear_field();
        }
        conway_game.setOnActiveField(pos.xPos, pos.yPos, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos, pos.yPos + 1, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos, pos.yPos - 1, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(pos.xPos - 1, pos.yPos, new BooleanCell(this.aliveCellState));
        conway_game.setOnActiveField(
            pos.xPos + 1,
            pos.yPos + 1,
            new BooleanCell(this.aliveCellState)
        );
        return conway_game;
    }

    protected create_conway_game(): ConwayGame {
        let conway_game: ConwayGame = new ConwayGame(
            this.xSize,
            this.ySize,
            null,
            this.rules,
            this.fallbackRule,
            this.borderRules
        );
        return conway_game;
    }

    public circle(
        radius: number,
        steps: number = 1 / (2 * Math.PI),
        offsets: CellPosition[] | undefined = undefined,
        conway_game: ConwayGame | undefined = undefined
    ): ConwayGame {
        // TODO fix type + use
        let pos = this.get_center();
        offsets = offsets ?? [new CellPosition(0, 0)];
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        } else {
            conway_game.clear_field();
        }
        for (const offset of offsets) {
            // TODO calc overlap of shaped
            for (let radiusInc = 0; radiusInc < radius; radiusInc++) {
                let posToRotate = new CellPosition(0, radiusInc);
                for (let angle = 0; angle < 2 * Math.PI; angle += steps) {
                    let newXPos =
                        pos.xPos -
                        Math.round(
                            posToRotate.xPos * Math.cos(angle) +
                                posToRotate.yPos * -1 * Math.sin(angle)
                        );
                    let newYPos =
                        pos.yPos +
                        Math.round(
                            posToRotate.xPos * Math.sin(angle) + posToRotate.yPos * Math.cos(angle)
                        ); // TODO move pos calculation out
                    conway_game.setOnActiveField(
                        newXPos + offset.xPos,
                        newYPos + offset.yPos,
                        new BooleanCell(this.aliveCellState)
                    );
                }
            }
        }
        return conway_game;
    }

    public yline(length: number, conway_game: ConwayGame | undefined = undefined) {
        let center = this.get_center();
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        } else {
            conway_game.clear_field();
        }
        for (let curLength = 0; curLength < length; curLength++) {
            conway_game.setOnActiveField(
                center.xPos,
                center.yPos + curLength,
                new BooleanCell(this.aliveCellState)
            );
        }
        return conway_game;
    }

    protected get_center(): Position {
        let middleX: number = Math.ceil(this.xSize / 2);
        let middleY: number = Math.ceil(this.ySize / 2);
        return new CellPosition(middleX, middleY);
    }

    public randomize_cells(
        alive_above: number = 3,
        scale_rand: number = 10,
        conway_game: ConwayGame | undefined = undefined
    ): ConwayGame {
        if (conway_game == undefined) {
            conway_game = this.create_conway_game();
        } else {
            conway_game.clear_field();
        }
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                let rand_val = Math.round(Math.random() * scale_rand);
                if (rand_val >= alive_above) {
                    conway_game.setOnActiveField(
                        indexX,
                        indexY,
                        new BooleanCell(this.aliveCellState)
                    );
                }
            }
        }
        return conway_game;
    }
}

interface CellRepr {
    get data(): [number, number, number, number];
    get rgba_str(): string;

    clone(): CellRepr;
}

class CellColor implements CellRepr {
    r: number;
    g: number;
    b: number;
    a: number;

    constructor(r: number, g: number, b: number, a: number) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    static get BLACK(): CellColor {
        return new CellColor(0, 0, 0, 1);
    }

    static get WHITE(): CellColor {
        return new CellColor(255, 255, 255, 1);
    }

    get data(): [number, number, number, number] {
        return [this.r, this.g, this.b, this.a];
    }

    get rgba_str(): string {
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
    }

    public clone(): CellColor {
        return new CellColor(this.r, this.g, this.b, this.a);
    }
}

class FadingCellColor extends CellColor {
    start_repr: CellRepr;
    color_fade_factor: number;

    constructor(start_repr: CellRepr, fade_strength = 0.8) {
        const data = start_repr.data;
        super(data[0], data[1], data[2], data[3]);
        this.start_repr = start_repr;
        this.color_fade_factor = fade_strength;
    }

    public fade(times: number): void {
        this.r = this.r * this.color_fade_factor * times;
        this.g = this.g * this.color_fade_factor * times;
        this.b = this.b * this.color_fade_factor * times;
    }
}

class ConwayGameRepresenter {
    conway_game: ConwayGame;
    default_cell_alive_repr: string = "🟩";
    default_cell_dead_repr: string = "⬜";
    cell_repr_alive: CellRepr;
    cell_repr_dead: CellRepr;
    cell_repr_transparent: CellRepr;

    constructor(conway_game: ConwayGame, config: ConfigState) {
        this.conway_game = conway_game;
        this.cell_repr_alive = config.alive_cell_repr;
        this.cell_repr_dead = config.dead_cell_repr;
        this.cell_repr_transparent = new CellColor(0, 0, 0, 0);
    }

    protected representation(cell: ConwayCell): string {
        if (cell.isAlive) {
            return this.default_cell_alive_repr;
        }
        return this.default_cell_dead_repr;
    }

    public str_field() {
        let result_str = "";
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                let cell: ConwayCell = this.conway_game.getCurrentCell(indexX, indexY);
                result_str += this.representation(cell);
            }
            result_str += "\n";
        }
        return result_str;
    }

    public as_number_colors_arr(): CellRepr[] {
        let result: CellRepr[] = new Array(this.conway_game.xSize * this.conway_game.ySize).fill(
            this.cell_repr_transparent
        );
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                const cell: ConwayCell = this.conway_game.getCurrentCell(indexX, indexY);
                let one_dim_ind = indexX + indexY * this.conway_game.xSize;
                result[one_dim_ind] = cell.isAlive ? this.cell_repr_alive : this.cell_repr_dead;
            }
        }
        return result;
    }

    public number_color_arr(indexX: number, indexY: number): CellRepr {
        const cell: ConwayCell = this.conway_game.getCurrentCell(indexX, indexY);
        return cell.isAlive ? this.cell_repr_alive : this.cell_repr_dead;
    }
}

class AgingCellRepr {
    position: CellPosition;
    current_life: number;
    start_life: number;
    fading_cell_color: FadingCellColor;

    constructor(position: CellPosition, startLife: number, start_cell_repr: CellRepr) {
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

    public age() {
        this.current_life -= 1;
        this.fading_cell_color.fade(1);
    }

    public get_faded_repr(): CellRepr {
        return this.fading_cell_color;
    }
}

class ConwayHTMLDisplayer {
    canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
    config: ConfigState;
    posToCellWithVisualTrail: Map<string, AgingCellRepr>;
    nextCanvasBitMap: ImageBitmap | null;
    preRenderCanvas: OffscreenCanvas | null;
    preRenderContext: OffscreenCanvasRenderingContext2D | undefined;
    bitmapContext: ImageBitmapRenderingContext | undefined;

    constructor(
        canvas: HTMLCanvasElement | OffscreenCanvas | undefined,
        config: ConfigState,
        nextCanvasBitMap = null,
        preRenderCanvas: OffscreenCanvas | null = null,
        bitmapContext: ImageBitmapRenderingContext | null = null
    ) {
        this.nextCanvasBitMap = null;
        this.preRenderCanvas = null;
        this.canvas = <OffscreenCanvas>canvas;
        this.config = config;
        this.posToCellWithVisualTrail = new Map();
        if (canvas != undefined && preRenderCanvas != null) {
            this.bitmapContext = <ImageBitmapRenderingContext>(
                (<OffscreenCanvas>this.canvas).getContext("bitmaprenderer")
            );
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

    public addVisualTrailCellsAndAgeTrail(conway_game: ConwayGame) {
        if (this.config.trail_length == 1) {
            return;
        }
        const new_cell_trail_positions = conway_game.getLastStepDiedCellPositions();
        new_cell_trail_positions.forEach((pos, i, arr) => {
            this.posToCellWithVisualTrail.set(
                pos.toString(),
                new AgingCellRepr(pos, this.config.trail_length, this.config.alive_cell_repr)
            );
        });
        for (const [posString, val] of this.posToCellWithVisualTrail.entries()) {
            val.age();
            let agingRepr: AgingCellRepr | undefined = this.posToCellWithVisualTrail.get(posString);
            if (agingRepr != undefined && agingRepr?.current_life <= 0) {
                this.posToCellWithVisualTrail.delete(posString);
            }
        }
    }

    public updateEmojiGameFieldAsString(conwayGame: ConwayGame) {
        let gameSpace = document.getElementById("gameField");
        if (gameSpace != null) {
            let representer: ConwayGameRepresenter = new ConwayGameRepresenter(
                conwayGame,
                this.config
            );
            gameSpace.innerHTML = representer.str_field();
        }
    }

    async preprender_bitmap(conwayGame: ConwayGame) {
        if (!this.canvas) {
            throw Error("no canvas defined");
        }
        const representer: ConwayGameRepresenter = new ConwayGameRepresenter(
            conwayGame,
            this.config
        );
        const xSizeRect = this.canvas.width / conwayGame.xSize;
        const ySizeRect = this.canvas.height / conwayGame.ySize;
        let cur_res_index = 0;
        let alivePath: [number, number, number, number][] = [];
        let fadingPaths: Map<
            number,
            { cell_repr: CellRepr; fadingPath: [number, number, number, number][] }
        > = new Map();
        for (let xPos = 0; xPos < conwayGame.xSize; xPos++) {
            for (let yPos = 0; yPos < conwayGame.ySize; yPos++) {
                if (conwayGame.getCurrentCell(xPos, yPos).isAlive) {
                    alivePath.push([xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect]);
                }
                const fadingCell: AgingCellRepr | undefined = this.posToCellWithVisualTrail.get(
                    new CellPosition(xPos, yPos).toString()
                );
                if (fadingCell != undefined) {
                    if (!fadingPaths.has(fadingCell.current_life)) {
                        fadingPaths.set(fadingCell.current_life, {
                            cell_repr: fadingCell.fading_cell_color,
                            fadingPath: [],
                        });
                    }
                    let fadingPath = fadingPaths.get(fadingCell.current_life)?.fadingPath;
                    fadingPath?.push([xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect]);
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
    }

    protected renderPath(
        canvasContext: OffscreenCanvasRenderingContext2D,
        cell_repr: CellRepr,
        rectPath: [number, number, number, number][]
    ) {
        canvasContext?.beginPath();
        canvasContext.fillStyle = cell_repr.rgba_str;
        for (const path of rectPath) {
            canvasContext.rect(path[0], path[1], path[2], path[3]);
        }
        canvasContext?.closePath();
        canvasContext?.fill();
    }

    public async getPreRenderedBitmap(conwayGame: ConwayGame): Promise<ImageBitmap> {
        if (this.preRenderCanvas == null) {
            await this.preprender_bitmap(conwayGame);
        }
        return <ImageBitmap>this.nextCanvasBitMap;
    }

    public update_game_field_with_shapes_from_prerender(
        conwayGame: ConwayGame,
        offsetX: number = 0,
        offsetY: number = 0
    ) {
        this.addVisualTrailCellsAndAgeTrail(conwayGame);
        if (!this.canvas) {
            console.error("Canvas is undefined and therefore not usable");
            return;
        }

        if (this.bitmapContext == null) {
            return;
        }
        let prerenderedCanvas: Promise<ImageBitmap> = this.getPreRenderedBitmap(conwayGame);
        prerenderedCanvas.then((v) => {
            this.bitmapContext?.transferFromImageBitmap(v);
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

    public displayGeneration(generation: number) {
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

    public consumeUpdates() {
        this.config.on_screen_change().on(this.handleConfigUpdate.bind(this));
    }

    public handleConfigUpdate() {
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

    public mapToConwayFieldPosition(
        pos: { startPos: CellPosition; endPos: CellPosition },
        conway_game: ConwayGame
    ) {
        const startPosX = (pos.startPos.xPos / this.config.x_resolution) * conway_game.xSize;
        const startPosY =
            (pos.startPos.yPos / (this.config.x_resolution * this.config.screen_ratio)) *
            conway_game.ySize;
        const endPosX = (pos.endPos.xPos / this.config.x_resolution) * conway_game.xSize;
        const endPosY =
            (pos.endPos.yPos / (this.config.x_resolution * this.config.screen_ratio)) *
            conway_game.ySize;
        return {
            startPos: new CellPosition(Math.round(startPosX), Math.round(startPosY)),
            endPos: new CellPosition(Math.round(endPosX), Math.round(endPosY)),
        };
    }
}

class MousePositionHandler {
    lastXPosition: number;
    lastYPosition: number;
    timeStamp: number;
    path: { startPos: CellPosition; endPos: CellPosition } | null;
    constructor(startXPos: number, startYPos: number) {
        this.lastXPosition = startXPos;
        this.lastYPosition = startYPos;
        this.timeStamp = performance.now();
        this.path = null;
    }

    public updateMousePos(xPos: number, yPos: number): void {
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

    public getAndResetPath(): { startPos: Position; endPos: Position } | null {
        let p = null;
        if (this.path?.startPos != null && this.path?.endPos != null) {
            // TODO add clone function to cell position
            p = {
                startPos: new CellPosition(this.path?.startPos.xPos, this.path?.startPos.yPos),
                endPos: new CellPosition(this.path?.endPos.xPos, this.path?.endPos.yPos),
            };
        }
        this.path = null;
        return p;
    }
}

interface ISimpleEvent<T> {
    on(handler: { (data?: T): void }): void;
    off(handler: { (data?: T): void }): void;
}

class SimpleEvent<T> implements ISimpleEvent<T> {
    private handlers: { (data?: T): void }[] = []; // just functions which are called on trigger

    public on(handler: { (data?: T): void }): void {
        this.handlers.push(handler);
    }

    public off(handler: { (data?: T): void }): void {
        this.handlers = this.handlers.filter((h) => h !== handler);
    }

    public trigger(data?: T) {
        this.handlers.slice(0).forEach((h) => h(data));
    }

    public expose(): ISimpleEvent<T> {
        return this;
    }
}

class ConfigState {
    private _alive_cell_color: CellRepr;
    private _dead_cell_color: CellRepr;
    private _display_trails: number;
    private _mousePositionHandler: MousePositionHandler | null;
    private _screen_ratio: number;
    private _x_resolution: number;
    private current_BPM: number = 60;
    private _beat_offset_time_ms: number | null;
    game_settings_updated: boolean; // TODO equality check on attributes

    private readonly screen_change_event: SimpleEvent<void> = new SimpleEvent<void>();

    public on_screen_change(): ISimpleEvent<void> {
        return this.screen_change_event.expose();
    }

    public constructor(
        color_alive: CellColor = new CellColor(255, 255, 255, 255),
        color_dead: CellColor = new CellColor(0, 0, 20, 255),
        display_trails = 3,
        x_resolution = 1000,
        screen_ratio = 9 / 16
    ) {
        this._alive_cell_color = color_alive;
        this._dead_cell_color = color_dead;
        this._display_trails = Math.max(1, display_trails);
        this._x_resolution = x_resolution;
        this._screen_ratio = screen_ratio;
        this._mousePositionHandler = null;
        this.game_settings_updated = false;
        this._beat_offset_time_ms = null;
    }

    get alive_cell_repr(): CellRepr {
        return this._alive_cell_color;
    }

    set set_alive_cell_color(color: [number, number, number, number]) {
        this._alive_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
        this.game_settings_updated = true;
    }

    set set_dead_cell_color(color: [number, number, number, number]) {
        this._dead_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
        this.game_settings_updated = true;
    }

    set x_resolution(resolution: number) {
        this._x_resolution = Math.max(resolution, 100);
        this.screen_change_event.trigger();
    }

    get x_resolution(): number {
        return this._x_resolution;
    }

    set screen_ratio(ratio: number) {
        this._screen_ratio = ratio;
        this.screen_change_event.trigger();
    }

    get screen_ratio(): number {
        return this._screen_ratio;
    }

    get dead_cell_repr(): CellRepr {
        return this._dead_cell_color;
    }

    set mousePositionHandler(handler: MousePositionHandler) {
        this._mousePositionHandler = handler;
    }

    get getMousePositionHandler() {
        return this._mousePositionHandler;
    }

    get trail_length(): number {
        return this._display_trails;
    }

    get bpm_timeout_seconds() {
        return 1 / (this.bpm / 60);
    }

    set update_bpm(new_bpm: number) {
        this.current_BPM = new_bpm;
    }

    get bpm() {
        return this.current_BPM;
    }

    public get_beat_offset_seconds(time_ms: number) {
        console.log("the offset ", this._beat_offset_time_ms);
        if (this._beat_offset_time_ms === null) {
            return 0;
        }
        const offset = time_ms - this._beat_offset_time_ms;
        return Math.max(0, offset);
    }

    set beat_offset_seconds(time_ms: number | null) {
        this._beat_offset_time_ms = time_ms;
    }
}

const SURROUNDINGPOSITIONS = new Array(
    new CellPosition(-1, -1),
    new CellPosition(-1, 0),
    new CellPosition(-1, 1),
    new CellPosition(0, 1),
    new CellPosition(0, -1),
    new CellPosition(1, 1),
    new CellPosition(1, 0),
    new CellPosition(1, -1)
);
const DEFAULTGAMERULE = new Array(
    new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2, 3], [3])
);
const MULTIPLICATIONGAMERULE = new Array(
    new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2], [2])
);
const COPYGAMERULES = new Array(
    new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [1, 3, 5, 7], [1, 3, 5, 7])
);
const WORLD33RULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [3], [3]));
const WORLD236RULES = new Array(
    new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2, 3, 6], [3])
);
const SNAKEKINGRULEIDEA = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [2], [2]));
const WORLD44RULES = new Array(new ShapedConwayGameRule(null, SURROUNDINGPOSITIONS, [3], [2]));
const CENTERDEFAULTGAMERULE = new Array(
    new ShapedConwayGameRule(
        new Rectangle(new CellPosition(100, 0), new CellPosition(200, 200)),
        SURROUNDINGPOSITIONS,
        [2, 3],
        [3]
    )
);

export {
    ConwayCell,
    ConwayGame,
    ConwayGameFactory,
    CENTERDEFAULTGAMERULE,
    DEFAULTGAMERULE,
    ConwayHTMLDisplayer,
    ConwayGameRepresenter,
    CellColor,
    ConfigState as ConfigStorage,
    CellPosition,
    AgingCellRepr,
    MULTIPLICATIONGAMERULE,
    BooleanCell,
    ConwayGameAdvancer,
    MousePositionHandler,
    ResetGameRule,
    ShapedConwayGameRule,
};
