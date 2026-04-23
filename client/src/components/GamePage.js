import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../constants/scenarios';
import './GamePage.css';

const MAX_ROUNDS = 10;
const TIME_LIMIT_SEC = 15;

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function GamePage() {
  const [gameState, setGameState] = useState('start'); // start, playing, feedback, end
  const [sessionData, setSessionData] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_SEC);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null);
  const timerRef = useRef(null);

  // Start the game
  const startGame = () => {
    setSessionData(shuffle(SCENARIOS).slice(0, MAX_ROUNDS));
    setCurrentRound(0);
    setScore(0);
    setStreak(0);
    setGameState('playing');
    setTimeLeft(TIME_LIMIT_SEC);
  };

  // Timer logic
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleTimeout = () => {
    setLastAnswerCorrect(false);
    setStreak(0);
    setGameState('feedback');
  };

  const handleGuess = (userGuessedPhishing) => {
    clearInterval(timerRef.current);
    const currentScenario = sessionData[currentRound];
    const isCorrect = userGuessedPhishing === currentScenario.isPhishing;
    
    setLastAnswerCorrect(isCorrect);
    if (isCorrect) {
      const multiplier = Math.min(Math.floor(streak / 3) + 1, 3); // Max x3
      const points = 100 * multiplier + (timeLeft * 10); // Bonus for fast answer
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
    
    setGameState('feedback');
  };

  const nextRound = () => {
    if (currentRound + 1 >= sessionData.length) {
      setGameState('end');
    } else {
      setCurrentRound(prev => prev + 1);
      setTimeLeft(TIME_LIMIT_SEC);
      setGameState('playing');
    }
  };

  // Renderers
  if (gameState === 'start') {
    return (
      <div className="game-pane pane">
        <div className="panel-bar"><span className="panel-title">// phish_hunter.exe</span></div>
        <div className="panel-body flex-center col">
          <h1 className="game-title">PHISH HUNTER</h1>
          <p className="game-subtitle">THREAT IDENTIFICATION SIMULATOR v1.0</p>
          <div className="game-rules">
            <p>1. Analyze the target (URL, Email, or SMS).</p>
            <p>2. Determine if it is LEGITIMATE or PHISHING.</p>
            <p>3. You have {TIME_LIMIT_SEC} seconds per target.</p>
            <p>4. Build a streak for multiplier bonuses.</p>
          </div>
          <button className="btn-primary game-btn-large" onClick={startGame}>INITIALIZE SIMULATION</button>
        </div>
      </div>
    );
  }

  if (gameState === 'end') {
    return (
      <div className="game-pane pane">
        <div className="panel-bar"><span className="panel-title">// phish_hunter_results.exe</span></div>
        <div className="panel-body flex-center col">
          <h1 className="game-title">SIMULATION COMPLETE</h1>
          <div className="final-score-box">
            <div className="score-label">FINAL SCORE</div>
            <div className="score-value">{score.toLocaleString()}</div>
          </div>
          <button className="btn-primary game-btn-large" onClick={startGame}>RESTART SIMULATION</button>
        </div>
      </div>
    );
  }

  const currentScenario = sessionData[currentRound];
  const multiplier = Math.min(Math.floor(streak / 3) + 1, 3);

  return (
    <div className="game-container">
      {/* Top HUD */}
      <div className="game-hud">
        <div className="hud-box">
          <span className="hud-label">SCORE</span>
          <span className="hud-value">{score.toLocaleString()}</span>
        </div>
        <div className="hud-box center">
          <span className="hud-label">TARGET</span>
          <span className="hud-value">{currentRound + 1} / {sessionData.length}</span>
        </div>
        <div className="hud-box right">
          <span className="hud-label">STREAK</span>
          <span className={`hud-value ${streak > 2 ? 'streak-hot' : ''}`}>x{multiplier} ({streak})</span>
        </div>
      </div>

      <div className={`game-pane pane ${gameState === 'feedback' ? (lastAnswerCorrect ? 'border-safe' : 'border-danger') : ''}`}>
        <div className="panel-bar">
          <span className="panel-title">// intercept_target_{currentScenario.type.toLowerCase()}</span>
          <div className="timer-bar-wrap">
            <div 
              className={`timer-bar-fill ${timeLeft <= 5 ? 'timer-danger' : ''}`} 
              style={{ width: `${(timeLeft / TIME_LIMIT_SEC) * 100}%` }} 
            />
          </div>
        </div>
        
        <div className="panel-body game-body">
          <div className="target-type">INTERCEPTED {currentScenario.type}</div>
          <div className="target-content">
            {currentScenario.content.split('\n').map((line, i) => <div key={i}>{line || <br/>}</div>)}
          </div>

          {gameState === 'playing' && (
            <div className="action-buttons">
              <button className="btn-legit" onClick={() => handleGuess(false)}>
                [ LEGITIMATE ]
              </button>
              <button className="btn-phish" onClick={() => handleGuess(true)}>
                [ PHISHING ]
              </button>
            </div>
          )}

          {gameState === 'feedback' && (
            <div className={`feedback-overlay ${lastAnswerCorrect ? 'correct' : 'incorrect'}`}>
              <h2 className="feedback-title">
                {lastAnswerCorrect ? 'THREAT ASSESSED CORRECTLY' : 'ASSESSMENT FAILED'}
              </h2>
              <div className="feedback-fact">
                <strong>ACTUAL STATUS:</strong> {currentScenario.isPhishing ? 'PHISHING' : 'LEGITIMATE'}
              </div>
              <p className="feedback-explanation">{currentScenario.explanation}</p>
              <button className="btn-primary" onClick={nextRound} style={{ marginTop: '20px' }}>
                PROCEED TO NEXT TARGET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
