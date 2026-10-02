const grid = document.getElementById("grid");
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const STEP_MS = 500;   
const SLIDE_MS = 160;  
const DX = [1, 0, -1, 0];
const DY = [0, 1, 0, -1];
let robot = {
    x: 1,
    y: 2,
    dir: 0
};
let running = false;
let activeRun = 0;
let tick = 0;        
let movers = [];      
let boxes = [];       
let robotAngle = 0;   
let lastDir = 0;
let level = 0;

const value = window.location.hash.slice(1);
if (value.length>0){
    level = value;
    document.getElementById("level").innerText = "level "+(Number(level)+1);
}

const TILES = {
    "#": "wall", ".": "empty", "S": "empty", "G": "goal",
    "~": "ice", "X": "pit", "K": "key", "D": "door",
    ">": "belt-0", "v": "belt-1", "<": "belt-2", "^": "belt-3",
    "R": "spin-r", "L": "spin-l", "a": "portal-a", "b": "portal-b",
    "-": "track", "m": "track", "n": "track",   
    "x": "spike-0", "y": "spike-2",             
    "B": "empty"                                
};
function fromMap(rows, dir = 0) {
    let start = null;
    const movers = [];
    const boxes = [];
    const cells = rows.map((row, y) => [...row].map((ch, x) => {
        if (ch === "S") start = { x, y, dir };
        if (ch === "m") movers.push({ x, y, dir: 0 });
        if (ch === "n") movers.push({ x, y, dir: 1 });
        if (ch === "B") boxes.push({ x, y });
        return TILES[ch];
    }));
    return { width: rows[0].length, height: rows.length, grid: cells, start, movers, boxes };
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
            ["wall", "empty", "wall", "empty", "empty", "wall", "goal", "wall"],
            ["wall", "ice", "ice", "ice", "ice", "ice", "ice", "wall"],
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

    
    fromMap([
        "########",
        "#S~~~~.#",
        "#####~.#",
        "#G~~~~.#",
        "########"
    ]),
    {
        width: 10,
        height: 7,

        grid: [
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
            ["wall", "wall", "ice", "ice", "ice", "ice", "ice", "ice", "goal", "wall"],
            ["wall", "ice", "ice", "wall", "wall", "wall", "wall", "ice", "ice", "wall"],
            ["wall", "ice", "ice", "ice", "ice", "ice", "ice", "ice", "ice", "wall"],
            ["wall", "ice", "wall", "wall", "wall", "wall", "wall", "ice", "wall", "wall"],
            ["wall", "ice", "ice", "ice", "ice", "ice", "ice", "ice", "ice", "wall"],
            ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"]
        ],

        start: {
            x: 1,
            y: 5,
            dir: 0
        }
    },
    
    fromMap([
        "#########",
        "#S.XXXXX#",
        "#X..XXXX#",
        "#XX..XXX#",
        "#XXX..XX#",
        "#XXXX.G.#",
        "#########"
    ]),
    
    fromMap([
        "##########",
        "#S...#..G#",
        "#.K..D...#",
        "#....#...#",
        "##########"
    ]),
    
    fromMap([
        "###########",
        "#S........#",
        "#.>>>>>>v.#",
        "##......v.#",
        "#G<<<<<<<.#",
        "###########"
    ]),
    
    fromMap([
        "#########",
        "#S..R#RG#",
        "####.#.##",
        "####L.L##",
        "#########"
    ]),
    
    fromMap([
        "##########",
        "#S..a#..G#",
        "#....#...#",
        "#....#a..#",
        "##########"
    ]),
    
    fromMap([
        "##########",
        "#S~~~.~~X#",
        "#~XX~~X~~#",
        "#~X.~~X~~#",
        "#~~~~.~~G#",
        "##########"
    ]),
    
    fromMap([
        "###########",
        "#S..a#a..K#",
        "#########.#",
        "##.GD<<<<<#",
        "###########"
    ]),
    
    fromMap([
        "##############",
        "#S..x.y.x...K#",
        "#.##########.#",
        "#.#G.......#.#",
        "#.#####.####.#",
        "#...y.xD.....#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S....-......#",
        "#####.-.####.#",
        "#G..#.n.#..x.#",
        "##.###-##.##.#",
        "#..<<<-....y.#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S~~~~~R~~~~.#",
        "#######~######",
        "#X~~~~~L~~~~.#",
        "#~####-#####.#",
        "#~~~~~n~~~~x.#",
        "#~####-#####.#",
        "#G...y-..x...#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S..#a...X..b#",
        "#.v.######.#v#",
        "#.v......y.#v#",
        "#.>>>>.#####v#",
        "#b..x....>>>v#",
        "#####.######v#",
        "#G..a.y.....<#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S~~~.~~~~#~a#",
        "#~~X~~~X~~~~~#",
        "#.~~~#~~~~X~.#",
        "#~X~~~~.~~~~~#",
        "#~~~~X~~#~~~.#",
        "##############",
        "#a..y..x..y.G#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S.-.-.-.-..x#",
        "#..n.-.-.n..y#",
        "#..-.n.-.-..x#",
        "#..-.-.n.-..y#",
        "#..-.-.-.-..b#",
        "##############",
        "#b..y.~~x...G#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S>>>>v#K....#",
        "#.....v#.###.#",
        "#.###.v#.-m-.#",
        "#.#G#.>>>>>v.#",
        "#.#D#.....v..#",
        "#.#.######v###",
        "#...y..x..<..#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S....R.....L#",
        "#.###.#.###.##",
        "#.#K#.-.#G#.##",
        "#.#.#.n.#D#.##",
        "#.#.#.-.#.#.##",
        "#...#.-.....##",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S.x..y..x.K.#",
        "############.#",
        "#G...-..a###D#",
        "#####n###v<<<#",
        "#.~~~#~~~~~..#",
        "#.~X~~X~~~~X.#",
        "#.~~~~~R~~~~.#",
        "#a....X......#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S~~~R#..x..K#",
        "#.##~.#.###..#",
        "#.#X~~-m---..#",
        "#.#~~L#.###.y#",
        "#.#a###.#G#..#",
        "#.#.....#D#>v#",
        "#.#####.#.#.v#",
        "#a......y...<#",
        "##############"
    ]),    
    fromMap([
        "##########",
        "#....#####",
        "#S.B.X..G#",
        "#....#####",
        "##########"
    ]),
    
    fromMap([
        "############",
        "#S.........#",
        "#.B........#",
        "#~~~~~~~~~X#",
        "##########G#",
        "############"
    ]),
    
    fromMap([
        "##############",
        "#S...........#",
        "#....B.......#",
        "#####.########",
        "#G.X<<<<<<<<.#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S...........#",
        "#..B......B..#",
        "#~~~~~~~~~~~~#",
        "#~~~~~~~~~~~~#",
        "#XXXXXXXXXXXX#",
        "#G...........#",
        "##############"
    ]),
    
    fromMap([
        "#########",
        "#S...R###",
        "#####.###",
        "#####L.-#",
        "#######-#",
        "#G.X.B.n#",
        "#######-#",
        "#########"
    ]),
    
    fromMap([
        "##############",
        "#S...........#",
        "#..B...B.....#",
        "#####v###v####",
        "#####v###v####",
        "#G.XX<<<<<<..#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S..x.y.x.y..#",
        "#.B#########X#",
        "#....y..x...X#",
        "############G#",
        "##############"
    ]),
    
    fromMap([
        "##############",
        "#S..a#.a.....#",
        "#....#....B..#",
        "#....#.......#",
        "######.#######",
        "#G....X......#",
        "##############"
    ]),
    
    fromMap([
        "############",
        "#S.....#K..#",
        "#..B.B.XX.D#",
        "#......###G#",
        "############"
    ]),
    
    fromMap([
        "##############",
        "#S.x.y.a#a..K#",
        "######D#######",
        "###.........##",
        "###...B~~~B.##",
        "###R.......###",
        "######-m-#####",
        "######X#######",
        "######>>>X.G.#",
        "##############"
    ]),
];
drawLevel(levelList[level]);
robot.x = levelList[level].start.x;
robot.y = levelList[level].start.y;
robot.dir = levelList[level].start.dir;
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
    tick = 0;
    movers = (level.movers || []).map(m => ({ ...m }));
    boxes = (level.boxes || []).map(b => ({ ...b }));
    renderWorld();
}


