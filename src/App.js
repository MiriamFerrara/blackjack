import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './image/logo-slot.png';

const symbolData = {
  '🍒': { name: 'Ciliegia', prize: 10, rarity: 'Molto comune' },
  '🍋': { name: 'Limone', prize: 20, rarity: 'Comune' },
  '🍇': { name: 'Uva', prize: 50, rarity: 'Medio' },
  '🔔': { name: 'Campana', prize: 100, rarity: 'Raro' },
  '💎': { name: 'Diamante', prize: 300, rarity: 'Estremamente raro' },
};

const symbols = Object.keys(symbolData);

function App() {
  const [startScreen, setStartScreen] = useState(true);
  const [balance, setBalance] = useState(500);
  const [defaultSettings, setDefaultSettings] = useState({
    balance: 500,
    mode: 'random',
    cost: 10,
  });
  const [gameMode, setGameMode] = useState('random');
  const [spinCost, setSpinCost] = useState(10);
  const [reelSymbols, setReelSymbols] = useState(['🍒', '🍋', '🍇']);
  const [spinning, setSpinning] = useState(false);
  const [winMessage, setWinMessage] = useState('');
  const [randomSpinCount, setRandomSpinCount] = useState(0);

  useEffect(() => {
    if (balance <= 0) {
      setBalance(500);
    }
  }, [balance]);

  const handleStart = () => {
    setBalance(parseInt(defaultSettings.balance));
    setGameMode(defaultSettings.mode);
    setSpinCost(parseInt(defaultSettings.cost));
    setStartScreen(false);
  };

  const handleSpin = () => {
    if (spinning || balance < spinCost) return;
    setSpinning(true);
    setBalance(prev => prev - spinCost);
    setWinMessage('');

    let finalSymbols = ['🍒', '🍒', '🍒'];

    if (gameMode === 'win') {
      finalSymbols = ['💎', '💎', '💎'];
    } else if (gameMode === 'lose') {
      finalSymbols = ['🍒', '🍋', '🍇'];
    } else {
      // modalità random: vincente ogni 3 spin
      if (randomSpinCount % 3 === 0) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        finalSymbols = [symbol, symbol, symbol];
      } else {
        // tre simboli diversi
        let shuffled = [...symbols].sort(() => 0.5 - Math.random());
        while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
          shuffled = [...symbols].sort(() => 0.5 - Math.random());
        }
        finalSymbols = [shuffled[0], shuffled[1], shuffled[2]];
      }
      setRandomSpinCount(prev => prev + 1);
    }

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

        if (finalSymbols.every(sym => sym === finalSymbols[0])) {
          const prize = symbolData[finalSymbols[0]].prize;
          setBalance(prev => prev + prize);
          setWinMessage(`Hai vinto +${prize}€!`);
        }

        setSpinning(false);
      }
    }, 100);
  };

  const handleReset = () => {
    setStartScreen(true);
    setBalance(500);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
    setRandomSpinCount(0);
  };

  const handleRestart = () => {
    setBalance(500);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
  };

  if (startScreen) {
return (
      <div className="App">
      <div className="legend">
 <div className="how-to-play">
   <h3>📘 Come funziona il gioco</h3>
   <h4>1. Vuoi iniziare subito?</h4>
   <p style={{ marginTop: '4px', marginBottom: '4px' }}>
     Premi <strong>“Inizia”</strong> senza modificare nulla. Verranno usate le impostazioni predefinite:
   </p>
<ul>
     <li>💰 Saldo iniziale: <strong>€500</strong></li>
     <li>🎲 Modalità: <strong>casuale</strong> (una vincita ogni due giocate)</li>
     <li>🎯 Costo per giocata: <strong>€10</strong></li>
   </ul>

   <h4><strong>Cosa succede dopo:</strong></h4>
   <ul>
     <li>▶ Premi <strong>“GIRA”</strong> per far partire il rullo.</li>
     <li>🏆 Se escono 3 simboli uguali, vinci l’importo corrispondente (vedi legenda).</li>
     <li>🎰 In modalità casuale, ogni terza giocata è vincente.</li>
     <li>💹 Il saldo si aggiorna automaticamente dopo ogni giocata.</li>
     <li>🔄 Se il saldo arriva a €0, viene ricaricato automaticamente a €500.</li>
   </ul>

   <h4>2. Vuoi impostare i parametri manualmente prima di iniziare?</h4>
   <ul>
     <li><strong>Saldo iniziale:</strong> è il budget iniziale. Sale se vinci, scende se perdi.</li>
     <li><strong>Modalità:</strong>
       <ul>
         <li>🏅 <strong>Vincente:</strong> vinci sempre alla prima giocata.</li>
         <li>💀 <strong>Perdente:</strong> perdi sempre alla prima giocata.</li>
         <li>⚖️ <strong>Casuale:</strong> ogni terza giocata è vincente.</li>
       </ul>
     </li>
     <li><strong>Costo per giocata:</strong> quanto spendi ogni volta che premi “GIRA” (es: €10).</li>
   </ul>

   <h4>3. Durante il gioco puoi usare:</h4>
   <ul>
     <li><strong>🔁 RESET:</strong> torna alla schermata iniziale per impostare tutto da capo.</li>
     <li><strong>♻️ RICOMINCIA:</strong> ripristina i valori predefiniti (saldo €500, modalità casuale, costo €10) senza uscire dalla slot.</li>
   </ul>
 </div>
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
                          <td>{symbolData[sym].prize}</td>
                          <td>{symbolData[sym].rarity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>


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

  return (
    <div className="App">
      <div className="slot-container">
        <img src={logo} alt="logo" className="logo" />
        <div className="message">
          Saldo: €{balance}<br />
          {winMessage && <span>{winMessage}</span>}
        </div>
        <div className="slot">
          {reelSymbols.map((symbol, idx) => (
            <div key={idx} className="reel-box">{symbol}</div>
          ))}
        </div>
        <button className="spin-btn" onClick={handleSpin} disabled={spinning}>
          GIRA
        </button>
      </div>
      <div className="controls">
        <button onClick={handleReset}>RESET</button>
        <button onClick={handleRestart}>RICOMINCIA</button>
      </div>
    </div>
  );
}

export default App;
