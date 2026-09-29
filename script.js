const grid = document.getElementById("grid");
const width = 8;
const height = 6;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let robot = {
    x: 1,
    y: 4,
    dir: 0
};
let running = false;
let level = 0;
const levelList = [
    [
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "goal", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ],
    [
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
        ["wall", "empty", "wall", "empty", "empty", "empty", "goal", "wall"],
        ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
        ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
        ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
    ]
];

drawLevel(levelList[0]);
drawRobot();

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

function cycleLevel() {
    level++;
    if (level >= levelList.length) {
        level = 0;
    }
    document.getElementById("level").textContent = "Level " + (level + 1);
    drawLevel(levelList[level]);
    robot.x = 1;
    robot.y = 4;
    robot.dir = 0;
    drawRobot();
}
function resetRobot(){
    if (running) return;
    robot.x = 1;
    robot.y = 4;
    robot.dir = 0;
    drawRobot();
}
async function runProgram() {
    if (!running){
        running = true;
        robot.x = 1;
        robot.y = 4;
        robot.dir = 0;
        drawRobot();
        await sleep(500)
        const code = document.getElementById("code");
        const commands = code.value.toLowerCase();
        console.log(commands);
        for (let i = 0; i < commands.length; i++) {
            code.focus();
            code.setSelectionRange(i, i + 1);
            if (commands[i] == "f") {
                if (robot.dir === 0) {
                    robot.x += 1;
                    const robotCell = grid.querySelector(`[data-x="${robot.x}"][data-y="${robot.y}"]`)
                    if (robotCell.classList.contains("wall")){
                        robot.x -= 1;
                        const currentCell = grid.querySelector(
                            `[data-x="${robot.x}"][data-y="${robot.y}"]`
                        );

                        currentCell.classList.add("hit");
                        setTimeout(() => currentCell.classList.remove("hit"), 250);
                    }
                }
                if (robot.dir === 1) {
                    robot.y += 1;
                    const robotCell = grid.querySelector(`[data-x="${robot.x}"][data-y="${robot.y}"]`)
                    if (robotCell.classList.contains("wall")){
                        robot.y -= 1;
                        const currentCell = grid.querySelector(
                            `[data-x="${robot.x}"][data-y="${robot.y}"]`
                        );

                        currentCell.classList.add("hit");
                        setTimeout(() => currentCell.classList.remove("hit"), 250);
                    }
                };
                if (robot.dir === 2) {
                    robot.x -= 1;
                    const robotCell = grid.querySelector(`[data-x="${robot.x}"][data-y="${robot.y}"]`)
                    if (robotCell.classList.contains("wall")){
                        robot.x += 1;
                        const currentCell = grid.querySelector(
                            `[data-x="${robot.x}"][data-y="${robot.y}"]`
                        );

                        currentCell.classList.add("hit");
                        setTimeout(() => currentCell.classList.remove("hit"), 250);
                    }
                };
                if (robot.dir === 3) {
                    robot.y -= 1;
                    const robotCell = grid.querySelector(`[data-x="${robot.x}"][data-y="${robot.y}"]`)
                    if (robotCell.classList.contains("wall")){
                        robot.y += 1;
                        const currentCell = grid.querySelector(
                            `[data-x="${robot.x}"][data-y="${robot.y}"]`
                        );

                        currentCell.classList.add("hit");
                        setTimeout(() => currentCell.classList.remove("hit"), 250);
                    }
                };
            }
            if (commands[i] == "r") {
                robot.dir += 1;
                if (robot.dir > 3) {
                    robot.dir = 0;
                }
            }
            if (commands[i] == "l") {
                robot.dir -= 1;
                if (robot.dir < 0) {
                    robot.dir = 3;
                }
            }
            drawRobot();
            await sleep(500);
        }
        const currentCell = grid.querySelector(
                `[data-x="${robot.x}"][data-y="${robot.y}"]`
            );
            if (currentCell.classList.contains("goal")) {
                currentCell.classList.add("complete");
                await sleep(700);
                cycleLevel();
                running = false;
                return;
            }
        running = false;
    }
}

function drawRobot() {
    const cells = grid.children;
    for (const cell of cells) {
        cell.classList.remove("robot");
    }
    const cell = grid.querySelector(`[data-x="${robot.x}"][data-y="${robot.y}"]`);
    cell.classList.add("robot");
    cell.dataset.dir = robot.dir;
}