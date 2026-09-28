const grid = document.getElementById("grid");

const width = 8;
const height = 6;

for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.x = x;
        cell.dataset.y = y;
        grid.appendChild(cell);
    }
}

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






let robot={
    x: 0,
    y: 0,
    dir:0
};