function spikeUp(cell) {
    const s = cell && classWithPrefix(cell, "spike-");
    return !!s && (tick + Number(s.slice(6))) % 4 >= 2;
}
function renderWorld() {
    for (const c of grid.children) {
        c.classList.remove("mover", "box");
        if (classWithPrefix(c, "spike-")) c.classList.toggle("up", spikeUp(c));
    }
    for (const m of movers) cellAt(m.x, m.y).classList.add("mover");
    for (const b of boxes) cellAt(b.x, b.y).classList.add("box");
}
function moverCanEnter(x, y) {
    const c = cellAt(x, y);
    return !!c && c.classList.contains("track") &&
        !movers.some(m => m.x === x && m.y === y) && !boxAt(x, y) &&
        !(robot.x === x && robot.y === y);
}


function boxAt(x, y) {
    return boxes.find(b => b.x === x && b.y === y) || null;
}

function boxCanEnter(x, y) {
    const c = cellAt(x, y);
    if (!c || isBlocked(x, y) || boxAt(x, y) || (robot.x === x && robot.y === y)) return false;
    return !c.classList.contains("goal") && !c.classList.contains("key") && !classWithPrefix(c, "portal-");
}

async function resolveBox(b, dir, alive) {
    for (let n = 0; n < 60 && alive(); n++) {
        const cell = cellAt(b.x, b.y);
        if (cell.classList.contains("pit")) {
            cell.classList.replace("pit", "filled");
            boxes.splice(boxes.indexOf(b), 1);
            flash(cell, "sink", 400);
            break;
        }
        const nx = b.x + DX[dir], ny = b.y + DY[dir];
        if (!cell.classList.contains("ice") || !boxCanEnter(nx, ny)) break;
        b.x = nx;
        b.y = ny;
        renderWorld();
        await sleep(SLIDE_MS);
    }
    renderWorld();
}
async function pushBox(b, dir, alive) {
    const nx = b.x + DX[dir], ny = b.y + DY[dir];
    if (!boxCanEnter(nx, ny)) return false;
    b.x = nx;
    b.y = ny;
    renderWorld();
    await resolveBox(b, dir, alive);
    return true;
}

