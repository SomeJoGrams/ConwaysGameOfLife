import {
    ConwayGame,
    ConwayGameAdvancer,
    ConwayGameFactory,
    CENTERDEFAULTGAMERULE,
    DEFAULTGAMERULE,
    ConwayHTMLDisplayer,
    ConfigStorage,
    CellColor,
    CellPosition,
    MULTIPLICATIONGAMERULE,
    MousePositionHandler,
} from "../main/game_of_life_default";

const CONWAYCONFIG = new ConfigStorage();
self.onmessage = (event) => {
    console.debug("Worker received message " + event.data);
    let received_data:
        | { message: "start"; canvas?: OffscreenCanvas; prerenderCanvas?: OffscreenCanvas }
        | { message: "setColorAlive" | "setColorDead"; rgba: [number, number, number, number] }
        | { message: "setXResolution"; width: number }
        | { message: "setScreenRatio"; screen_ratio: number }
        | { message: "mouseposition" | "setPixelSize"; [key: string]: any }
        | { message: "bpmUpdate"; bpm: number; next_beat_time: number } = event.data;
    switch (received_data.message) {
        case "start":
            if (received_data.canvas == undefined || received_data.prerenderCanvas == undefined) {
                throw Error("Start is missing arguments");
            }
            let mainCanvas: OffscreenCanvas = received_data.canvas;
            let optCanvas: OffscreenCanvas = received_data.prerenderCanvas;
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
                CONWAYCONFIG.mousePositionHandler = new MousePositionHandler(
                    received_data.xPos,
                    received_data.yPos
                );
            } else {
                (<MousePositionHandler>CONWAYCONFIG.getMousePositionHandler).updateMousePos(
                    received_data.xPos,
                    received_data.yPos
                );
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

function get_ratio_y_to_x(x: number, canvas: OffscreenCanvas) {
    // TODO use offscreen canvas ratio
    return Math.ceil(x * 0.5625);
}

function start_conway_game_on_canvas(canvas: OffscreenCanvas, prerenderCanvas: OffscreenCanvas) {
    let fps = 30;
    const x_pixel_default = 150;
    const y_pixel_default = get_ratio_y_to_x(x_pixel_default, canvas);
    const conwayGameFactory = new ConwayGameFactory(
        x_pixel_default,
        y_pixel_default,
        CENTERDEFAULTGAMERULE,
        true,
        MULTIPLICATIONGAMERULE[0],
        "extend"
    ); // todo real screen proportions, e.g. window is sized
    let currentConwayGameOriginal: ConwayGame = conwayGameFactory.circle(20, (1 / 20) * Math.PI, [
        new CellPosition(0, 0),
    ]);
    let currentConwayGame: ConwayGameAdvancer = ConwayGameAdvancer.fromConwayGame(
        currentConwayGameOriginal,
        undefined
    );
    const field_drawer: ConwayHTMLDisplayer = new ConwayHTMLDisplayer(
        canvas,
        CONWAYCONFIG,
        null,
        prerenderCanvas
    );
    field_drawer.update_game_field_with_shapes_from_prerender(currentConwayGame);
    let gameStateStart: number = Date.now();
    let timeout_update_received = false;
    function draw_conway_game(timeStamp: number) {
        timeStamp = Date.now();
        if (!currentConwayGame) {
            console.error("No Conway game was created");
            return;
        }
        const elapsed_game_state = timeStamp - gameStateStart;
        const needed_time =
            (CONWAYCONFIG.bpm_timeout_seconds + CONWAYCONFIG.get_beat_offset_seconds(timeStamp)) *
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
        if (currentConwayGame) {
            currentConwayGame.nextState();
            const pos = CONWAYCONFIG.getMousePositionHandler?.getAndResetPath();
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
