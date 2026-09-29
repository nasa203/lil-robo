const grid = document.getElementById("grid");

const width = 8;
const height = 6;

const levelList=[
    [
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "goal", "wall"],
        ["wall", "empty", "empty", "wall", "empty", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "wall", "empty", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ]
];

drawLevel(levelList[0]);

function drawLevel(level) {
    grid.innerHTML = "";

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cell = document.createElement("div");

            cell.classList.add("cell");
            cell.classList.add(level[y][x]);

            cell.dataset.x = x;
            cell.dataset.y = y;

            grid.appendChild(cell);
        }
    }
}




let level = 0;
function cycleLevel(){
    level++;
    if (level > 5) level = 0;
    drawLevel(levelList[level])
}

let robot = {
    x: 0,
    y: 0,
    dir: 0
};