async function tickWorld(alive) {
    tick++;
    for (const b of [...boxes]) {           
        const belt = classWithPrefix(cellAt(b.x, b.y), "belt-");
        if (belt) await pushBox(b, Number(belt.slice(5)), alive);
    }
    for (const m of movers) {
        for (let attempt = 0; attempt < 2; attempt++) {
            const nx = m.x + DX[m.dir], ny = m.y + DY[m.dir];
            if (moverCanEnter(nx, ny)) { m.x = nx; m.y = ny; break; }
            if (attempt === 0) m.dir = (m.dir + 2) % 4;
        }
    }
    renderWorld();
    return spikeUp(cellAt(robot.x, robot.y)) ? "fail" : "ok";
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
    robotAngle = start.dir * 90;
    lastDir = start.dir;

    drawRobot();
}
function resetRobotExternal(){
    running = false;
    activeRun++;            
    drawLevel(levelList[level]);   
    resetRobot();
}

function cellAt(x, y) {
    return grid.querySelector(`[data-x="${x}"][data-y="${y}"]`);
}
function isBlocked(x, y) {
    const c = cellAt(x, y);
    return !c || c.classList.contains("wall") || c.classList.contains("mover") ||
        (c.classList.contains("door") && !c.classList.contains("open"));
}
function flash(cell, cls, ms) {
    cell.classList.remove(cls);
    void cell.offsetWidth;   
    cell.classList.add(cls);
    setTimeout(() => cell.classList.remove(cls), ms);
}
async function tryMove(dir, alive) {
    const nx = robot.x + DX[dir];
    const ny = robot.y + DY[dir];
    const b = boxAt(nx, ny);
    if ((b && !(await pushBox(b, dir, alive))) || isBlocked(nx, ny)) {
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


async function resolveTile(alive) {
    for (let n = 0; n < 60 && alive(); n++) {   
        const cell = cellAt(robot.x, robot.y);
        const cl = cell.classList;
        if (cl.contains("goal")) return "goal";
        if (cl.contains("pit")) return "fail";
        if (classWithPrefix(cell, "spike-")) return spikeUp(cell) ? "fail" : "ok";
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
        if (cl.contains("ice")) moved = await tryMove(robot.dir, alive);
        else if (belt) moved = await tryMove(Number(belt.slice(5)), alive);
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

    drawLevel(levelList[level]);   
    resetRobot();
    await sleep(500);

    let i = 0;
    let result = "ok";
    while (alive()) {
        code.focus();
        code.setSelectionRange(i, i + 1);
        const c = commands[i];
        if (c === "f") {
            if (await tryMove(robot.dir, alive)) {
                drawRobot();
                result = await resolveTile(alive);
            }
        } else if (c === "r") {
            robot.dir = (robot.dir + 1) % 4;
        } else if (c === "l") {
            robot.dir = (robot.dir + 3) % 4;
        }                                   
        if (result === "ok") result = await tickWorld(alive);
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
    const prev = grid.querySelector(".robot");
    const cell = cellAt(robot.x, robot.y);
    const moved = prev !== cell;

    for (const c of grid.children) c.classList.remove("robot");

    let turn = (robot.dir - lastDir + 4) % 4;
    if (turn === 3) turn = -1;
    robotAngle += turn * 90;
    lastDir = robot.dir;

    if (moved) cell.classList.add("snap");
    cell.style.setProperty("--angle", robotAngle + "deg");
    cell.classList.add("robot");
    cell.dataset.dir = robot.dir;

    if (moved) {
        requestAnimationFrame(() =>
            requestAnimationFrame(() => cell.classList.remove("snap")));
    }
}