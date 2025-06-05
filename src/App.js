import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './image/logo-slot-b.png';

// Dati dei simboli disponibili nella slot machine, con premi e rarità
const symbolData = {
  '🍒': { name: 'Ciliegia', prize: 10, rarity: 'Molto comune' },
  '🍋': { name: 'Limone', prize: 20, rarity: 'Comune' },
  '🍉': { name: 'Anguria', prize: 40, rarity: 'Comune' },
  '⭐':  { name: 'Stella', prize: 50, rarity: 'Medio' },
  '🔔': { name: 'Campana', prize: 100, rarity: 'Raro' },
  '7️⃣': { name: 'Numero 7', prize: 300, rarity: 'Molto raro' },
  '💎': { name: 'Diamante', prize: 500, rarity: 'Estremamente raro' },
};

const symbols = Object.keys(symbolData); // Estrae tutti i simboli

function App() {
  // Stati principali dell'app
  const [startScreen, setStartScreen] = useState(true); // Schermata iniziale attiva?
  const [balance, setBalance] = useState(500); // Saldo del giocatore
  const [defaultSettings, setDefaultSettings] = useState({
    balance: 500,
    mode: 'random',
    cost: 10,
  }); // Impostazioni iniziali
  const [gameMode, setGameMode] = useState('random'); // Modalità di gioco attiva
  const [spinCost, setSpinCost] = useState(10); // Costo di una giocata
  const [reelSymbols, setReelSymbols] = useState(['🍒', '🍋', '🍉']); // Simboli mostrati
  const [spinning, setSpinning] = useState(false); // Il rullo sta girando?
  const [winMessage, setWinMessage] = useState(''); // Messaggio di vincita
  const [randomSpinCount, setRandomSpinCount] = useState(0); // Contatore giocate in modalità casuale
  const [costMessage, setCostMessage] = useState(''); // Messaggio di costo temporaneo

  // Se il saldo scende a zero, ricaricalo automaticamente
  useEffect(() => {
    if (balance <= 0) {
      setBalance(500);
    }
  }, [balance]);

  // Avvio del gioco: imposta configurazione iniziale
  const handleStart = () => {
    setBalance(parseInt(defaultSettings.balance));
    setGameMode(defaultSettings.mode);
    setSpinCost(parseInt(defaultSettings.cost));
    setStartScreen(false);

    // Mostra 3 simboli casuali e diversi tra loro
    let shuffled = [...symbols].sort(() => 0.5 - Math.random());
    while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
      shuffled = [...symbols].sort(() => 0.5 - Math.random());
    }
    setReelSymbols([shuffled[0], shuffled[1], shuffled[2]]);
  };

  // Funzione principale per far girare il rullo
  const handleSpin = () => {
    if (spinning || balance < spinCost) return; // Evita doppie giocate o saldo insufficiente
    setSpinning(true);
    setBalance(prev => prev - spinCost); // Scala il costo della giocata
    setCostMessage(`-${spinCost}€`);
    setTimeout(() => setCostMessage(''), 1000); // Nasconde il messaggio dopo 1 sec
    setWinMessage('');

    // Prepara i simboli finali da mostrare alla fine dell'animazione
    let finalSymbols = [symbols[0], symbols[0], symbols[0]];

    // Logica per modalità vincente, perdente, casuale
    if (gameMode === 'win') {
      const rarest = symbols[symbols.length - 1];
      finalSymbols = [rarest, rarest, rarest];
    } else if (gameMode === 'lose') {
      let shuffled = [...symbols].sort(() => 0.5 - Math.random());
      while (
        shuffled[0] === shuffled[1] ||
        shuffled[1] === shuffled[2] ||
        shuffled[0] === shuffled[2]
      ) {
        shuffled = [...symbols].sort(() => 0.5 - Math.random());
      }
      finalSymbols = [shuffled[0], shuffled[1], shuffled[2]];
    } else {
      // Modalità casuale: ogni 3° giocata è vincente
      if (randomSpinCount % 3 === 0) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        finalSymbols = [symbol, symbol, symbol];
      } else {
        let shuffled = [...symbols].sort(() => 0.5 - Math.random());
        while (
          shuffled[0] === shuffled[1] ||
          shuffled[1] === shuffled[2] ||
          shuffled[0] === shuffled[2]
        ) {
          shuffled = [...symbols].sort(() => 0.5 - Math.random());
        }
        finalSymbols = [shuffled[0], shuffled[1], shuffled[2]];
      }
      setRandomSpinCount(prev => prev + 1);
    }

    // Animazione del rullo: cambia simboli per 10 frame
    let frame = 0;
    const interval = setInterval(() => {
      setReelSymbols([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      frame++;
      if (frame > 10) {
        clearInterval(interval);
        setReelSymbols(finalSymbols);

        // Se tutti i simboli sono uguali, calcola la vincita
        if (finalSymbols.every(sym => sym === finalSymbols[0])) {
          const prize = symbolData[finalSymbols[0]].prize;
          setBalance(prev => prev + prize);
          setWinMessage(`Hai vinto! +${prize}€`);
        }

        setSpinning(false);
      }
    }, 100); // velocità animazione
  };

  // Torna alla schermata iniziale
  const handleReset = () => {
    setStartScreen(true);
    setBalance(500);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
    setRandomSpinCount(0);
  };

  // Ricomincia la partita senza tornare alla schermata iniziale
  const handleRestart = () => {
    setBalance(500);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');

    let shuffled = [...symbols].sort(() => 0.5 - Math.random());
    while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
      shuffled = [...symbols].sort(() => 0.5 - Math.random());
    }
    setReelSymbols([shuffled[0], shuffled[1], shuffled[2]]);
  };

  // RENDER: Schermata iniziale
  if (startScreen) {
    return (
      <div className="App">
        <div className="legend">
          {/* Spiegazione del gioco */}
          <div className="how-to-play">
            <h3>📘 Come funziona il gioco</h3>
            {/* Istruzioni dettagliate */}
            {/* ...contenuto accorciato per brevità */}
          </div>

          {/* Legenda premi */}
          <h3>Legenda Vincite</h3>
          <table>
            <thead>
              <tr>
                <th>Simbolo</th>
                <th>Nome</th>
                <th>Vincita (€)</th>
                <th>Rarità</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map((sym) => (
                <tr key={sym}>
                  <td>{sym}</td>
                  <td>{symbolData[sym].name}</td>
                  <td>{symbolData[sym].prize}€</td>
                  <td>{symbolData[sym].rarity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form impostazioni iniziali */}
        <div className="setup-box">
          <h2>Impostazioni iniziali</h2>
          <label>Saldo iniziale (€):
            <input
              type="number"
              value={defaultSettings.balance}
              onChange={(e) =>
                setDefaultSettings({ ...defaultSettings, balance: e.target.value })
              }
            />
          </label>
          <label>Modalità:
            <select
              value={defaultSettings.mode}
              onChange={(e) =>
                setDefaultSettings({ ...defaultSettings, mode: e.target.value })
              }
            >
              <option value="random">Casuale</option>
              <option value="win">Vincente</option>
              <option value="lose">Perdente</option>
            </select>
          </label>
          <label>Costo giocata (€):
            <input
              type="number"
              min="1"
              max="500"
              value={defaultSettings.cost}
              onChange={(e) =>
                setDefaultSettings({ ...defaultSettings, cost: e.target.value })
              }
            />
          </label>
          <button onClick={handleStart}>Inizia</button>
        </div>
      </div>
    );
  }

  // RENDER: Schermata di gioco slot
  return (
    <div className="App">
      <div className="slot-container">
        <img src={logo} alt="logo" className="logo" />
        <div className="message">
          <div className="balance-row">
            <span>Saldo: {balance}€</span>
            <span className={`cost-message ${costMessage ? 'show' : ''}`}>
              {costMessage || '\u00A0'}
            </span>
          </div>
          <span className={winMessage ? 'show' : ''}>
            {winMessage || '\u00A0'}
          </span>
        </div>

        {/* Rullo slot */}
        <div className="slot">
          {reelSymbols.map((symbol, idx) => (
            <div key={idx} className="reel-box">{symbol}</div>
          ))}
        </div>

        {/* Pulsante SPIN */}
        <button className="spin-btn" onClick={handleSpin} disabled={spinning}>
          <strong>SPIN</strong>
        </button>
      </div>

      {/* Pulsanti di controllo */}
      <div className="controls">
        <button onClick={handleReset}>Indietro</button>
        <button onClick={handleRestart}>Ricomincia Partita</button>
      </div>
    </div>
  );
}

export default App;
