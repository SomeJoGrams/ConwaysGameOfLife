class ConwayCell<CELLSTATES>{
    alive: CELLSTATES;

    constructor(alive: CELLSTATES) {
        this.alive = alive;
    }

    get is_alive(): CELLSTATES { // HOW to do this better with generics?
        return this.alive;
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

interface ConwayGameRule<CELLSTATES>{
    applyRuleToGame(xPos: number, yPos: number, old_conway_game: ConwayGame<CELLSTATES>, new_conway_game: ConwayGame<CELLSTATES>): ConwayGame<CELLSTATES>;
    getIfLastCellKilledAtPosition(): CellPosition | null;
}

abstract class Shape{
    abstract inBounds(xPos: number, yPos: number): boolean;
    
    inBoundsPos(position: Position): boolean {
        return this.inBounds(position.xPos, position.yPos);
    }
}

class Rectangle extends Shape{
    lowerLeftCorner: Position;
    upperRightCorner: Position;

    constructor(lowerLeftCorner: Position, upperRightCorner: Position) {
        super();
        this.lowerLeftCorner = lowerLeftCorner;
        this.upperRightCorner = upperRightCorner;
    }

    public inBounds(xPos: number, yPos: number): boolean{
        return xPos > this.lowerLeftCorner.xPos && xPos < this.upperRightCorner.yPos &&
                yPos > this.lowerLeftCorner.yPos && yPos < this.upperRightCorner.yPos
    }

}

class ShapedConwayGameRule<CELLSTATES> implements ConwayGameRule<CELLSTATES>{
    result_state: CELLSTATES; // TODO make an interface and implement various rule kinds
    viewed_cell_positions: CellPosition[];
    alive_goes_to_result_state_with_neighbours: number[];
    dead_goes_to_result_state_with_neighbours: number[];
    last_cell_which_died: CellPosition | null;
    shape: Shape | null;

    constructor(shape: Shape | null, result_state: CELLSTATES, viewed_cells: CellPosition[], alive_goes_to_result_state_with_neighbours: number[] = [2, 3],
        dead_goes_to_result_state_with_neighbours: number[] = [3]) {
        this.shape = shape;
        this.result_state = result_state;
        this.viewed_cell_positions = viewed_cells
        this.alive_goes_to_result_state_with_neighbours = alive_goes_to_result_state_with_neighbours;
        this.dead_goes_to_result_state_with_neighbours = dead_goes_to_result_state_with_neighbours;
        this.last_cell_which_died = null;
    }

    public applyRuleToGame(xPos: number, yPos: number, old_conway_game: ConwayGame<CELLSTATES>, new_conway_game: ConwayGame<CELLSTATES>): ConwayGame<CELLSTATES> {
        const cell: ConwayCell<CELLSTATES> = old_conway_game.getCell(xPos, yPos);
        let position = old_conway_game.borderFixedRules(new CellPosition(xPos, yPos));
        if (this.shape != null && !this.shape.inBoundsPos(position)) {
            return new_conway_game;
        }
        const living_neighbour_count = old_conway_game.cell_living_neighbours(position.xPos, position.yPos, this.viewed_cell_positions);
        const is_alive_neighbour_count = this.alive_goes_to_result_state_with_neighbours.some(value => living_neighbour_count == value);
        const is_dead_neighbour_count = this.dead_goes_to_result_state_with_neighbours.some(value => living_neighbour_count == value);
        if (cell.is_alive && is_alive_neighbour_count) {
            new_conway_game.setCell(position.xPos, position.yPos, new ConwayCell(this.result_state));
        }
        else if (!cell.is_alive && is_dead_neighbour_count) {
            new_conway_game.setCell(position.xPos, position.yPos, new ConwayCell(this.result_state));
        }
        else if (cell.is_alive)
            this.last_cell_which_died = new CellPosition(position.xPos, position.yPos);
        return new_conway_game;
    }

    public getIfLastCellKilledAtPosition(): CellPosition | null {
        let cell = this.last_cell_which_died;
        this.last_cell_which_died = null;
        return cell;
    }

}

class ConwayGame<CELLSTATES>{
    xSize: number;
    ySize: number;
    gameField: ConwayCell<CELLSTATES>[][];
    borderRules: "cutoff" | "extend";
    positional_rules: ShapedConwayGameRule<CELLSTATES>[];
    lastStepDiedCells: CellPosition[];

    constructor(pxSize: number, pySize: number, cells: null | ConwayCell<CELLSTATES>[][], rules: ShapedConwayGameRule<CELLSTATES>[], borderRules: "cutoff" | "extend" = "cutoff") {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.borderRules = borderRules;
        if (cells == null) {
            this.gameField = this.create_empty_conways_cell_array();
        }
        else {
            this.gameField = cells;
        }
        this.positional_rules = rules;
        this.lastStepDiedCells = []
    }

    public getCell(xPos: number, yPos: number): ConwayCell<CELLSTATES>{
        let cellPos: CellPosition = this.borderFixedRules(new CellPosition(xPos, yPos));
        return this.gameField[cellPos.yPos][cellPos.xPos];
    }

    public setCell(xPos: number, yPos: number, value: ConwayCell<CELLSTATES>) {
        let cellPos: CellPosition = this.borderFixedRules(new CellPosition(xPos, yPos));
        this.gameField[cellPos.yPos][cellPos.xPos] = value;
    }

    public borderFixedRules(pos: CellPosition): CellPosition {
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

    protected create_empty_conways_cell_array(): ConwayCell<CELLSTATES>[][] {
        return new Array(this.ySize).fill(false).map(() => new Array(this.xSize).fill(new ConwayCell(false)));
    }

    public next_conway_game(): ConwayGame<CELLSTATES> {
        let new_conway_cell_field: ConwayCell<CELLSTATES>[][] = this.create_empty_conways_cell_array();
        let new_conway_game = new ConwayGame(this.xSize, this.ySize, new_conway_cell_field, this.positional_rules);
        new_conway_game.lastStepDiedCells = [];
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                this.positional_rules.forEach(rule => {
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

    public cell_living_neighbours(indexX: number, indexY: number, lookingAt: Position[]) {
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

class ConwayGameFactory<CELLSTATES>{
    xSize: number;
    ySize: number;
    rules: ShapedConwayGameRule<CELLSTATES>[];
    borderRules: "cutoff" | "extend";
    aliveCellState: CELLSTATES;

    constructor(xSize: number, ySize: number, rules: ShapedConwayGameRule<CELLSTATES>[], aliveCellState: CELLSTATES, borderRules: "cutoff" | "extend" = "cutoff") {
        this.xSize = xSize;
        this.ySize = ySize;
        this.rules = rules;
        this.borderRules = borderRules;
        this.aliveCellState = aliveCellState;
    }

    public centeredfPentomino(): ConwayGame<CELLSTATES> | null {
        if (this.xSize < 3 && this.ySize < 3) {
            console.error("Cannot create a Pentomino in a field smaller than 3 times 3");
            return null;
        }
        let pos = this.get_center();
        let conway_game: ConwayGame<CELLSTATES> = new ConwayGame(this.xSize, this.ySize, null, this.rules, this.borderRules);
        conway_game.setCell(pos.xPos, pos.yPos, new ConwayCell(this.aliveCellState));
        conway_game.setCell(pos.xPos, pos.yPos + 1, new ConwayCell(this.aliveCellState));
        conway_game.setCell(pos.xPos, pos.yPos - 1, new ConwayCell(this.aliveCellState));
        conway_game.setCell(pos.xPos - 1, pos.yPos, new ConwayCell(this.aliveCellState));
        conway_game.setCell(pos.xPos + 1, pos.yPos + 1, new ConwayCell(this.aliveCellState));
        return conway_game;
    }

    public circle(radius: number, steps:number= 1/(2 * Math.PI), offsets: CellPosition[] = [new CellPosition(0, 0)]) { // TODO fix type + use
        let pos = this.get_center();
        let conway_game: ConwayGame<CELLSTATES> = new ConwayGame(this.xSize, this.ySize, null, this.rules, this.borderRules);        
        for (const offset of offsets) { // TODO calc overlap of shaped
            for (let radiusInc = 0; radiusInc < radius; radiusInc++) {
                let posToRotate = new CellPosition(0, radiusInc);
                for (let angle = 0; angle < 2 * Math.PI; angle += steps) {
                    let newXPos = pos.xPos - (Math.round(posToRotate.xPos * Math.cos(angle) + posToRotate.yPos * -1 * Math.sin(angle)));
                    let newYPos = pos.yPos + (Math.round(posToRotate.xPos * Math.sin(angle) + posToRotate.yPos * Math.cos(angle))); // TODO move pos calculation out
                    conway_game.setCell(newXPos + offset.xPos, newYPos + offset.yPos, new ConwayCell(this.aliveCellState));
                }
            }
        }
        return conway_game;
    }

    public yline(length: number) {
        let center = this.get_center();
        let conway_game: ConwayGame<CELLSTATES> = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (let curLength = 0; curLength < length; curLength++) {
            conway_game.gameField[center.xPos][center.yPos + curLength] = new ConwayCell(this.aliveCellState); // TODO create y Positions
        }
        return conway_game;
    }

    protected get_center(): Position {
        let middleX: number = Math.ceil(this.xSize / 2);
        let middleY: number = Math.ceil(this.ySize / 2);
        return new CellPosition(middleX, middleY);
    }

    public randomize_cells(alive_above: number = 3, scale_rand: number = 10): ConwayGame<CELLSTATES> {
        let conway_game: ConwayGame<CELLSTATES> = new ConwayGame(this.xSize, this.ySize, null, this.rules, "cutoff");
        for (let indexX = 0; indexX < this.xSize; indexX++) {
            for (let indexY = 0; indexY < this.ySize; indexY++) {
                let rand_val = Math.round(Math.random() * scale_rand);
                if (rand_val >= alive_above) {
                    conway_game.setCell(indexX, indexY, new ConwayCell(this.aliveCellState));
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

class ConwayGameRepresenter<CELLSTATES>{
    conway_game: ConwayGame<CELLSTATES>;
    default_cell_alive_repr: string = "🟩";
    default_cell_dead_repr: string = "⬜";
    cell_repr_alive: CellRepr;
    cell_repr_dead: CellRepr;
    cell_repr_transparent: CellRepr;

    constructor(conway_game: ConwayGame<CELLSTATES>, config: ConfigStorage){
        this.conway_game = conway_game;
        this.cell_repr_alive = config._alive_cell_color; 
        this.cell_repr_dead = config._dead_cell_color; 
        this.cell_repr_transparent = new CellColor(0, 0, 0, 0);
    }
    
    protected representation(cell: ConwayCell<CELLSTATES>): string {
        if (cell.is_alive) {
            return this.default_cell_alive_repr;
        }
        return this.default_cell_dead_repr;
    }

    public str_field() {
        let result_str = ""
        for (let indexX = 0; indexX < this.conway_game.xSize; indexX++) {
            for (let indexY = 0; indexY < this.conway_game.ySize; indexY++) {
                let cell: ConwayCell<CELLSTATES> = this.conway_game.gameField[indexX][indexY];
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
                const cell: ConwayCell<CELLSTATES> = this.conway_game.getCell(indexX, indexY);
                let one_dim_ind = indexX + indexY * (this.conway_game.xSize);
                result[one_dim_ind] = cell.is_alive ? this.cell_repr_alive : this.cell_repr_dead;
            }
        }
        return result;
    }

    public number_color_arr(indexX: number, indexY: number): CellRepr{
        const cell: ConwayCell<CELLSTATES> = this.conway_game.getCell(indexX, indexY);
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


class ConwayHTMLDisplayer<CELLSTATES>{
    canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
    xPixels: number;
    yPixels: number;
    config: ConfigStorage;
    posToCellWithVisualTrail: Map<string, AgingCellRepr>;
    nextCanvasBitMap: ImageBitmap | null;
    preRenderCanvas: OffscreenCanvas | null;
    bitmapContext: ImageBitmapRenderingContext;

    constructor(canvas: HTMLCanvasElement | OffscreenCanvas | undefined, xPixels: number, yPixels: number, config: ConfigStorage, nextCanvasBitMap = null, preRenderCanvas: OffscreenCanvas | null = null, bitmapContext: ImageBitmapRenderingContext | null = null) {
        this.nextCanvasBitMap = null;
        this.preRenderCanvas = null;
        this.canvas = <OffscreenCanvas>canvas;
        this.xPixels = xPixels;
        this.yPixels = yPixels;
        this.config = config;
        this.posToCellWithVisualTrail = new Map();
        this.canvas.width = this.xPixels;
        this.canvas.height = this.yPixels;
        this.bitmapContext = <ImageBitmapRenderingContext>(<OffscreenCanvas>this.canvas).getContext("bitmaprenderer");
        if (canvas != undefined && preRenderCanvas != null) {
            this.nextCanvasBitMap = nextCanvasBitMap;
            this.preRenderCanvas = preRenderCanvas;
            this.preRenderCanvas.width = this.xPixels;
            this.preRenderCanvas.height = this.yPixels;

        }
    }

    public addVisualTrailCellsAndAgeTrail(conway_game: ConwayGame<CELLSTATES>) {
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


    public updateEmojiGameFieldAsString(conwayGame: ConwayGame<CELLSTATES>) {
        let gameSpace = document.getElementById("gameField");
        if (gameSpace != null) {
            let representer: ConwayGameRepresenter<CELLSTATES> = new ConwayGameRepresenter(conwayGame, this.config);
            gameSpace.innerHTML = representer.str_field();
        }
    }

    // TODO fix function
    // public updategameFieldPixelsAsCanvas(conwayGame: ConwayGame, offsetX: number = 0, offsetY: number = 0) {
    //     this.addVisualTrailCellsAndAgeTrail(conwayGame);
    //     const representer: ConwayGameRepresenter = new ConwayGameRepresenter(conwayGame, this.config);
    //     if (!this.canvas) { // TODO fix
    //         console.error("Canvas is undefined");
    //         return;
    //     }
    //     let context = this.canvas.getContext("2d");
    //     this.configure_canvas();
    //     const imageData = context?.createImageData(offsetX, offsetY);
    //     if (!imageData) {
    //         return;
    //     }
    //     const number_color_arr: CellRepr[] = representer.as_number_colors_arr();
    //     let cur_res_index = 0;
    //     for (let i = 0; i < imageData.data.length; i += 4) { // TODO just flatten, how to do that with ro props
    //         let cell_repr: CellRepr = number_color_arr[cur_res_index];
    //         let cell_repr_data = cell_repr.data;
    //         imageData.data[i + 0] = cell_repr_data[0]; // R value
    //         imageData.data[i + 1] = cell_repr_data[1]; // G value
    //         imageData.data[i + 2] = cell_repr_data[2]; // B value
    //         imageData.data[i + 3] = cell_repr_data[3]; // A value
    //         cur_res_index += 1;
    //     }
    //     context?.putImageData(imageData, offsetX, offsetY);
    //     if (context) {
    //         context.imageSmoothingEnabled = false;
    //     }
    // }

    async preprender_bitmap(conwayGame: ConwayGame<CELLSTATES>) {
        if (!this.canvas) {
            throw Error("no canvas defined");
        }
        const representer: ConwayGameRepresenter<CELLSTATES> = new ConwayGameRepresenter(conwayGame, this.config);
        const xSizeRect = this.canvas.width / conwayGame.xSize;
        const ySizeRect = this.canvas.height / conwayGame.ySize;
        let cur_res_index = 0;
        let alivePath = [];
        // let deadPath = [];
        let fadingPaths = [];
        for (let xPos = 0; xPos < conwayGame.xSize; xPos++) {
            for (let yPos = 0; yPos < conwayGame.ySize; yPos++) {
                // const fadingCell: AgingCellRepr | undefined = this.posToCellWithVisualTrail.get(new CellPosition(xPos, yPos).toString());
                //let cell_repr: CellRepr = this.faded_cell_repr_data_or_cell_repr(representer.number_color_arr(xPos, yPos) //, fadingCell);
                if (conwayGame.getCell(xPos, yPos).is_alive) {
                    alivePath.push([xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect]);
                }
                // context?.rect(xPos * xSizeRect, yPos * ySizeRect, xSizeRect, ySizeRect);
                // context.fillStyle = representer.number_color_arr(xPos, yPos).rgba_str;
                cur_res_index++;
            }
        }
        let new_context = this.preRenderCanvas?.getContext("2d", { alpha: false });
        if (new_context == null) {
            throw Error("No Context exists");
        }
        new_context.imageSmoothingEnabled = false;
        new_context.fillStyle = representer.cell_repr_dead.rgba_str;
        new_context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        new_context?.beginPath()
        new_context.fillStyle = representer.cell_repr_alive.rgba_str;
        for (const path of alivePath) {
            new_context.rect(path[0], path[1], path[2], path[3]);
        }
        new_context?.closePath()
        new_context?.fill()
        if (this.preRenderCanvas) {
            this.nextCanvasBitMap = this.preRenderCanvas.transferToImageBitmap()
        }
    }

    public async getPreRenderedBitmap(conwayGame: ConwayGame<CELLSTATES>): Promise<ImageBitmap> {
        if (this.preRenderCanvas == null) {
            await this.preprender_bitmap(conwayGame);
        }
        return <ImageBitmap>this.nextCanvasBitMap;
    }

    public updategameFieldWithShapesFromPreRender(conwayGame: ConwayGame<CELLSTATES>, offsetX: number = 0, offsetY: number = 0) {
        this.addVisualTrailCellsAndAgeTrail(conwayGame);
        if (!this.canvas) {
            console.error("Canvas is undefined and therfore not usable") 
            return;
        }

        if (this.bitmapContext == null) {
            return;
        }
        let prerenderedCanvas: Promise<ImageBitmap> = this.getPreRenderedBitmap(conwayGame);
        prerenderedCanvas.then((v) => {
            this.bitmapContext.transferFromImageBitmap(v);
        });
        this.nextCanvasBitMap = null;
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

    set set_alive_cell_color(color :[number, number, number, number]) {
        this._alive_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
    }

    set set_dead_cell_color(color :[number, number, number, number]) {
        this._dead_cell_color = new CellColor(color[0], color[1], color[2], color[3]);
    }

    get dead_cell_repr(): CellRepr{
        return this._dead_cell_color;
    }

    get trail_length(): number{
        return this._display_trails;
    }
    
}

const SURROUNDINGPOSITIONS = new Array(new CellPosition(-1, -1), new CellPosition(-1, 0), new CellPosition(-1, 1), new CellPosition(0, 1), new CellPosition(0, -1), new CellPosition(1, 1), new CellPosition(1, 0), new CellPosition(1, -1));
const DEFAULTGAMERULE = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [2,3], [3]));
const MULTIPLICATIONGAMERULE = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [2], [2]));
const COPYGAMERULES = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [1, 3, 5, 7], [1, 3, 5, 7]));
const WORLD33RULES = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [3], [3]));
const WORLD236RULES = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [2, 3, 6], [3]));
const SNAKEKINGRULEIDEA = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [2], [2]));
const WORLD44RULES = new Array(new ShapedConwayGameRule(null, true, SURROUNDINGPOSITIONS, [3], [2]));

export {ConwayCell, ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConwayGameRepresenter, CellColor, ConfigStorage, CellPosition, AgingCellRepr, MULTIPLICATIONGAMERULE};