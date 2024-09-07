declare class ConwayCell {
    alive: boolean;
    constructor(alive?: boolean);
    get is_alive(): boolean;
}
interface Position {
    xPos: number;
    yPos: number;
    get xPosition(): number;
    get yPosition(): number;
    toString(): string;
}
declare class CellPosition implements Position {
    xPos: number;
    yPos: number;
    constructor(xPos: number, yPos: number);
    get xPosition(): number;
    get yPosition(): number;
    toString(): string;
}
declare class ConwayGameRule {
    result_state: boolean;
    viewed_cell_positions: CellPosition[];
    alive_goes_to_result_state_with_neighbours: number[];
    dead_goes_to_result_state_with_neighbours: number[];
    last_cell_which_died: CellPosition | null;
    constructor(result_state: boolean, viewed_cells: CellPosition[], alive_goes_to_result_state_with_neighbours?: number[], dead_goes_to_result_state_with_neighbours?: number[]);
    applyRuleOnPos(xPos: number, yPos: number, old_conway_game: ConwayGame, new_conway_game: ConwayGame): ConwayGame;
    getIfLastCellKilledAtPosition(): CellPosition | null;
}
declare class ConwayGame {
    xSize: number;
    ySize: number;
    gameField: ConwayCell[][];
    borderRules: "cutoff" | "extend";
    rules: ConwayGameRule[];
    lastStepDiedCells: CellPosition[];
    constructor(pxSize: number, pySize: number, cells: null | ConwayCell[][], rules: ConwayGameRule[], borderRules?: "cutoff" | "extend");
    getCell(xPos: number, yPos: number): ConwayCell;
    setCell(xPos: number, yPos: number, value: ConwayCell): void;
    protected borderFixedRules(pos: CellPosition): CellPosition;
    protected create_empty_conways_cell_array(): ConwayCell[][];
    next_conway_game(): ConwayGame;
    getLastStepDiedCellPositions(): CellPosition[];
    cell_living_neighbours(indexX: number, indexY: number, lookingAt: Position[], gameField: ConwayCell[][]): number;
    protected in_field(indexX: number, indexY: number): boolean;
}
declare class ConwayGameFactory {
    xSize: number;
    ySize: number;
    rules: ConwayGameRule[];
    borderRules: "cutoff" | "extend";
    constructor(xSize: number, ySize: number, rules: ConwayGameRule[], borderRules?: "cutoff" | "extend");
    centeredfPentomino(): ConwayGame | null;
    circle(radius: number, steps?: number): ConwayGame;
    yline(length: number): ConwayGame;
    protected get_center(): Position;
    randomize_cells(alive_above?: number, scale_rand?: number): ConwayGame;
}
interface CellRepr {
    get data(): [number, number, number, number];
    get rgba_str(): string;
    clone(): CellRepr;
}
declare class CellColor implements CellRepr {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
    static get BLACK(): CellColor;
    static get WHITE(): CellColor;
    get data(): [number, number, number, number];
    get rgba_str(): string;
    clone(): CellColor;
}
declare class FadingCellColor extends CellColor {
    start_repr: CellRepr;
    color_fade_factor: number;
    constructor(start_repr: CellRepr, fade_strength?: number);
    fade(times: number): void;
}
declare class ConwayGameRepresenter {
    conway_game: ConwayGame;
    default_cell_alive_repr: string;
    default_cell_dead_repr: string;
    cell_repr_alive: CellRepr;
    cell_repr_dead: CellRepr;
    cell_repr_transparent: CellRepr;
    constructor(conway_game: ConwayGame, config: ConfigStorage);
    protected representation(cell: ConwayCell): string;
    str_field(): string;
    as_number_colors_arr(): CellRepr[];
    number_color_arr(indexX: number, indexY: number): CellRepr;
}
declare class AgingCellRepr {
    position: CellPosition;
    current_life: number;
    start_life: number;
    fading_cell_color: FadingCellColor;
    constructor(position: CellPosition, startLife: number, start_cell_repr: CellRepr);
    get completlyFaded(): boolean;
    get isAged(): boolean;
    age(): void;
    get_faded_repr(): CellRepr;
}
declare class ConwayHTMLDisplayer {
    canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
    xStyleCanvas: string;
    yStyleCanvas: string;
    xPixels: number;
    yPixels: number;
    config: ConfigStorage;
    posToCellWithVisualTrail: Map<string, AgingCellRepr>;
    nextCanvasBitMap: ImageBitmap | null;
    preRenderCanvas: OffscreenCanvas | null;
    constructor(canvas: HTMLCanvasElement | OffscreenCanvas | undefined, xStyle: string, yStyle: string, xPixels: number, yPixels: number, config: ConfigStorage, nextCanvasBitMap?: null, preRenderCanvas?: null);
    addVisualTrailCellsAndAgeTrail(conway_game: ConwayGame): void;
    updateEmojiGameFieldAsString(conwayGame: ConwayGame): void;
    preprender_bitmap(conwayGame: ConwayGame): Promise<void>;
    getPreRenderedBitmap(conwayGame: ConwayGame): Promise<ImageBitmap>;
    updategameFieldWithShapesFromPreRender(conwayGame: ConwayGame, offsetX?: number, offsetY?: number): void;
    protected faded_cell_repr_data_or_cell_repr(original_cell_repr: CellRepr, opt_fading_cell?: AgingCellRepr | undefined): CellRepr;
    displayGeneration(generation: number): void;
}
declare class ConfigStorage {
    _alive_cell_color: CellRepr;
    _dead_cell_color: CellRepr;
    _display_trails: number;
    constructor(color_alive?: CellColor, color_dead?: CellColor, display_trails?: number);
    get alive_cell_repr(): CellRepr;
    get dead_cell_repr(): CellRepr;
    get trail_length(): number;
}
declare const DEFAULTGAMERULE: ConwayGameRule[];
export { ConwayCell, ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConwayGameRepresenter, CellColor, ConfigStorage, CellPosition, AgingCellRepr };
