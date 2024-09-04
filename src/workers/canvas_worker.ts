import { times, update } from "lodash";
import { ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConfigStorage, CellColor } from "../main/game_of_life_default";

// : [ string, OffscreenCanvas]
self.onmessage = (event) => {
    console.log("Worker received message")
    let received_data: {message: string, canvas: OffscreenCanvas, prerenderCanvas: OffscreenCanvas} = event.data
    if (received_data.message == "start") {
        
        let mainCanvas: OffscreenCanvas = received_data.canvas;
        let optCanvas: OffscreenCanvas = received_data.prerenderCanvas;
        start_conway_game_on_canvas(mainCanvas, optCanvas);
    }
}


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}   	

function bpm() { // TODO add audio spikes for bpm
    return 100;
}

function bpm_timeout() {
    return 20 * (bpm() / 60) * (Math.random());
}

function get_ratio_y_to_x(x: number) {
    return Math.ceil(x * 0.5625);
}


function start_conway_game_on_canvas(canvas: OffscreenCanvas, prerenderCanvas: OffscreenCanvas) {
    const x_pixel_default = 1000;
    const x_canvas_pixel_default = 1000;
    const conwayGameFactory = new ConwayGameFactory(x_pixel_default, get_ratio_y_to_x(x_pixel_default), DEFAULTGAMERULE); // todo real screen proportions, e.g. window is sized
    let currentConwayGame: ConwayGame | null = conwayGameFactory.circle(50, (1/50)*Math.PI);
    if (currentConwayGame == null) {
        return;
    }
    let config = new ConfigStorage(new CellColor(125, 255, 255, 255), new CellColor(0, 0, 20, 255), 4);
    const field_drawer: ConwayHTMLDisplayer = new ConwayHTMLDisplayer(canvas, "100vw", "100vh", x_canvas_pixel_default, get_ratio_y_to_x(x_canvas_pixel_default), config, null, prerenderCanvas);
    field_drawer.updategameFieldWithShapesFromPreRender(currentConwayGame);   
    // field_drawer.displayGeneration(-1);
    let fps = 60;
    let start: number = performance.now();
    let gameStateStart: number = start;
    let timeout_update_received = false;
    function draw_conway_game(timeStamp: number) {
        if (!currentConwayGame) {
            return;
        }
        if (start == undefined) {
            start = timeStamp;
        }
        const elapsed = timeStamp - start;
        const elapsed_game_state = timeStamp - gameStateStart;
        // field_drawer.displayGeneration(generation); // TODO posting back to dom
        if (elapsed_game_state > 1000) {
            gameStateStart = timeStamp;
            updateConwayGame(); // no image while its loading
        }
        if (elapsed > 1000/fps && timeout_update_received) {
            field_drawer.updategameFieldWithShapesFromPreRender(currentConwayGame);
            timeout_update_received = false;
        }
        requestAnimationFrame((t) => draw_conway_game(t)); 
    }
    let generation: number = -1;
    function updateConwayGame() {
        if (currentConwayGame) {
            currentConwayGame = currentConwayGame.next_conway_game();
            field_drawer.preprender_bitmap(currentConwayGame).then(f => (timeout_update_received = true));
            generation += 1;
            // timeout_update_received = true;
        }
    }
    requestAnimationFrame(draw_conway_game); //1000 / fps)
    // requestAnimationFrame(() => draw_conway_game()); //1000 / fps)
    // for (let generation = -1; generation < 2000; generation++) {
    // let worker_running = true;
    // while (worker_running) {
    //     requestAnimationFrame(() => draw_conway_game());
    //     await sleep(2000);
    // }
        // await sleep(400); // bpm_timeout
}

