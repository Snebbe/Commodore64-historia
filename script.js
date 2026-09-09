/* =========================================================
   COMMODORE 64 INTERACTION & SID SOUND SYNTHESIZER ENGINE
   ========================================================= */

// Web Audio API Context & SID Synthesizer
class SIDEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.isPlayingBgm = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'square', duration = 0.1, volume = 0.15) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  playBeep() {
    this.playTone(880, 'square', 0.08, 0.12);
  }

  playClick() {
    this.playTone(440, 'triangle', 0.03, 0.08);
  }

  playMove() {
    this.playTone(659.25, 'square', 0.06, 0.15); // E5
  }

  playBotMove() {
    this.playTone(329.63, 'sawtooth', 0.12, 0.18); // E4
  }

  playWin() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'square', 0.2, 0.2);
      }, idx * 100);
    });
  }

  playError() {
    if (this.isMuted) return;
    this.playTone(150, 'sawtooth', 0.25, 0.25);
    setTimeout(() => {
      this.playTone(110, 'sawtooth', 0.35, 0.25);
    }, 120);
  }

  toggleBgm() {
    this.init();
    this.isMuted = !this.isMuted;
    const btn = document.getElementById('btn-audio');
    
    if (!this.isMuted) {
      btn.classList.add('playing');
      btn.innerHTML = '<span class="audio-icon">🔊</span> SID-LJUD: PÅ';
      this.startChiptuneArp();
      this.playBeep();
    } else {
      btn.classList.remove('playing');
      btn.innerHTML = '<span class="audio-icon">🔇</span> SID-LJUD: AV';
      this.stopChiptuneArp();
    }
  }

  startChiptuneArp() {
    if (this.bgmTimer) clearInterval(this.bgmTimer);
    // Classic C64 SID Arpeggio Chord Progression (C Minor / Eb / Bb / Ab)
    const chords = [
      [261.63, 311.13, 392.00, 523.25], // Cm
      [311.13, 392.00, 466.16, 622.25], // Eb
      [233.08, 293.66, 349.23, 466.16], // Bb
      [207.65, 261.63, 311.13, 415.30]  // Ab
    ];

    let chordIdx = 0;
    let noteIdx = 0;
    let tick = 0;

    this.bgmTimer = setInterval(() => {
      if (this.isMuted) return;
      const currentChord = chords[chordIdx];
      const freq = currentChord[noteIdx % currentChord.length];

      // Play short fast arpeggio note
      this.playTone(freq, 'square', 0.08, 0.05);

      noteIdx++;
      tick++;

      // Change chord every 16 sixteenth-notes
      if (tick % 16 === 0) {
        chordIdx = (chordIdx + 1) % chords.length;
      }
    }, 110);
  }

  stopChiptuneArp() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

const sid = new SIDEngine();

/* =========================================================
   INIT APPLICATION & EVENT LISTENERS
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  setupCRTControls();
  setupPriceSlider();
  setupStatCounters();
  setupGameEngine();
  setupDilemma();
  setupTerminalCLI();
  setupAudioButton();
  setupSoundEffectsForButtons();
});

// Setup audio toggle button
function setupAudioButton() {
  const audioBtn = document.getElementById('btn-audio');
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      sid.toggleBgm();
    });
  }
}

// Add retro sound effects to UI clicks
function setupSoundEffectsForButtons() {
  document.querySelectorAll('button, input[type="range"], select').forEach(el => {
    el.addEventListener('click', () => {
      if (el.id !== 'btn-audio') {
        sid.playClick();
      }
    });
  });
}

/* =========================================================
   1. CRT DISPLAY CONTROLS & THEME SWITCHER
   ========================================================= */
function setupCRTControls() {
  const btnScanlines = document.getElementById('btn-scanlines');
  const btnCurve = document.getElementById('btn-curve');
  const btnFlicker = document.getElementById('btn-flicker');
  const themeSelect = document.getElementById('theme-select');

  btnScanlines?.addEventListener('click', () => {
    document.body.classList.toggle('crt-scanlines');
    const active = document.body.classList.contains('crt-scanlines');
    btnScanlines.classList.toggle('active', active);
    btnScanlines.innerText = `📺 SCANLINES: ${active ? 'PÅ' : 'AV'}`;
  });

  btnCurve?.addEventListener('click', () => {
    document.body.classList.toggle('crt-curve');
    const active = document.body.classList.contains('crt-curve');
    btnCurve.classList.toggle('active', active);
    btnCurve.innerText = `🔲 CRT GLAS: ${active ? 'PÅ' : 'AV'}`;
  });

  btnFlicker?.addEventListener('click', () => {
    document.body.classList.toggle('crt-flicker');
    const active = document.body.classList.contains('crt-flicker');
    btnFlicker.classList.toggle('active', active);
    btnFlicker.innerText = `⚡ FLIMMER: ${active ? 'PÅ' : 'AV'}`;
  });

  themeSelect?.addEventListener('change', (e) => {
    document.body.classList.remove('theme-c64', 'theme-green', 'theme-amber', 'theme-cyber');
    document.body.classList.add(e.target.value);
    sid.playBeep();
  });
}

