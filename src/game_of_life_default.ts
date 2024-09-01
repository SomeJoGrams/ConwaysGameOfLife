class ConwayCell {
    alive: boolean;

    constructor(alive: boolean = false) {
        this.alive = alive;
    }

    get is_alive(): boolean {
        return this.alive;
    }
}

interface Position {
    xPos: number;
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

class ConwayGameRule { // TODO make an interface
    result_state: boolean; // TODO make an interface and implement various rule kinds
    viewed_cell_positions: CellPosition[];
    alive_goes_to_result_state_with_neighbours: number[];
    dead_goes_to_result_state_with_neighbours: number[];
    last_cell_which_died: CellPosition | null;

    constructor(result_state: boolean, viewed_cells: CellPosition[], alive_goes_to_result_state_with_neighbours: number[] = [2, 3],
        dead_goes_to_result_state_with_neighbours: number[] = [3]) {
        this.result_state = result_state;
        this.viewed_cell_positions = viewed_cells
        this.alive_goes_to_result_state_with_neighbours = alive_goes_to_result_state_with_neighbours;
        this.dead_goes_to_result_state_with_neighbours = dead_goes_to_result_state_with_neighbours;
        this.last_cell_which_died = null;
    }

    public applyRuleToGame(xPos: number, yPos: number, old_conway_game: ConwayGame, new_conway_game: ConwayGame): ConwayGame {
        const living_neighbour_count = old_conway_game.cell_living_neighbours(xPos, yPos, this.viewed_cell_positions, old_conway_game.gameField);
        const cell: ConwayCell = old_conway_game.getCell(xPos, yPos);
        const is_alive_neighbour_count = this.alive_goes_to_result_state_with_neighbours.some(value => living_neighbour_count == value);
        const is_dead_neighbour_count = this.dead_goes_to_result_state_with_neighbours.some(value => living_neighbour_count == value);
        if (cell.is_alive && is_alive_neighbour_count) {
            new_conway_game.setCell(xPos, yPos, new ConwayCell(this.result_state));
        }
        else if (!cell.is_alive && is_dead_neighbour_count) {
            new_conway_game.setCell(xPos, yPos, new ConwayCell(this.result_state));
        }
        else if (cell.is_alive)
            this.last_cell_which_died = new CellPosition(xPos, yPos);
            // cell dies
        // else {
        //     // cell stays dead
        // }
        return new_conway_game;
    }

    public getIfLastCellKilledAtPosition(): CellPosition | null {
        let cell = this.last_cell_which_died;
        this.last_cell_which_died = null;
        return cell;
    }
}


class ConwayGame {
    xSize: number;
    ySize: number;
    gameField: ConwayCell[][];
    borderRules: "cutoff" | "extend";
    rules: ConwayGameRule[];
    lastStepDiedCells: CellPosition[];

    constructor(pxSize: number, pySize: number, cells: null | ConwayCell[][], rules: ConwayGameRule[], borderRules: "cutoff" | "extend" = "cutoff") {
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
        this.lastStepDiedCells = []
    }

    public getCell(xPos: number, yPos: number): ConwayCell{
        let cellPos: CellPosition = this.borderFixedRules(new CellPosition(xPos, yPos));
        return this.gameField[cellPos.yPos][cellPos.xPos];
    }

    public setCell(xPos: number, yPos: number, value: ConwayCell) {
        let cellPos: CellPosition = this.borderFixedRules(new CellPosition(xPos, yPos));
        this.gameField[cellPos.yPos][cellPos.xPos] = value;
    }

    protected borderFixedRules(pos: CellPosition): CellPosition {
        if (this.borderRules == "cutoff") {
            return pos;
        }
        let xPosFixed = pos.xPos;
        let yPosFixed = pos.yPos;
        if (pos.xPos >= this.xSize) {
            xPosFixed = pos.xPos % this.xSize;
        }
        if (pos.xPos < 0) {
            xPosFixed = (pos.xPos % this.xSize) * - 1;
        }
        if (pos.yPos >= this.ySize) {
            yPosFixed = pos.yPos % this.ySize;
        }
        if (pos.yPos < 0) {
            yPosFixed = (pos.yPos % this.ySize) * - 1;
        }
        return new CellPosition(xPosFixed, yPosFixed);
    }

    protected create_empty_conways_cell_array(): ConwayCell[][] {
        return new Array(this.ySize).fill(false).map(() => new Array(this.xSize).fill(new ConwayCell(false)));
    }

