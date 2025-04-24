// function setup() {
//   createCanvas(400, 400);
// }

// function draw() {
//   background(220);
// }
let tiles = [];
const tileImages = [];

let grid = [];
let aProlif = [];
const screenRatio = parseFloat(
    Number.parseFloat(innerWidth / innerHeight).toFixed(2)
);
const DIMY = 10;
const DIMX = Math.ceil(DIMY * screenRatio);
let canvas;
function preload() {
    const path = "tiles";

    

    //wang tiles github v2
    for (let i = 0; i < 11; i++) {
        tileImages[i] = loadImage(`${path}/wtgh2/${i}.png`);
    }

    
}

function removeDuplicatedTiles(tiles) {
    const uniqueTilesMap = {};
    for (const tile of tiles) {
        const key = tile.edges.join(","); // ex: "ABB,BCB,BBA,AAA"
        uniqueTilesMap[key] = tile;
    }
    return Object.values(uniqueTilesMap);
}

function calculateCellSize() {
    const w = windowWidth / DIMX;
    const h = windowHeight / DIMY;
    const size = Math.trunc(Math.min(w, h));
    return { w: size * DIMX, h: size * DIMY };
}

function setup() {
    const closeModalBtn = document.querySelector(".btn-close");
    closeModalBtn.addEventListener("click", hideModal);
    const playBtn = document.querySelector("#animBtn");
    const modalBtn = document.querySelector("#extra");
    modalBtn.addEventListener("click", showModal);

    playBtn.addEventListener("click", () => {
        
        startOver();
    });

    const scrSize = calculateCellSize();

    canvas = createCanvas(innerWidth, innerHeight);
    // canvas = createCanvas(scrSize.w, scrSize.h);

    canvas.position(0, 0, "fixed");

    //wang github tiles
    tiles[0] = new Tile(tileImages[0], ["RRR", "RRR", "RRR", "GGG"]);
    tiles[1] = new Tile(tileImages[1], ["BBB", "RRR", "BBB", "GGG"]);
    tiles[2] = new Tile(tileImages[2], ["RRR", "GGG", "GGG", "GGG"]);
    tiles[3] = new Tile(tileImages[3], ["WWW", "BBB", "RRR", "BBB"]);
    tiles[4] = new Tile(tileImages[4], ["BBB", "BBB", "WWW", "BBB"]);
    tiles[5] = new Tile(tileImages[5], ["WWW", "WWW", "RRR", "WWW"]);
    tiles[6] = new Tile(tileImages[6], ["RRR", "GGG", "BBB", "WWW"]);
    tiles[7] = new Tile(tileImages[7], ["BBB", "WWW", "BBB", "RRR"]);
    tiles[8] = new Tile(tileImages[8], ["BBB", "RRR", "WWW", "RRR"]);
    tiles[9] = new Tile(tileImages[9], ["GGG", "GGG", "BBB", "RRR"]);
    tiles[10] = new Tile(tileImages[10], ["RRR", "WWW", "RRR", "GGG"]);

    tiles.map((item, i) => (item.index = i));

    const initialTileCount = tiles.length;
    for (let i = 0; i < initialTileCount; i++) {
        let tempTiles = [];
        for (let j = 0; j < 4; j++) {
            tempTiles.push(tiles[i].rotate(j));
        }
        tempTiles = removeDuplicatedTiles(tempTiles);
        tiles = tiles.concat(tempTiles);
    }

    // Generate the adjacency rules based on edges
    tiles.map((tile) => tile.analyze(tiles));

    startOver();
}

function startOver() {
    // Create cell for each spot on the grid
    grid = Array(DIMX * DIMY)
        .fill(0)
        .map((item) => new Cell(tiles.length));
    grid.forEach((item, i) => (item.idx = i));
}

function checkValid(arr, valid) {
    for (let i = arr.length - 1; i >= 0; i--) {
        // VALID: [BLANK, RIGHT]
        // ARR: [BLANK, UP, RIGHT, DOWN, LEFT]
        // result in removing UP, DOWN, LEFT
        let element = arr[i];

        if (!valid.includes(element)) {
            arr.splice(i, 1);
        }
    }
}

function showModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");

    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function hideModal() {
    const modal = document.querySelector(".modal");
    const overlay = document.querySelector(".overlay");

    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}

