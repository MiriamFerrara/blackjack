import React, { useState, useEffect, useCallback } from 'react';
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
  const [balance, setBalance] = useState(200); // Saldo del giocatore
  const [defaultSettings, setDefaultSettings] = useState({
    balance: 200,
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
      setBalance(200);
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
const handleSpin = useCallback(() => {
  if (spinning || balance < spinCost) return;
  setSpinning(true);
  setBalance(prev => prev - spinCost);
  setCostMessage(`-${spinCost}€`);
  setTimeout(() => setCostMessage(''), 1000);
  setWinMessage('');

  let finalSymbols = [symbols[0], symbols[0], symbols[0]];

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
        setWinMessage(`Hai vinto! +${prize}€`);
      }

      setSpinning(false);
    }
  }, 100);
}, [spinning, balance, spinCost, gameMode, randomSpinCount]);

useEffect(() => {
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSpin();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}, [handleSpin]);


  // Torna alla schermata iniziale
  const handleReset = () => {
    setStartScreen(true);
    setBalance(200);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
    setRandomSpinCount(0);
  };

  // Ricomincia la partita senza tornare alla schermata iniziale
  const handleRestart = () => {
    setBalance(200);
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
    <div className="how-to-play">
      <h3>📘 Come funziona il gioco</h3>
      <h4>1. Vuoi iniziare subito?</h4>
      <p style={{ marginTop: '4px', marginBottom: '4px' }}>
        Premi <strong>“Inizia”</strong> senza modificare nulla. Verranno usate le impostazioni predefinite:
      </p>
   <ul>
        <li>💰 Saldo iniziale: <strong>€200</strong></li>
        <li>🎲 Modalità: <strong>casuale</strong> (una vincita ogni due giocate)</li>
        <li>🎯 Costo per giocata: <strong>€10</strong> ogni volta che preme “SPIN”</li>
      </ul>

      <h4><strong>Cosa succede dopo:</strong></h4>
      <ul>
        <li>▶ Premi <strong>“SPIN”</strong> per far partire il rullo.</li>
        <li>🏆 Se escono 3 simboli uguali, vinci l’importo corrispondente (vedi legenda).</li>
        <li>🎰 In modalità casuale, ogni terza giocata è vincente.</li>
        <li>💹 Il saldo si aggiorna automaticamente dopo ogni giocata.</li>
        <li>🔄 Se il saldo arriva a €0, viene ricaricato automaticamente a €200.</li>
      </ul>

      <h4>2. Prima di iniziare vuoi impostare i parametri manualmente?</h4>
      <ul>
        <li><strong>Saldo iniziale:</strong> è il budget iniziale. Sale se vinci, scende se perdi.</li>
        <li><strong>Modalità:</strong>
          <ul>
            <li>🏅 <strong>Vincente:</strong> vinci sempre.</li>
            <li>💀 <strong>Perdente:</strong> perdi sempre.</li>
            <li>⚖️ <strong>Casuale:</strong> ogni terza giocata è vincente.</li>
          </ul>
        </li>
        <li><strong>Costo per giocata:</strong> quanto spendi ogni volta che premi “SPIN” (es: €10).</li>
      </ul>

      <h4>3. Durante il gioco puoi usare:</h4>
      <ul>
        <li><strong>🔁 Indietro:</strong> torna alla schermata iniziale per impostare tutto da capo.</li>
        <li><strong>♻️ Ricomincia Partita:</strong> ripristina i valori predefiniti (saldo €200, modalità casuale, costo €10) senza uscire dalla slot.</li>
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
                             <td>{symbolData[sym].prize}€</td>
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
                 max="200"
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