    public next_conway_game(): ConwayGame {
        let new_conway_cell_field: ConwayCell[][] = this.create_empty_conways_cell_array();
        let new_conway_game = new ConwayGame(this.xSize, this.ySize, new_conway_cell_field, this.rules);
        new_conway_game.lastStepDiedCells = [];
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                this.rules.forEach(rule => {
                    rule.applyRuleToGame(indexX, indexY, this, new_conway_game);
                    let optional_cell: CellPosition | null = rule.getIfLastCellKilledAtPosition();
                    if (optional_cell != null) {
                        new_conway_game.lastStepDiedCells.push(optional_cell)
                    }
                });
            }
        }
        return new_conway_game;
    }

    public getLastStepDiedCellPositions(): CellPosition[]{
        return this.lastStepDiedCells;
    }

    public cell_living_neighbours(indexX: number, indexY: number, lookingAt: Position[], gameField: ConwayCell[][]) {
        let count = 0;
        lookingAt.forEach((list, val, arr) => {
            let x1 = list.xPosition;
            let y1 = list.yPosition;
            let a = indexX + x1;
            let b = indexY + y1;
            if (this.in_field(a, b) && this.getCell(a, b).is_alive) {
                count += 1;
            }
        });
        return count;
    }

    protected in_field(indexX: number, indexY: number) {
        if (this.borderRules == "extend") {
            return true;   
        }
        let inField = ((indexX > 0 && indexY > 0) && (indexX < this.xSize && indexY < this.ySize));
        return inField;
    }

}

class ConwayGameFactory {
    xSize: number;
    ySize: number;
    rules: ConwayGameRule[];
    borderRules: "cutoff" | "extend";

    constructor(xSize: number, ySize: number, rules: ConwayGameRule[], borderRules: "cutoff" | "extend" = "cutoff") {
        this.xSize = xSize;
        this.ySize = ySize;
        this.rules = rules;
        this.borderRules = borderRules;
    }

    public centeredfPentomino(): ConwayGame | null {
        if (this.xSize < 3 && this.ySize < 3) {
            console.error("Cannot create a Pentomino in a field smaller than 3 times 3");
            return null;
        }
        let pos = this.get_center();
        let conway_game: ConwayGame = new ConwayGame(this.xSize, this.ySize, null, this.rules, this.borderRules);
        conway_game.setCell(pos.xPos, pos.yPos, new ConwayCell(true));
        conway_game.setCell(pos.xPos, pos.yPos + 1, new ConwayCell(true));
        conway_game.setCell(pos.xPos, pos.yPos - 1, new ConwayCell(true));
        conway_game.setCell(pos.xPos - 1, pos.yPos, new ConwayCell(true));
        conway_game.setCell(pos.xPos + 1, pos.yPos + 1, new ConwayCell(true));
        return conway_game;
    }

    public circle(radius: number, steps:number= 1/(2 * Math.PI)) {
        let pos = this.get_center();
        let conway_game: ConwayGame = new ConwayGame(this.xSize, this.ySize, null, this.rules, this.borderRules);
        for (let radiusInc = 0; radiusInc < radius; radiusInc++) {
            let posToRotate = new CellPosition(0, radiusInc);
            for (let angle = 0; angle < 2 * Math.PI; angle+=steps) {
                let newXPos = pos.xPos - (Math.round(posToRotate.xPos * Math.cos(angle) + posToRotate.yPos * -1 * Math.sin(angle)));
                let newYPos = pos.yPos + (Math.round(posToRotate.xPos * Math.sin(angle) + posToRotate.yPos * Math.cos(angle)));
                conway_game.setCell(newXPos, newYPos, new ConwayCell(true));
            }       
        }
        return conway_game;
    }

    public yline(length: number) {
        let center = this.get_center();
        let conway_game: ConwayGame = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (let curLength = 0; curLength < length; curLength++) {
            conway_game.gameField[center.xPos][center.yPos + curLength] = new ConwayCell(true); // TODO create y Positions
        }
        return conway_game;
    }

    protected get_center(): Position {
        let middleX: number = Math.ceil(this.xSize / 2);
        let middleY: number = Math.ceil(this.ySize / 2);
        return new CellPosition(middleX, middleY);
    }

    public randomize_cells(alive_above: number = 3, scale_rand: number = 10): ConwayGame {
        let conway_game: ConwayGame = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                let rand_val = Math.round(Math.random() * scale_rand);
                if (rand_val >= alive_above) {
                    conway_game.setCell(indexX, indexY, new ConwayCell(true));
                }
            }
        }
        return conway_game;
    }

}

interface CellRepr{
    get data(): [number, number, number, number];
    get rgba_str(): string;

    clone(): CellRepr;
}

class CellColor implements CellRepr{
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

    get rgba_str(): string{
        return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")"
    }

    public clone(): CellColor {
        return new CellColor(this.r, this.g, this.b, this.a);
    }
}

class FadingCellColor extends CellColor{
    start_repr: CellRepr;
    color_fade_factor: number;