function draw() {
    frameRate(10);
    background(0);

    const w = width / DIMX;
    const h = height / DIMY;
    grid.filter((item) => item.collapsed).map((item) => {
        let i = item.idx % DIMX;
        let j = Math.trunc(item.idx / DIMX);
        let index = item.options[0];
        image(tiles[index].img, i * w, j * h, w, h);
    });

    grid.filter((item) => !item.collapsed).map((item) => {
        let i = item.idx % DIMX;
        let j = Math.trunc(item.idx / DIMX);
        noFill();
        rect(i * w, j * h, w, h);
    });

    aProlif
        .filter((item) => !item.collapsed)
        .map((item) => {
            let i = item.idx % DIMX;
            let j = Math.trunc(item.idx / DIMX);

            rect(i * w, j * h, w, h);
            noFill();
        });

    const minEntropy = Math.min(
        ...grid
            .filter((item) => !item.collapsed)
            .map((item) => item.options.length)
    );
    let gridCopy = grid //.filter(item => !item.collapsed)
        .filter((item) => item.options.length == minEntropy && !item.collapsed);

    if (gridCopy.length == 0) {
        // noLoop();
        // return; //when complete
        // startOver()
        return
    }

    const cell = random(gridCopy);
    cell.collapsed = true;
    const pick = random(cell.options);
    console.log(isLooping());
    if (pick === undefined) {
        startOver();
        return;
    }
    cell.options = [pick];

    aProlif = grid.filter((item) => item.collapsed);

    //add cells adjacent to them
    aProlif.forEach((item) => {
        //calculate i (horizontal) and j(vertical) coordinates of original cell
        let i = item.idx % DIMX;
        let j = Math.trunc(item.idx / DIMX);
        if (j > 0) {
            let idx = i + (j - 1) * DIMX;
            if (aProlif.filter((item) => item.idx == idx).length == 0) {
                aProlif.push(grid[idx]);
            }
        }

        //add east cell (right)
        if (i < DIMX - 1) {
            let idx = i + 1 + j * DIMX;
            //add only if it isn`t already there - collapsed or already added
            if (aProlif.filter((item) => item.idx == idx).length == 0) {
                aProlif.push(grid[idx]);
            }
        }

        //add south cell (down)
        if (j < DIMY - 1) {
            let idx = i + (j + 1) * DIMX;
            //add only if it isn`t already there - collapsed or already added
            if (aProlif.filter((item) => item.idx == idx).length == 0) {
                aProlif.push(grid[idx]);
            }
        }

        //add west cell (left)
        if (i > 0) {
            let idx = i - 1 + j * DIMX;
            //add only if it isn`t already there - collapsed or already added
            if (aProlif.filter((item) => item.idx == idx).length == 0) {
                aProlif.push(grid[idx]);
            }
        }
    });

    const nextGrid = [];
    for (let j = 0; j < DIMY; j++) {
        for (let i = 0; i < DIMX; i++) {
            let index = i + j * DIMX;
            //if not in prolif array, just copy cell without calculations
            if (aProlif.filter((item) => item.idx == index).length == 0) {
                nextGrid[index] = grid[index];
            } else {
                if (grid[index].collapsed) {
                    nextGrid[index] = grid[index];
                } else {
                    let options = new Array(tiles.length)
                        .fill(0)
                        .map((x, i) => i);
                    // Look up
                    if (j > 0) {
                        let up = grid[i + (j - 1) * DIMX];
                        let validOptions = [];
                        for (let option of up.options) {
                            let valid = tiles[option].down;
                            validOptions = [
                                ...new Set([...validOptions, ...valid]),
                            ]; // validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look right
                    if (i < DIMX - 1) {
                        let right = grid[i + 1 + j * DIMX];
                        let validOptions = [];
                        for (let option of right.options) {
                            let valid = tiles[option].left;
                            validOptions = [
                                ...new Set([...validOptions, ...valid]),
                            ]; //validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look down
                    if (j < DIMY - 1) {
                        let down = grid[i + (j + 1) * DIMX];
                        let validOptions = [];
                        for (let option of down.options) {
                            let valid = tiles[option].up;
                            validOptions = [
                                ...new Set([...validOptions, ...valid]),
                            ]; //validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }
                    // Look left
                    if (i > 0) {
                        let left = grid[i - 1 + j * DIMX];
                        let validOptions = [];
                        for (let option of left.options) {
                            let valid = tiles[option].right;
                            validOptions = [
                                ...new Set([...validOptions, ...valid]),
                            ]; //validOptions.concat(valid);
                        }
                        checkValid(options, validOptions);
                    }

                    nextGrid[index] = new Cell(options);
                    nextGrid[index].idx = index;
                }
            }
        }
    }

    grid = nextGrid;
}
