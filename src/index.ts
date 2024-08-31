import { isNull } from "lodash";
import { ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConfigStorage, CellColor } from "./game_of_life_default";
import "../resources/css/main.css"
import printMe from './print'; // for testing webpck
let gamefield_template = require("../html_templates/partials/game_field.hbs");


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
    return Math.round(x * 0.5625);
}

async function main() {
    let x_pixel_default = 1000;
    let conwayGameFactory = new ConwayGameFactory(x_pixel_default, get_ratio_y_to_x(x_pixel_default), DEFAULTGAMERULE); // todo real screen proportions, e.g. window is sized
    let currentConwayGame: ConwayGame | null = conwayGameFactory.randomize_cells();
    if (currentConwayGame == null) {
        return;
    }
    let config = new ConfigStorage(new CellColor(125, 255, 255, 255), new CellColor(0,0,20,255));
    const field_drawer: ConwayHTMLDisplayer = new ConwayHTMLDisplayer("100vw", "100vh", x_pixel_default, get_ratio_y_to_x(x_pixel_default), config); // TODO move arg to css/ config class
    field_drawer.updategameFieldPixelsAsCanvas(currentConwayGame);
    field_drawer.displayGeneration(-1);
    await sleep(200);
    for (let generation = 0; generation < 2000; generation++) {
        field_drawer.displayGeneration(generation);
        currentConwayGame = currentConwayGame.next_conway_state();
        field_drawer.updategameFieldPixelsAsCanvas(currentConwayGame);
        console.log("next generation" + generation);
        await sleep(bpm_timeout());
    }
}

function append_game_field_from_template() {
    if ((document.getElementById("gameField") != null)) {
        console.error("Adding gameField called twice, likely caused by livereload")
        return;
    }
    let div = document.createElement("div");
    div.classList.add("gameFieldDiv");
    div.innerHTML = gamefield_template({})
    document.body.appendChild(div);
}

(() => { // immediately invoked function expression (IIFE) get only called once, added due to livereload
    document.addEventListener("DOMContentLoaded", function () {
    append_game_field_from_template()
    main()
    printMe()
})
})();