    constructor(start_repr: CellRepr, fade_strength = 0.8) {
        const data = start_repr.data
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

class ConwayGameRepresenter{
    conway_game: ConwayGame;
    default_cell_alive_repr: string = "🟩";
    default_cell_dead_repr: string = "⬜";
    cell_repr_alive: CellRepr;
    cell_repr_dead: CellRepr;
    cell_repr_transparent: CellRepr;

    constructor(conway_game: ConwayGame, config: ConfigStorage){
        this.conway_game = conway_game;
        this.cell_repr_alive = config._alive_cell_color; 
        this.cell_repr_dead = config._dead_cell_color; 
        this.cell_repr_transparent = new CellColor(0, 0, 0, 0);
    }
    
    protected representation(cell: ConwayCell): string {
        if (cell.is_alive) {
            return this.default_cell_alive_repr;
        }
        return this.default_cell_dead_repr;
    }

    public str_field() {
        let result_str = ""
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                let cell: ConwayCell = this.conway_game.gameField[indexX][indexY];
                result_str += this.representation(cell);
            }
            result_str += "\n"
        }
        return result_str
    }

    public as_number_colors_arr(): CellRepr[] {
        let result: CellRepr[] = new Array((this.conway_game.xSize) * (this.conway_game.ySize)).fill(this.cell_repr_transparent);
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                const cell: ConwayCell = this.conway_game.getCell(indexX, indexY);
                let one_dim_ind = indexX + indexY * (this.conway_game.xSize);
                result[one_dim_ind] = cell.is_alive ? this.cell_repr_alive : this.cell_repr_dead;
            }
        }
        return result;
    }

    public number_color_arr(indexX: number, indexY: number): CellRepr{
        const cell: ConwayCell = this.conway_game.getCell(indexX, indexY);
        return cell.is_alive ? this.cell_repr_alive : this.cell_repr_dead
    }

}

class AgingCellRepr{
    position: CellPosition;
    current_life: number;
    start_life: number;
    fading_cell_color: FadingCellColor;

    constructor(position: CellPosition, startLife: number, start_cell_repr: CellRepr){
        this.position = position;
        this.current_life = startLife;
        this.start_life = startLife;
        this.fading_cell_color = new FadingCellColor(start_cell_repr);
    }

