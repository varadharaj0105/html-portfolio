const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const win = b => lines.find(([i,j,k]) => b[i] && b[i] === b[j] && b[i] === b[k]);
const empty = () => Array(9).fill('');
const fresh = () => ({board:empty(), turn:'X', scores:{X:0,O:0,D:0}, round:1});
const $ = id => document.getElementById(id);
let data = {mode:'solo', solo:fresh(), duo:fresh()};
try { data = JSON.parse(localStorage.neonGrid || 'null') || data; } catch {}
const state = () => data[data.mode];
const save = () => { try { localStorage.neonGrid = JSON.stringify(data); } catch {} };
function score(b, turn, depth) {
    if (win(b)) return turn === 'X' ? 10-depth : depth-10;
    if (b.every(Boolean)) return 0;
    const values = [];
    b.forEach((v,i) => {
        if (v) return;
        b[i] = turn;
        values.push(score(b, turn === 'X' ? 'O' : 'X', depth+1));
        b[i] = '';
    });
    return turn === 'O' ? Math.max(...values) : Math.min(...values);
}
function cpu(b) {
    let best = -Infinity, choice;
    for (const i of [4,0,2,6,8,1,3,5,7]) {
        if (b[i]) continue;
        b[i] = 'O';
        const value = score(b,'X',0);
        b[i] = '';
        if (value > best) { best = value; choice = i; }
    }
    return choice;
}
let timer;
const cells = Array.from({length:9}, (_,i) => {
    const button = document.createElement('button');
    button.className = 'cell';
    button.onclick = () => {
        if (data.mode === 'solo' && state().turn === 'O') return;
        move(i);
    };
    document.querySelector('.board').append(button);
    return button;
});
function move(i) {
    const s = state(), b = s.board;
    if (b[i] || win(b) || b.every(Boolean)) return;
    b[i] = s.turn;
    if (win(b)) s.scores[s.turn]++;
    else if (b.every(Boolean)) s.scores.D++;
    else s.turn = s.turn === 'X' ? 'O' : 'X';
    save(); render();
}
function render() {
    clearTimeout(timer);
    const s = state(), b = s.board, line = win(b), ended = line || b.every(Boolean);
    const solo = data.mode === 'solo', waiting = solo && s.turn === 'O' && !ended;
    for (const mode of ['solo','duo']) $(mode).setAttribute('aria-pressed', String(data.mode === mode));
    $('status').textContent = line ? (solo ? (s.turn === 'X' ? 'You win!' : 'CPU wins') : s.turn+' wins!') : ended ? 'Round drawn' : waiting ? 'CPU is thinking…' : solo ? 'Your move' : s.turn+' to play';
    $('round').textContent = 'Round '+s.round;
    cells.forEach((cell,i) => {
        if (cell.dataset.mark !== b[i]) {
            cell.textContent = '';
            if (b[i]) { const mark = document.createElement('span'); mark.className = 'mark '+b[i]; cell.append(mark); }
            cell.dataset.mark = b[i];
        }
        cell.classList.toggle('win', !!line && line.includes(i));
        cell.disabled = !!(ended || waiting || b[i]);
        cell.setAttribute('aria-label','Row '+(1+Math.floor(i/3))+', column '+(1+i%3)+', '+(b[i] || 'empty'));
    });
    $('sx').textContent = s.scores.X; $('sd').textContent = s.scores.D; $('so').textContent = s.scores.O;
    $('lx').textContent = solo ? 'You · X' : 'Player X'; $('lo').textContent = solo ? 'CPU · O' : 'Player O';
    $('again').textContent = ended ? 'Play next round' : 'Restart round';
    if (waiting) timer = setTimeout(() => move(cpu(b)),360);
}
for (const mode of ['solo','duo']) $(mode).onclick = () => { data.mode = mode; save(); render(); };
$('again').onclick = () => {
    const s = state();
    if (win(s.board) || s.board.every(Boolean)) s.round++;
    s.board = empty(); s.turn = 'X'; save(); render();
};
render();