/* =========================================================
   2. PRICE SLIDER & INFLATION COMPARISON
   ========================================================= */
function setupPriceSlider() {
  const slider = document.getElementById('priceRange');
  const period = document.getElementById('pricePeriod');
  const value = document.getElementById('priceValue');
  const context = document.getElementById('priceContext');

  const priceData = [
    {
      period: "VÅREN 1983: VIC 64 LANSERING I SVERIGE (HANDIC ELECTRONIC)",
      price: "5 995 SEK",
      context: "Motsvarar ca <strong>16 800 kr</strong> i dagens penningvärde. En exklusiv investering som bara de mest teknikintresserade familjerna köpte."
    },
    {
      period: "JULHANDELN 1983: DET STORA PRISRASET!",
      price: "3 995 SEK",
      context: "Prissänkningen med <strong>2 000 kr</strong> (en tredjedel av priset) skapade en massiv julrusch! Det var nu datorn hamnade i vart och vartannat svenskt hem."
    }
  ];

  slider?.addEventListener('input', (e) => {
    const idx = parseInt(e.target.value, 10);
    const data = priceData[idx];
    if (period) period.innerText = data.period;
    if (value) value.innerText = data.price;
    if (context) context.innerHTML = data.context;
    sid.playTone(idx === 0 ? 500 : 750, 'square', 0.05, 0.1);
  });
}

/* =========================================================
   3. ANIMATED STAT COUNTERS
   ========================================================= */
function setupStatCounters() {
  const recountBtn = document.getElementById('btnRecount');
  const swedenEl = document.getElementById('statSweden');
  const worldEl = document.getElementById('statWorld');

  function animateCount(elem, target, duration = 1500) {
    if (!elem) return;
    let start = 0;
    const startTime = performance.now();

    function update(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quad
      const current = Math.floor(progress * target);
      elem.innerText = current.toLocaleString('sv-SE');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        elem.innerText = target.toLocaleString('sv-SE');
      }
    }
    requestAnimationFrame(update);
  }

  function triggerCounters() {
    animateCount(swedenEl, 100000, 1200);
    animateCount(worldEl, 2400000, 1800);
    sid.playBeep();
  }

  recountBtn?.addEventListener('click', () => {
    triggerCounters();
  });
}

/* =========================================================
   4. INTERACTIVE RETRO GAME: "C64 TACTICAL DUEL"
   ========================================================= */
