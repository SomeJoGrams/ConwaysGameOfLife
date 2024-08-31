import { isNull } from "lodash";
import { ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer, ConfigStorage } from "./game_of_life_default";
import "../resources/css/main.css"
import printMe from './print'; // for testing webpck
let gamefield_template = require("../html_templates/partials/game_field.hbs");


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}   	

async function main() {
    let conwayGameFactory = new ConwayGameFactory(500, Math.round(500*0.5625), DEFAULTGAMERULE); // todo real screen proportions, e.g. window is sized
    let currentConwayGame: ConwayGame | null = conwayGameFactory.centeredfPentomino();
    if (currentConwayGame == null) {
        return;
    }
    let config = new ConfigStorage();
    const field_drawer: ConwayHTMLDisplayer = new ConwayHTMLDisplayer("100vw", "100vh", 500, 0.5625*500, config); // TODO move arg to css
    field_drawer.updategameFieldPixelsAsCanvas(currentConwayGame);
    field_drawer.displayGeneration(-1);
    await sleep(200);
    for (let generation = 0; generation < 2000; generation++) {
        field_drawer.displayGeneration(generation);
        currentConwayGame = currentConwayGame.next_conway_state();
        field_drawer.updategameFieldPixelsAsCanvas(currentConwayGame);
        console.log("next generation" + generation);
        await sleep(200);
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
