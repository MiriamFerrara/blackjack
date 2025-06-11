import React, { useState, useEffect, useCallback, useRef } from 'react';

import './App.css';
import logo from './image/logo-slot.png'; // Percorso dell'immagine del logo

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

const symbols = Object.keys(symbolData); // Estrae tutti i simboli come array di stringhe

function App() {
  // Stati principali dell'applicazione
  const [startScreen, setStartScreen] = useState(true); // Controlla la visualizzazione della schermata iniziale
  const [balance, setBalance] = useState(200); // Saldo attuale del giocatore
  const [defaultSettings, setDefaultSettings] = useState({ // Impostazioni predefinite del gioco
    balance: 200,
    mode: 'random',
    cost: 10,
  });
  const [gameMode, setGameMode] = useState('random'); // Modalità di gioco corrente ('random', 'win', 'lose')
  const [spinCost, setSpinCost] = useState(10); // Costo per ogni giro del rullo
  const [reelSymbols, setReelSymbols] = useState(['🍒', '🍋', '🍉']); // Simboli attualmente visualizzati sui rulli
  const [spinning, setSpinning] = useState(false); // Indica se i rulli stanno girando
  const [winMessage, setWinMessage] = useState(''); // Messaggio di vincita/perdita visualizzato all'utente
  const [randomSpinCount, setRandomSpinCount] = useState(0); // Contatore per la modalità casuale (1 vincita ogni 3 spin)
  const [costMessage, setCostMessage] = useState(''); // Messaggio temporaneo che mostra il costo dello spin

  // Riferimenti per elementi DOM o funzioni
  const slotRef = useRef(null); // Riferimento al contenitore della slot
  const handleSpinRef = useRef(null);

  // Effetto per ricaricare il saldo a 200€ se scende a zero o meno
  useEffect(() => {
    if (balance <= 0) {
      setBalance(200);
    }
  }, [balance]); // Si attiva ogni volta che il saldo cambia

  // NEW: Funzione per rimuovere tutte le monete dal DOM
  const clearCoins = useCallback(() => {
    // Se le monete sono generate sul body:
    const existingCoins = document.querySelectorAll('.coin-body');
    existingCoins.forEach(coin => coin.remove());

    // Se avessi usato anche coin-slot (non attivo nel tuo codice ma per completezza):
    // const existingSlotCoins = document.querySelectorAll('.coin-slot');
    // existingSlotCoins.forEach(coin => coin.remove());
  }, []); // Nessuna dipendenza, in quanto non accede a stati o prop che cambiano.

  // Funzione principale per far girare i rulli della slot
  const handleSpin = useCallback(() => {
    // Impedisce di far girare i rulli se sono già in movimento o il saldo è insufficiente
    if (spinning || balance < spinCost) {
      return;
    }

    // NEW: Rimuovi le monete esistenti all'inizio di un nuovo spin
    clearCoins();

    setSpinning(true); // Imposta lo stato di giro su true
    setBalance(prev => prev - spinCost); // Deduce il costo dello spin dal saldo
    setCostMessage(`-${spinCost}€`); // Mostra il costo dello spin
    setTimeout(() => setCostMessage(''), 1000); // Nasconde il messaggio del costo dopo 1 secondo
    setWinMessage(''); // Azzera qualsiasi messaggio di vincita/perdita precedente

    let finalSymbols = [symbols[0], symbols[0], symbols[0]]; // Simboli di default per il risultato finale

    // Logica per determinare i simboli finali in base alla modalità di gioco selezionata
    if (gameMode === 'win') {
      // In modalità 'vincente', forza una combinazione vincente con il simbolo più raro
      const rarest = symbols[symbols.length - 1];
      finalSymbols = [rarest, rarest, rarest];
    } else if (gameMode === 'lose') {
      // In modalità 'perdente', assicura una combinazione non vincente (simboli diversi)
      let shuffled = [...symbols].sort(() => 0.5 - Math.random());
      while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
        shuffled = [...symbols].sort(() => 0.5 - Math.random());
      }
      finalSymbols = [shuffled[0], shuffled[1], shuffled[2]];
    } else { // Modalità 'random'
      // In modalità casuale, ogni terzo spin è una vincita, altrimenti una perdita
      if (randomSpinCount % 3 === 0) {
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        finalSymbols = [symbol, symbol, symbol];
      } else {
        let shuffled = [...symbols].sort(() => 0.5 - Math.random());
        while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
          shuffled = [...symbols].sort(() => 0.5 - Math.random());
        }
        finalSymbols = [shuffled[0], shuffled[1], shuffled[2]];
      }
      setRandomSpinCount(prev => prev + 1); // Incrementa il contatore degli spin casuali
    }

    let frame = 0;
    // Intervallo per simulare il movimento dei rulli (aggiorna i simboli velocemente)
    const interval = setInterval(() => {
      setReelSymbols([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
      ]);
      frame++;
      // Dopo un certo numero di "frame", ferma i rulli sui simboli finali
      if (frame > 10) {
        clearInterval(interval); // Ferma l'animazione dei rulli
        setReelSymbols(finalSymbols); // Imposta i simboli al risultato finale

        // Controlla se i simboli sono tutti uguali (vincita)
        if (finalSymbols.every(sym => sym === finalSymbols[0])) {
          const prize = symbolData[finalSymbols[0]].prize; // Ottiene il valore del premio
          setBalance(prev => prev + prize); // Aggiunge il premio al saldo
          setWinMessage(`Hai vinto! +${prize}€`); // Mostra il messaggio di vincita
          triggerCoinRainBody(); // <<< Attualmente chiama la versione a pagina intera
        } else {
          // NEW: Se non c'è una vincita, assicurati che non ci siano monete residue
          clearCoins();
        }

        setSpinning(false); // Imposta lo stato di giro su false (rulli fermi)
      }
    }, 100); // Aggiorna i simboli ogni 100ms
  }, [spinning, balance, spinCost, gameMode, randomSpinCount, clearCoins]); // Aggiunta clearCoins nelle dipendenze per useCallback

  // Sincronizza la funzione handleSpin con il suo riferimento useRef
  useEffect(() => {
    handleSpinRef.current = handleSpin;
  }, [handleSpin]);

  // Gestore per l'avvio del gioco dalla schermata iniziale
  const handleStart = useCallback(() => {
    setBalance(parseInt(defaultSettings.balance)); // Imposta il saldo iniziale
    setGameMode(defaultSettings.mode); // Imposta la modalità di gioco
    setSpinCost(parseInt(defaultSettings.cost)); // Imposta il costo dello spin
    setStartScreen(false); // Nasconde la schermata iniziale e mostra il gioco

    // Imposta 3 simboli casuali e diversi tra loro all'avvio del gioco
    let shuffled = [...symbols].sort(() => 0.5 - Math.random());
    while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
      shuffled = [...symbols].sort(() => 0.5 - Math.random());
    }
    setReelSymbols([shuffled[0], shuffled[1], shuffled[2]]);
  }, [defaultSettings]);

  // Gestore per tornare alla schermata iniziale e resettare lo stato del gioco
  const handleReset = useCallback(() => {
    setStartScreen(true);
    setBalance(200);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
    setRandomSpinCount(0);
    setDefaultSettings({ // Reset default settings as well when going back
      balance: 200,
      mode: 'random',
      cost: 10,
    });
    clearCoins(); // NEW: Rimuovi le monete anche al reset
  }, [clearCoins]); // Aggiunta clearCoins nelle dipendenze

  // Gestore per ricominciare la partita con le impostazioni predefinite (senza tornare alla schermata iniziale)
  const handleRestart = useCallback(() => {
    setBalance(200);
    setSpinCost(10);
    setGameMode('random');
    setWinMessage('');
    setRandomSpinCount(0); // Reset random spin count on restart

    // Reimposta 3 simboli casuali e diversi tra loro per il nuovo avvio
    let shuffled = [...symbols].sort(() => 0.5 - Math.random());
    while (shuffled[0] === shuffled[1] || shuffled[1] === shuffled[2] || shuffled[0] === shuffled[2]) {
      shuffled = [...symbols].sort(() => 0.5 - Math.random());
    }
    setReelSymbols([shuffled[0], shuffled[1], shuffled[2]]);
    clearCoins(); // NEW: Rimuovi le monete anche al riavvio
  }, [clearCoins]); // Aggiunta clearCoins nelle dipendenze

 // --- Funzioni per la cascata di monete ---

  // Funzione per creare la cascata di monete su tutta la pagina (migliorata per realismo)
  const triggerCoinRainBody = () => {
    // Nota: questa funzione crea le monete, non le gestisce la rimozione.
    // La rimozione è ora gestita da clearCoins() chiamata in handleSpin, handleReset, handleRestart.
    for (let i = 0; i < 180; i++) { // Numero di monete per un effetto pieno
      const coin = document.createElement('div');
      coin.className = 'coin-body'; // Assegna la classe CSS 'coin-body'

      // Variazione di dimensione casuale per un effetto più realistico
      const size = Math.random() * 15 + 25; // Monete da 25px a 40px
      coin.style.width = `${size}px`;
      coin.style.height = `${size}px`;
      // Partono da sopra la viewport, in base alla loro dimensione
      coin.style.top = `-${size}px`;

      // Posizione orizzontale casuale su tutta la larghezza della viewport
      coin.style.left = `${Math.random() * 100}vw`;

      // Durata e ritardo dell'animazione casuali per variare la caduta
      const animationDuration = Math.random() * 2 + 2; // Da 2s a 4s
      const animationDelay = Math.random() * 1.5; // Ritardo iniziale fino a 1.5s
      coin.style.animationDuration = `${animationDuration}s`;
      coin.style.animationDelay = `${animationDelay}s`;

      // Aggiungi la moneta direttamente al body del documento
      document.body.appendChild(coin);

      // Rimuovi la moneta dal DOM dopo che l'animazione è terminata, più un margine di tempo
      // Questo setTimeout rimane, ma clearCoins() è il meccanismo primario per la rimozione forzata
      setTimeout(() => {
        // Controlla se la moneta esiste ancora prima di rimuovere, in caso sia già stata rimossa da clearCoins
        if (coin.parentNode) {
            coin.remove();
        }
      }, (animationDuration + animationDelay) * 1000 + 1000);
    }
  };

  // Effetto per gestire gli eventi della tastiera (Enter, Spacebar, R)
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Prevent default behavior for spacebar to avoid scrolling
      if (event.key === ' ') {
        event.preventDefault();
      }

      // If on the start screen
      if (startScreen) {
        if (event.key === 'Enter' || event.key === ' ') {
          // Trigger the start game function
          handleStart();
        }
      } else { // If in the game screen
        if (event.key === 'Enter' || event.key === ' ') {
          // Trigger the spin function using the ref to ensure it's the latest version
          if (handleSpinRef.current) {
            handleSpinRef.current();
          }
        } else if (event.key === 'r' || event.key === 'R') {
          // Trigger the restart game function
          handleRestart();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [startScreen, handleStart, handleSpin, handleRestart]);

  // Render condizionale: mostra la schermata iniziale o la schermata di gioco
  if (startScreen) {
    return (
      <div className="App">
        {/* Sezione Leggenda e Come funziona */}
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
              <li><strong>⌨️ Tasti rapidi:</strong> Puoi usare <strong>"Invio"</strong> o <strong>"Spazio"</strong> per avviare il gioco o per fare lo spin, e <strong>"R"</strong> per ricomincia la partita.</li>
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

        {/* Box delle impostazioni iniziali */}
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

  // Render della schermata di gioco della slot machine
  return (
    <div className="App">
      <div className="slot-container" ref={slotRef}>
        <img src={logo} alt="logo" className="logo" />
        <div className="message">
          <div className="balance-row">
            <span>Saldo: {balance}€</span>
            <span className={`cost-message ${costMessage ? 'show' : ''}`}>
              {costMessage || '\u00A0'} {/* Utilizza '\u00A0' (spazio non breaking) per mantenere l'altezza */}
            </span>
          </div>
          <span className={`win-message ${winMessage ? 'show' : ''}`}>
            {winMessage || '\u00A0'}
          </span>
        </div>

        {/* Rulli della slot */}
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

      {/* Pulsanti di controllo del gioco */}
      <div className="controls">
        <button onClick={handleReset}>Indietro</button>
        <button onClick={handleRestart}>Ricomincia Partita</button>
      </div>
    </div>
  );
}

export default App;