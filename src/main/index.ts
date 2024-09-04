import printMe from '../main/print'; // for testing webpck
import "../../resources/css/main.css"
// let worker_url = require("../workers/canvas_worker")
// import "../workers/canvas_worker"
let gamefield_template = require("../../resources/html_templates/partials/game_field.hbs");

// declare var self: DedicatedWorkerGlobalScope;
// export {};

let uiWorker: Worker | null = null

function startWindowWorker(canvas: HTMLCanvasElement, canvas2: HTMLCanvasElement): OffscreenCanvas | undefined {
    let offscreenCanvas: OffscreenCanvas | undefined = undefined;
    let offscreenCanvas2: OffscreenCanvas | undefined = undefined;
    if (window.Worker) {
        uiWorker = new Worker(new URL("../workers/canvas_worker.ts", import.meta.url));
        offscreenCanvas = canvas.transferControlToOffscreen()
        offscreenCanvas2 = canvas2.transferControlToOffscreen()
        uiWorker.postMessage({ message: "start", canvas: offscreenCanvas, prerenderCanvas: offscreenCanvas2 }, [offscreenCanvas, offscreenCanvas2]);
    }
    else {
        console.error("Workers are not supported on your browser");
    }
    return offscreenCanvas;
}    

function create_missing_html_canvas_on_gamefield() : HTMLCanvasElement{
    let gameSpace = document.getElementById("gameField");
    if (gameSpace == null) {
        console.error("couldn't find the gameField");
    }
    let canvas: HTMLCanvasElement | null = <HTMLCanvasElement>document.getElementById("gameFieldCanvas");
    if (canvas == null) {
        canvas = document.createElement("canvas");
        canvas.id = "gameFieldCanvas";
        gameSpace?.appendChild(canvas);
    }
    // also resize the wrapping html might be needed again
    return canvas;
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
        let canvas = create_missing_html_canvas_on_gamefield();
        let hiddenCanvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        startWindowWorker(canvas, hiddenCanvas);
        printMe()
    })
})();