    get completlyFaded() {
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
    xStyleCanvas: string;
    yStyleCanvas: string;
    xPixels: number;
    yPixels: number;
    config: ConfigStorage;
    posToCellWithVisualTrail: Map<string, AgingCellRepr>;

    constructor(xStyle: string, yStyle: string, xPixels: number, yPixels: number, config: ConfigStorage) {
        this.xStyleCanvas = xStyle;
        this.yStyleCanvas = yStyle;
        this.xPixels = xPixels;
        this.yPixels = yPixels;
        this.config = config;
        this.posToCellWithVisualTrail = new Map();
    }

    public addVisualTrailCellsAndAgeTrail(conway_game: ConwayGame) {
        if (this.config.trail_length == 1) {
            return;
        }
        const new_cell_trail_positions = conway_game.getLastStepDiedCellPositions()
        new_cell_trail_positions.forEach((pos, i, arr) => {
            this.posToCellWithVisualTrail.set(pos.toString(), new AgingCellRepr(pos, this.config.trail_length, this.config.alive_cell_repr))
        });
        this.posToCellWithVisualTrail.forEach((val, key, map) => {
            val.age()
        })
    }

    public updateEmojiGameFieldAsString(conwayGame: ConwayGame) {
        let gameSpace = document.getElementById("gameField");
        if (gameSpace != null) {
            let representer: ConwayGameRepresenter = new ConwayGameRepresenter(conwayGame, this.config);
            gameSpace.innerHTML = representer.str_field();
        }
    }

    public updategameFieldPixelsAsCanvas(conwayGame: ConwayGame, offsetX: number = 0, offsetY: number = 0) {
        this.addVisualTrailCellsAndAgeTrail(conwayGame);
        const representer: ConwayGameRepresenter = new ConwayGameRepresenter(conwayGame, this.config);
        const gameSpace = document.getElementById("gameField");
        const canvas = this.create_missing_html_canvas_on_gamefield()
        let context = canvas.getContext("2d");
        const imageData = context?.createImageData(offsetX, offsetY);
        if (!imageData) {
            return;
        }
        const number_color_arr: CellRepr[] = representer.as_number_colors_arr();
        let cur_res_index = 0;
        for (let i = 0; i < imageData.data.length; i += 4) { // TODO just flatten, how to do that with ro props
            let cell_repr: CellRepr = number_color_arr[cur_res_index];
            let cell_repr_data = cell_repr.data;
            imageData.data[i + 0] = cell_repr_data[0]; // R value
            imageData.data[i + 1] = cell_repr_data[1]; // G value
            imageData.data[i + 2] = cell_repr_data[2]; // B value
            imageData.data[i + 3] = cell_repr_data[3]; // A value
            cur_res_index += 1;
        }
        context?.putImageData(imageData, offsetX, offsetY);
        if (context) {
            context.imageSmoothingEnabled = false;
        }
        gameSpace?.replaceChildren(canvas);
    }

    protected create_missing_html_canvas_on_gamefield() : HTMLCanvasElement{
        let gameSpace = document.getElementById("gameField");
        if (gameSpace == null) {
            console.error("couldn't find the gameField");
        }
        let canvas: HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById("gameFieldCanvas");
        if (canvas == null) {
            canvas = document.createElement("canvas");
            canvas.id = "gameFieldCanvas";
        }
        // also resize the wrapping html might be needed again
        canvas.style.width = this.xStyleCanvas;
        canvas.style.height = this.yStyleCanvas;
        canvas.width = this.xPixels;
        canvas.height = this.yPixels;
        return canvas;
    }

    public updategameFieldWithShapes(conwayGame: ConwayGame, offsetX: number = 0, offsetY: number = 0) {
        this.addVisualTrailCellsAndAgeTrail(conwayGame);
        const representer: ConwayGameRepresenter = new ConwayGameRepresenter(conwayGame, this.config);
        const gameSpace = document.getElementById("gameField");
        const canvas = this.create_missing_html_canvas_on_gamefield();
        const context = canvas.getContext("2d");
        const xSizeRect = canvas.width / conwayGame.xSize;
        const ySizeRect = canvas.height / conwayGame.ySize;
        let cur_res_index = 0;
        if (context == null) {
            return;
        }
        for (let xPos = 0; xPos < conwayGame.xSize; xPos++){
            for (let yPos = 0; yPos < conwayGame.ySize; yPos++){
                const fadingCell: AgingCellRepr | undefined = this.posToCellWithVisualTrail.get(new CellPosition(xPos, yPos).toString());
                let cell_repr: CellRepr = this.faded_cell_repr_data_or_cell_repr(representer.number_color_arr(xPos, yPos), fadingCell);
                context.fillStyle = cell_repr.rgba_str;
                context?.fillRect(xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect);
                cur_res_index++;
            }
        }
        if (context) {
            context.imageSmoothingEnabled = false;
        }
        gameSpace?.replaceChildren(canvas);
    }

    protected faded_cell_repr_data_or_cell_repr(original_cell_repr: CellRepr, opt_fading_cell: AgingCellRepr | undefined = undefined) {
        let cell_repr = original_cell_repr;
        if (opt_fading_cell != undefined && !opt_fading_cell.completlyFaded && cell_repr == this.config.dead_cell_repr && opt_fading_cell.isAged) {
            cell_repr = opt_fading_cell.fading_cell_color;
        }
        return cell_repr;
    }


    public displayGeneration(generation: number) {
        let currentGenerationElement = document.getElementById("GameFieldCurrentGeneration");
        if (currentGenerationElement != null) {
            let new_element = document.createElement("h1");
            new_element.innerHTML = "current Generation: " + generation.toString();
            currentGenerationElement.childNodes.forEach(element => {
                element.remove();
            });
            currentGenerationElement.appendChild(new_element);
        }
}
        
}

class ConfigStorage {
    _alive_cell_color: CellRepr;
    _dead_cell_color: CellRepr;
    _display_trails: number;
    public constructor(color_alive: CellColor = new CellColor(255, 255, 255, 255), color_dead: CellColor = new CellColor(0, 0, 20, 255), display_trails=1) {
        this._alive_cell_color = color_alive;
        this._dead_cell_color = color_dead;
        this._display_trails = Math.max(1, display_trails);
    }

    get alive_cell_repr(): CellRepr {
        return this._alive_cell_color;
    }

    get dead_cell_repr(): CellRepr{
        return this._dead_cell_color;
    }

    get trail_length(): number{
        return this._display_trails;
    }
    
}

const SURROUNDINGPOSITIONS = new Array(new CellPosition(-1, -1), new CellPosition(-1, 0), new CellPosition(-1, 1), new CellPosition(0, 1), new CellPosition(0, -1), new CellPosition(1, 1), new CellPosition(1, 0), new CellPosition(1, -1));
const DEFAULTGAMERULE = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2,3], [3]));
const MULTIPLICATIONGAMERULE = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2], [2]));
const COPYGAMERULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [1, 3, 5, 7], [1, 3, 5, 7]));
const WORLD33RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [3], [3]));
const WORLD236RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2, 3, 6], [3]));
const SNAKEKINGRULEIDEA = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [2], [2]));
const WORLD44RULES = new Array(new ConwayGameRule(true, SURROUNDINGPOSITIONS, [3], [2]));

export {ConwayCell, ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConwayGameRepresenter, CellColor, ConfigStorage, CellPosition, AgingCellRepr};