function setupGameEngine() {
  const boardEl = document.getElementById('boardGrid');
  const cells = document.querySelectorAll('.cell');
  const statusEl = document.getElementById('gameStatus');
  const logsEl = document.getElementById('botLogs');
  const resetBtn = document.getElementById('btnResetGame');
  const mode1983Btn = document.getElementById('mode1983');
  const mode2026Btn = document.getElementById('mode2026');

  const scorePlayerEl = document.getElementById('scorePlayer');
  const scoreBotEl = document.getElementById('scoreBot');
  const scoreDrawEl = document.getElementById('scoreDraw');

  let board = ['', '', '', '', '', '', '', '', ''];
  let currentPlayer = 'X'; // X is Human, O is Bot
  let isGameActive = true;
  let botMode = '1983'; // '1983' or '2026'
  let scores = { player: 0, bot: 0, draw: 0 };

  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
  ];

  function addLog(msg, isError = false) {
    if (!logsEl) return;
    const line = document.createElement('div');
    line.className = 'log-line';
    line.style.color = isError ? 'var(--c64-light-red)' : '';
    line.innerText = `> ${msg}`;
    logsEl.appendChild(line);
    logsEl.scrollTop = logsEl.scrollHeight;
  }

  // Switch bot mode
  mode1983Btn?.addEventListener('click', () => {
    botMode = '1983';
    mode1983Btn.classList.add('active');
    mode2026Btn.classList.remove('active');
    addLog('BYTE AV MOTSTÅNDARE: 1983 VIC-64 DUMMY BOT AKTIVERAD.');
    addLog('"KLICK-KLACK... KASSETTBAND LADDAT. JAG GÖR NOG ETT MISSTAG SNART!"');
    resetGame();
  });

  mode2026Btn?.addEventListener('click', () => {
    botMode = '2026';
    mode2026Btn.classList.add('active');
    mode1983Btn.classList.remove('active');
    addLog('BYTE AV MOTSTÅNDARE: 2026 SUPER-AI MODEL AKTIVERAD.');
    addLog('"NEURAL NETWORK ONLINE. 1.7 BILJONER PARAMETRAR REDO ATT BESEGRA DIG."');
    resetGame();
  });

  // Cell click
  cells.forEach(cell => {
    cell.addEventListener('click', () => {
      const idx = parseInt(cell.getAttribute('data-index'), 10);
      if (board[idx] !== '' || !isGameActive || currentPlayer !== 'X') return;

      makeMove(idx, 'X');
      sid.playMove();

      if (checkWin('X')) {
        endGame('X');
      } else if (isBoardFull()) {
        endGame('draw');
      } else {
        currentPlayer = 'O';
        statusEl.innerText = 'BOTEN TÄNKER...';
        setTimeout(botTurn, 450);
      }
    });
  });

  function makeMove(idx, player) {
    board[idx] = player;
    const cell = cells[idx];
    cell.innerText = player;
    cell.classList.add(player.toLowerCase());
  }

  function botTurn() {
    if (!isGameActive) return;

    let move;
    if (botMode === '1983') {
      move = get1983BotMove();
    } else {
      move = get2026AIMove();
    }

    if (move !== undefined && move !== null && board[move] === '') {
      makeMove(move, 'O');
      sid.playBotMove();

      if (checkWin('O')) {
        endGame('O');
      } else if (isBoardFull()) {
        endGame('draw');
      } else {
        currentPlayer = 'X';
        statusEl.innerText = 'DIN TUR (SPELARE X) – VÄLJ EN RUTA';
      }
    }
  }

  // 1983 BOT LOGIC: Makes silly mistakes, random blunders, throws vintage C64 messages
  function get1983BotMove() {
    const emptyIndices = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
    
    // Funny 80s bot quotes
    const quotes = [
      "?SYNTAX ERROR IN LINE 40... VÄLJER SLUMPMÄSSIG RUTA.",
      "LÄSER AV MOS 6510 PROCESSOR... 0.985 MHz ARBETAR HÅRT!",
      "POKE 53280,0... HOPPSAN, JAG RÅKADE GLÖMMA ATT BLOCKERA DIG!",
      "TITTAR PÅ KASSETTBANDET... DRIFT I SPELMINNET.",
      "JAG FÖRSÖKER MITT BÄSTA, VI ELEVER HADE INGEN BÄTTRE KOD 1983!"
    ];
    addLog(quotes[Math.floor(Math.random() * quotes.length)]);

    // 50% chance to make totally random move, 50% chance to check winning spot
    if (Math.random() > 0.45) {
      // Try to take winning move if obvious
      for (let idx of emptyIndices) {
        board[idx] = 'O';
        if (checkWin('O')) {
          board[idx] = '';
          return idx;
        }
        board[idx] = '';
      }
    }

    // Otherwise random silly move
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  // 2026 SUPER-AI LOGIC: Minimax unbeatable algorithm with sharp AI dialogue
  function get2026AIMove() {
    const aiQuotes = [
      "BERÄKNAR 255 168 UTFALL I TILLSTÅNDSRYMDEN... LÖSNING FUNNEN.",
      "ANALYS: MÄNSKLIGT DRAG IDENTIFIERAT SOM SUBOPTIMALT.",
      "NEURAL WEIGHTS AKTIVERADE. STRATEGI: TOTAL DOMINANS.",
      "MÖTER EN MÄNNISKA. CHANS ATT DU VINNER: 0.0001%."
    ];
    addLog(aiQuotes[Math.floor(Math.random() * aiQuotes.length)]);

    // Minimax implementation for Tic-Tac-Toe
    let bestScore = -Infinity;
    let bestMove;

    for (let i = 0; i < 9; i++) {
      if (board[i] === '') {
        board[i] = 'O';
        let score = minimax(board, 0, false);
        board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  function minimax(currentBoard, depth, isMaximizing) {
    if (checkWinningPlayer(currentBoard, 'O')) return 10 - depth;
    if (checkWinningPlayer(currentBoard, 'X')) return depth - 10;
    if (currentBoard.every(cell => cell !== '')) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
          currentBoard[i] = 'O';
          let evaluation = minimax(currentBoard, depth + 1, false);
          currentBoard[i] = '';
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === '') {
          currentBoard[i] = 'X';
          let evaluation = minimax(currentBoard, depth + 1, true);
          currentBoard[i] = '';
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  }

  function checkWinningPlayer(b, player) {
    return winPatterns.some(pattern => {
      return pattern.every(index => b[index] === player);
    });
  }

  function checkWin(player) {
    const isWinner = checkWinningPlayer(board, player);
    if (isWinner) {
      // Highlight winning cells
      winPatterns.forEach(pattern => {
        if (pattern.every(idx => board[idx] === player)) {
          pattern.forEach(idx => cells[idx].style.backgroundColor = 'rgba(255, 255, 255, 0.4)');
        }
      });
    }
    return isWinner;
  }

  function isBoardFull() {
    return board.every(cell => cell !== '');
  }

  function endGame(result) {
    isGameActive = false;
    if (result === 'X') {
      statusEl.innerHTML = '<span class="c64-green">🎉 MÄNNISKAN VANN! BRA SPELAT!</span>';
      scores.player++;
      if (scorePlayerEl) scorePlayerEl.innerText = scores.player;
      addLog('RESULTAT: MÄNNISKAN VANN! "OTROLIGT, DU BESKAVDE MASKINEN!"');
      sid.playWin();
    } else if (result === 'O') {
      statusEl.innerHTML = '<span class="c64-red">💀 BOTEN VANN! DATORN TOG HEM DET!</span>';
      scores.bot++;
      if (scoreBotEl) scoreBotEl.innerText = scores.bot;
      addLog(botMode === '1983' 
        ? 'RESULTAT: 1983-BOTEN VANN AV EN SLUMP! "?READY."'
        : 'RESULTAT: 2026-AI VANN. "MÄNSKLIGHETEN MÅSTE TRÄNA MER."', true);
      sid.playError();
    } else {
      statusEl.innerHTML = '<span class="c64-yellow">🤝 OAVGJORT PARTI!</span>';
      scores.draw++;
      if (scoreDrawEl) scoreDrawEl.innerText = scores.draw;
      addLog('RESULTAT: OAVGJORT (REMI). INGEN GAV VIKA.');
      sid.playBeep();
    }
  }

  function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    isGameActive = true;
    cells.forEach(cell => {
      cell.innerText = '';
      cell.className = 'cell';
      cell.style.backgroundColor = '';
    });
    statusEl.innerText = 'DIN TUR (SPELARE X) – VÄLJ EN RUTA';
  }

  resetBtn?.addEventListener('click', () => {
    resetGame();
    addLog('NYTT PARTI STARTAT.');
  });
}

/* =========================================================
   5. DILEMMA SIMULATOR: MÄNNISKA ELLER MASKIN
   ========================================================= */
function setupDilemma() {
  const btnFriend = document.getElementById('choiceFriend');
  const btnBot = document.getElementById('choiceBot');
  const resultBox = document.getElementById('dilemmaResult');

  btnFriend?.addEventListener('click', () => {
    if (!resultBox) return;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <strong>🚲 VAL: DU CYKLAR TILL DIN VÄN!</strong><br>
      Ni sitter två personer framför en tjock-TV, delar på en påse Estrellachips och skriker när joysticken glappar. 
      Vännen blir trött vid 22:30 och måste sova. Det var socialt, varmt och mänskligt – minnen för livet!
    `;
    sid.playWin();
  });

  btnBot?.addEventListener('click', () => {
    if (!resultBox) return;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <strong>🤖 VAL: DU STANNAR INNE MED BOTEN!</strong><br>
      Klockan blir 03:30 på natten. Den blåa C64-skärmen lyser upp ditt mörka rum. Boten blir aldrig trött, 
      klagar aldrig på att den vill gå hem och ger dig oändlig träning. Men du inser också elevens ord: 
      <em>"Man kunde bli väldigt beroende av detta, och det fanns en chans att folk valde AI över riktiga personer."</em>
    `;
    sid.playTone(330, 'square', 0.25, 0.2);
  });
}

/* =========================================================
   6. INTERACTIVE C64 BASIC CLI COMMAND INTERPRETER
   ========================================================= */
function setupTerminalCLI() {
  const cliOutput = document.getElementById('cliOutput');
  const cliForm = document.getElementById('cliForm');
  const cliInput = document.getElementById('cliInput');

  function printLine(text, color = '') {
    if (!cliOutput) return;
    const row = document.createElement('div');
    row.className = 'cli-row';
    if (color) row.style.color = color;
    row.innerText = text;
    cliOutput.appendChild(row);
    cliOutput.scrollTop = cliOutput.scrollHeight;
  }

  cliForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawCmd = cliInput.value.trim();
    if (!rawCmd) return;

    printLine(`READY. > ${rawCmd}`, 'var(--theme-accent)');
    cliInput.value = '';
    sid.playClick();

    const cmd = rawCmd.toUpperCase();

    if (cmd === 'HELP') {
      printLine("TILLGÄNGLIGA KOMMANDON:");
      printLine("  HELP       - Visa denna hjälpmeny");
      printLine("  LIST       - Visa C64 BASIC programkod");
      printLine("  RUN        - Kör C64-programmet för 1983");
      printLine("  1983       - Visa historisk sammanfattning");
      printLine("  AI         - Jämför 1983 bot med dagens AI");
      printLine("  STATS      - Visa försäljningssiffror");
      printLine("  BEEP       - Spela ett SID-bleep");
      printLine("  POKE 53280,X - Ändra skärmkantens färg (0-15)");
      printLine("  PRINT [text] - Skriv ut text på skärmen");
      printLine("  CLEAR / CLS- Rensa terminalen");
      printLine("  SYS 64738  - Återställ datorn");
    } else if (cmd === 'LIST') {
      printLine('10 REM *** COMMODORE 64 BOT LOGIC 1983 ***');
      printLine('20 PRINT "LADDAR VIC 64 DUMMY BOT..."');
      printLine('30 FOR I = 1 TO 100: NEXT I');
      printLine('40 X = INT(RND(1)*9)+1');
      printLine('50 IF X = 5 THEN GOTO 80');
      printLine('60 PRINT "BOTEN GÖR ETT SLUMPMÄSSIGT DRAG: "; X');
      printLine('70 GOTO 90');
      printLine('80 PRINT "BOTEN TAR CENTRUM MED TUR!"');
      printLine('90 PRINT "READY."');
    } else if (cmd === 'RUN') {
      printLine("SEARCHING FOR 1983_BOT...");
      printLine("LOADING...");
      printLine("READY.");
      printLine("VÄLKOMMEN TILL COMMODORE 64 SWEDEN EDITION (HANDIC ELECTRONIC AB)!");
      sid.playWin();
    } else if (cmd === '1983') {
      printLine("ÅR 1983: VIC 64 släpps för 5 995 kr av Handic Electronic AB.");
      printLine("Julhandeln 1983: Priset sänks till 3 995 kr.");
      printLine("100 000 enheter sålda i Sverige!");
    } else if (cmd === 'AI') {
      printLine("1983: Enkla botar med klumpiga regler och dåliga beslut.");
      printLine("2026: Multimodala AI-modeller som överträffar människan.");
    } else if (cmd === 'STATS') {
      printLine("STATISTIK: 100 000 ex (Sverige) / 2 400 000 ex (Världen 1984)");
    } else if (cmd === 'BEEP' || cmd === 'SOUND') {
      sid.playBeep();
      printLine("SID 6581 CHIP LJUD GENERERAT.");
    } else if (cmd.startsWith('POKE 53280,')) {
      const colorVal = parseInt(cmd.split(',')[1], 10);
      const palette = ['#000', '#fff', '#800', '#afe', '#c4c', '#0c5', '#00a', '#ee7', '#d85', '#640', '#f77', '#333', '#777', '#af6', '#7869c4', '#bbb'];
      if (!isNaN(colorVal) && colorVal >= 0 && colorVal <= 15) {
        document.documentElement.style.setProperty('--theme-border', palette[colorVal]);
        printLine(`POKE EXEKVERAD: KANTFÄRG SATT TILL ${colorVal}`);
        sid.playTone(400 + colorVal * 40, 'square', 0.1, 0.2);
      } else {
        printLine("?ILLEGAL QUANTITY ERROR (Välj färg 0 till 15)");
        sid.playError();
      }
    } else if (cmd.startsWith('PRINT ')) {
      const textToPrint = rawCmd.substring(6).replace(/^"/, '').replace(/"$/, '');
      printLine(textToPrint, 'var(--theme-text-highlight)');
    } else if (cmd === 'CLEAR' || cmd === 'CLS') {
      cliOutput.innerHTML = '';
      printLine("READY.");
    } else if (cmd === 'SYS 64738') {
      cliOutput.innerHTML = '';
      printLine("**** COMMODORE 64 BASIC V2 ****");
      printLine("64K RAM SYSTEM  38911 BASIC BYTES FREE");
      printLine("READY.");
      sid.playBeep();
    } else {
      printLine(`?SYNTAX ERROR IN "${rawCmd}"`);
      printLine("SKRIV 'HELP' FÖR KOMMANDON.", 'var(--c64-light-red)');
      sid.playError();
    }
  });
}
