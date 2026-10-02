const grid = document.getElementById("grid");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const STEP_MS = 500;   // one command
const SLIDE_MS = 160;  // one cell of ice / belt movement
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
let robot = {
    x: 1,
    y: 2,
    dir: 0
};
let running = false;
let activeRun = 0;
let level = 0;
 
// Map characters for compact level definitions (produces the same format as the hand-written levels)
const TILES = {
    "#": "wall", ".": "empty", "S": "empty", "G": "goal",
    "~": "ice", "X": "pit", "K": "key", "D": "door",
    ">": "belt-0", "v": "belt-1", "<": "belt-2", "^": "belt-3",
    "R": "spin-r", "L": "spin-l", "a": "portal-a", "b": "portal-b"
};
function fromMap(rows, dir = 0) {
    let start = null;
    const cells = rows.map((row, y) => [...row].map((ch, x) => {
        if (ch === "S") start = { x, y, dir };
        return TILES[ch];
    }));
    return { width: rows[0].length, height: rows.length, grid: cells, start };
}
 
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
    // 5 — Ice: you slide until you hit something that isn't ice
    fromMap([
        "########",
        "#S~~~~.#",
        "#####~.#",
        "#G~~~~.#",
        "########"
    ]),
    // 6 — Pits: falling in restarts the run
    fromMap([
        "#########",
        "#S.XXXXX#",
        "#X..XXXX#",
        "#XX..XXX#",
        "#XXX..XX#",
        "#XXXX.G.#",
        "#########"
    ]),
    // 7 — Key & door: grab the key to open every door
    fromMap([
        "##########",
        "#S...#..G#",
        "#.K..D...#",
        "#....#...#",
        "##########"
    ]),
    // 8 — Conveyor belts carry you along
    fromMap([
        "###########",
        "#S........#",
        "#.>>>>>>v.#",
        "##......v.#",
        "#G<<<<<<<.#",
        "###########"
    ]),
    // 9 — Spinners turn you (R = right, L = left)
    fromMap([
        "#########",
        "#S..R#RG#",
        "####.#.##",
        "####L.L##",
        "#########"
    ]),
    // 10 — Portals: step in one, come out of its twin
    fromMap([
        "##########",
        "#S..a#..G#",
        "#....#...#",
        "#....#a..#",
        "##########"
    ]),
    // 11 — Ice over pits
    fromMap([
        "##########",
        "#S~~~.~~X#",
        "#~XX~~X~~#",
        "#~X.~~X~~#",
        "#~~~~.~~G#",
        "##########"
    ]),
    // 12 — Everything together
    fromMap([
        "###########",
        "#S..a#a..K#",
        "#########.#",
        "##.GD<<<<<#",
        "###########"
    ]),
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
    running = false;
    activeRun++;
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
    running = false;
    activeRun++;            // stops any in-flight run
    drawLevel(levelList[level]);   // restores keys/doors
    resetRobot();
}
 
function cellAt(x, y) {
    return grid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}
function isBlocked(x, y) {
    const c = cellAt(x, y);
    return !c || c.classList.contains("wall") ||
        (c.classList.contains("door") && !c.classList.contains("open"));
}
function flash(cell, cls, ms) {
    cell.classList.remove(cls);
    void cell.offsetWidth;   // restart animation
    cell.classList.add(cls);
    setTimeout(() => cell.classList.remove(cls), ms);
}
function tryMove(dir) {
    const nx = robot.x + DX[dir];
    const ny = robot.y + DY[dir];
    if (isBlocked(nx, ny)) {
        flash(cellAt(robot.x, robot.y), "hit", 250);
        return false;
    }
    robot.x = nx;
    robot.y = ny;
    return true;
}
function classWithPrefix(cell, prefix) {
    for (const c of cell.classList) if (c.startsWith(prefix)) return c;
    return null;
}
 
// Apply the effect of the tile the robot just entered. Returns "ok", "goal" or "fail".
async function resolveTile(alive) {
    for (let n = 0; n < 60 && alive(); n++) {   // cap guards against belt loops
        const cell = cellAt(robot.x, robot.y);
        const cl = cell.classList;
        if (cl.contains("goal")) return "goal";
        if (cl.contains("pit")) return "fail";
        if (cl.contains("key")) {
            cl.replace("key", "empty");
            for (const c of grid.children) {
                if (c.classList.contains("door")) c.classList.add("open");
            }
            return "ok";
        }
        if (cl.contains("spin-r")) { robot.dir = (robot.dir + 1) % 4; return "ok"; }
        if (cl.contains("spin-l")) { robot.dir = (robot.dir + 3) % 4; return "ok"; }
        const portal = classWithPrefix(cell, "portal-");
        if (portal) {
            for (const c of grid.children) {
                if (c !== cell && c.classList.contains(portal)) {
                    drawRobot();
                    await sleep(SLIDE_MS);
                    robot.x = Number(c.dataset.x);
                    robot.y = Number(c.dataset.y);
                    flash(c, "warp", 400);
                    break;
                }
            }
            return "ok";
        }
        const belt = classWithPrefix(cell, "belt-");
        let moved = false;
        if (cl.contains("ice")) moved = tryMove(robot.dir);
        else if (belt) moved = tryMove(Number(belt.slice(5)));
        if (!moved) return "ok";
        drawRobot();
        await sleep(SLIDE_MS);
    }
    return "ok";
}
 
async function runProgram() {
    if (running) return;
    const code = document.getElementById("code");
    const commands = code.value.toLowerCase();
    if (!/[frl]/.test(commands)) return;
 
    running = true;
    const id = ++activeRun;
    const alive = () => running && id === activeRun;
 
    drawLevel(levelList[level]);   // fresh keys/doors each run
    resetRobot();
    await sleep(500);
 
    let i = 0;
    let result = "ok";
    while (alive()) {
        code.focus();
        code.setSelectionRange(i, i + 1);
        const c = commands[i];
        if (c === "f") {
            if (tryMove(robot.dir)) {
                drawRobot();
                result = await resolveTile(alive);
            }
        } else if (c === "r") {
            robot.dir = (robot.dir + 1) % 4;
        } else if (c === "l") {
            robot.dir = (robot.dir + 3) % 4;
        }
        drawRobot();
        if (result !== "ok") break;
        i = (i + 1) % commands.length;
        await sleep(STEP_MS);
    }
    if (!alive()) return;
 
    const currentCell = cellAt(robot.x, robot.y);
    if (result === "goal") {
        currentCell.classList.add("complete");
        await sleep(700);
        if (!alive()) return;
        cycleLevel();
    } else {
        currentCell.classList.add("fall");
        await sleep(700);
        if (!alive()) return;
        drawLevel(levelList[level]);
        resetRobot();
    }
    running = false;
}
function onTarget(){
    return cellAt(robot.x, robot.y).classList.contains("goal");
}
function drawRobot() {
    const cells = grid.children;
    for (const cell of cells) {
        cell.classList.remove("robot");
    }
    const cell = cellAt(robot.x, robot.y);
    cell.classList.add("robot");
    cell.dataset.dir = robot.dir;
}
 