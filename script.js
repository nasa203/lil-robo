const grid = document.getElementById("grid");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let robot = {
    x: 1,
    y: 2,
    dir: 0
};
let running = false;
let level = 0;
const levelList = [
    {
        width:7,
        height:5,
        grid:[
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "wall", "goal", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "wall", "wall", "wall", "wall","wall","wall"]
        ],
        start:{
            x:1,
            y:2,
            dir:0
        }
    },
    {
        width: 8,
        height: 6,
        grid: [
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "goal", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
        ],
        start: {
            x: 1,
            y: 4,
            dir: 0
        }
    },
    {
        width: 8,
        height: 6,
        grid: [
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "empty", "wall", "empty", "empty", "empty", "goal", "wall"],
            ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "wall", "empty", "empty", "wall"],
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
        ],
        start: {
            x: 1,
            y: 4,
            dir: 0
        }
    },
    {
        width: 10,
        height: 7,

        grid: [
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "goal", "wall"],
            ["wall", "empty", "empty", "wall", "wall", "wall", "wall", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "wall", "wall", "wall", "wall", "empty", "empty", "wall"],
            ["wall", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty", "wall"],
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
        ],

        start: {
            x: 1,
            y: 5,
            dir: 0
        }
    },
];
drawLevel(levelList[0]);
drawRobot(0);

function drawLevel(level) {
    grid.innerHTML = "";
    grid.style.gridTemplateColumns = `repeat(${level.width}, 60px)`;
    grid.style.gridTemplateRows = `repeat(${level.height}, 60px)`;
    for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.classList.add(level.grid[y][x]);
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
    resetRobot();
    drawRobot();
}
function resetRobot() {
    const start = levelList[level].start;
    robot.x = start.x;
    robot.y = start.y;
    robot.dir = start.dir;

    drawRobot();
}
function resetRobotExternal(){
    if (running) return;
    resetRobot();
}
async function runProgram() {
    if (!running){
        running = true;
        resetRobot();
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