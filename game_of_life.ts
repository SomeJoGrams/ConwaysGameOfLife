
class ConwayGame {
    xSize: number;
    ySize: number;
    gameField: boolean[][];

    constructor(pxSize: number, pySize: number) {
        this.xSize = pxSize;
        this.ySize = pySize;
        this.gameField = 
    }
    
    function create_empty_conways_game(this){
        return new Array(this.xSize).fill(false).map(() => new Array(this.ySize).fill(false));
}
    


}
}

function create_next_conway_state(xSize, ySize, oldConwayGame) {
    let newConwayGame: boolean[][] = create_empty_conways_game(xSize, ySize)
    for (let indexX = 0; indexX < xSize; indexX++) {
        for (let indexY = 0; indexY < ySize; indexY++) {
            let living_neighbour_count = living_neighbours(indexX, indexY, xSize, ySize, oldConwayGame)
            if (is_alive(indexX, indexY, oldConwayGame)){
                if ((living_neighbour_count == 2) || (living_neighbour_count == 3)){
                    newConwayGame[indexX][indexY] = true;
                }
            }
            else {
                if (living_neighbour_count == 3) {
                    newConwayGame[indexX][indexY] = true;
                }
            }
        }
    }
    return newConwayGame;
}

function is_alive(xInd, yInd, gameField) {
    return gameField[xInd][yInd];
}

function living_neighbours(xInd, yInd, xSize, ySize, gameField){
    let surroundingIndices = new Array([-1, -1], [-1, 0], [-1, 1], [0, 1], [0, -1], [1, 1], [1, 0], [1, -1]);
    let count = 0;
    surroundingIndices.forEach((list, val, arr) => {
        // console.log("the list" + list)
        // console.log("the val" + val)
        // console.log("the arr" + arr)
        let x1 = list[0];
        let y1 = list[1];
        let a = xInd + x1;
        let b = yInd + y1;
        // console.log("in a: " + a + " b:" + b)
        let inField = ((a > 0 && b > 0) && (a < xSize && b < ySize));
        if (inField && gameField[a][b]) {
            count += 1;
        }
    });
    return count;
}

function print_field(xSize, ySize, gameField) {
    let result_str = ""
    for (let indexX = 0; indexX < xSize; indexX++) {
        for (let indexY = 0; indexY < ySize; indexY++) {
            if (gameField[indexX][indexY]) {
                result_str += "🟩"
            }
            else {
                result_str += "⬜"
            }      
        }
        result_str += "\n"
    }
    return result_str
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function someRandomMan(xSize, ySize, gameField) {
    for (let indexX = 0; indexX < xSize; indexX++) {
        for (let indexY = 0; indexY < ySize; indexY++) {
            let rand_val = Math.round(Math.random() * 10);
            if (rand_val >= 4) {
                gameField[indexX][indexY] = true;
            }
        }
    }
    return gameField;
}

async function main() {
    let xSize = 100;
    let ySize = 100;
    let gameField = create_empty_conways_game(xSize, ySize);
    console.log("Starting the game with xSize: " + xSize + " ySize: " + ySize);
    gameField = someRandomMan(xSize, ySize, gameField);
    console.log(print_field(xSize, ySize, gameField));
    await sleep(2000);  
    for (let generation = 0; generation < 30; generation++) {
        gameField = create_next_conway_state(xSize, ySize, gameField);
        console.log(print_field(xSize, ySize, gameField));
        await sleep(1000);  
    }
    console.log("Done with the game")
}

main()