import printMe from "./print"; // for testing webpck
import "../../resources/css/main.css";
import { add_wallpaper_engine_audio_listening, set_ui_worker } from "./wallpaper_engine";
let gamefield_template = require("../../resources/html_templates/partials/game_field.hbs");
let uiWorker: Worker | null = null;

function initMissingUiWorker() {
    if (uiWorker == null) {
        uiWorker = new Worker(new URL("../workers/canvas_worker.ts", import.meta.url));
    }
    return uiWorker;
}

function startWindowWorker(
    canvas: HTMLCanvasElement,
    canvas2: HTMLCanvasElement
): OffscreenCanvas | undefined {
    let offscreenCanvas: OffscreenCanvas | undefined = undefined;
    let offscreenCanvas2: OffscreenCanvas | undefined = undefined;
    uiWorker = initMissingUiWorker();
    if (window.Worker) {
        offscreenCanvas = canvas.transferControlToOffscreen();
        offscreenCanvas2 = canvas2.transferControlToOffscreen();
        uiWorker.postMessage(
            { message: "start", canvas: offscreenCanvas, prerenderCanvas: offscreenCanvas2 },
            [offscreenCanvas, offscreenCanvas2]
        );
    } else {
        console.error("Workers are not supported on your browser");
    }
    return offscreenCanvas;
}

function addMousePositionEventHandler() {
    uiWorker = initMissingUiWorker();
    document.addEventListener("mousemove", mouseListening);
}

function removeMousePositionEventHandler() {
    document.removeEventListener("mousemove", mouseListening);
}

function mouseListening(event: MouseEvent) {
    uiWorker?.postMessage({ message: "mouseposition", xPos: event.pageX, yPos: event.pageY });
}

function create_missing_html_canvas_on_gamefield(): HTMLCanvasElement {
    let gameSpace = document.getElementById("gameField");
    if (gameSpace == null) {
        console.error("couldn't find the gameField");
    }
    let canvas: HTMLCanvasElement | null = <HTMLCanvasElement>(
        document.getElementById("gameFieldCanvas")
    );
    if (canvas == null) {
        canvas = document.createElement("canvas");
        canvas.id = "gameFieldCanvas";
        gameSpace?.appendChild(canvas);
    }
    return canvas;
}

function append_game_field_from_template() {
    if (document.getElementById("gameField") != null) {
        console.error("Adding gameField called twice, likely caused by livereload");
        return;
    }
    let div = document.createElement("div");
    div.classList.add("gameFieldDiv");
    div.innerHTML = gamefield_template({});
    document.body.appendChild(div);
}

(() => {
    // immediately invoked function expression (IIFE) get only called once
    document.addEventListener("DOMContentLoaded", function () {
        append_game_field_from_template();
        let canvas = create_missing_html_canvas_on_gamefield();
        let hiddenCanvas = document.createElement("canvas");
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        // addMousePositionEventHandler();
        startWindowWorker(canvas, hiddenCanvas);
        if (uiWorker) {
            console.log("Posting Message For resolution");
            uiWorker.postMessage({ message: "setXResolution", width: window.innerWidth });
            uiWorker.postMessage({
                message: "setScreenRatio",
                screen_ratio: window.innerHeight / window.innerWidth,
            });
        }
        add_wallpaper_engine_audio_listening();
        set_ui_worker(uiWorker);
        printMe();
    });
})();

const onResize = (): void => {
    if (uiWorker) {
        uiWorker.postMessage({ message: "setXResolution", width: window.innerWidth });
        uiWorker.postMessage({
            message: "setScreenRatio",
            screen_ratio: window.innerHeight / window.innerWidth,
        });
    }
};
window.addEventListener("resize", onResize);
