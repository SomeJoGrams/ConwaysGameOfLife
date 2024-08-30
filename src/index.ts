import { ConwayGame, ConwayGameFactory, DEFAULTGAMERULE, ConwayHTMLDisplayer } from "./game_of_life_default";
import printMe from './print'; // for testing webpck


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}   	

async function main() {
    let conwayGameFactory = new ConwayGameFactory(500, 500, DEFAULTGAMERULE);
    let currentConwayGame: ConwayGame | null = conwayGameFactory.centeredfPentomino();
    if (currentConwayGame == null) {
        return;
    }
    const field_drawer: ConwayHTMLDisplayer = new ConwayHTMLDisplayer("100%", "100%", 500, 500);
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

// expects html to be loaded
main()
printMe()