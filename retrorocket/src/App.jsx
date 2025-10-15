import React, { useState, useEffect, useRef, useCallback } from "react";
import "./styles.css";
import rocketImg from "./assets/rocket.png";
import playerImg from "./assets/player.png";
import shootSound from "./assets/shoot.mp3";
import hitSound from "./assets/hit.mp3";
import score20Sound from "./assets/score20.mp3";
import gameOverSound from "./assets/gameover.mp3";

const GRID_WIDTH = 800;
const GRID_HEIGHT = 600;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const BULLET_WIDTH = 5;
const BULLET_HEIGHT = 20;
const ROCKET_WIDTH = 40;
const ROCKET_HEIGHT = 40;
const BULLET_COOLDOWN = 300;

function App() {
  const [playerX, setPlayerX] = useState(GRID_WIDTH / 2 - PLAYER_WIDTH / 2);
  const [bullets, setBullets] = useState([]);
  const [rockets, setRockets] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [sessionScores, setSessionScores] = useState([]);
  const [gameState, setGameState] = useState("pre-game"); 

  const rocketSpeedRef = useRef(1);
  const lastShotTimeRef = useRef(0);

  const playSound = (src) => {
    try {
      const sound = new Audio(src); 
      sound.volume = 0.5;
      sound.play().catch((err) => console.warn("Audio play blocked:", err));
    } catch (err) {
      console.error("Audio error:", err);
    }
  };

  const shootBullet = useCallback(() => {
    const now = Date.now();
    if (now - lastShotTimeRef.current > BULLET_COOLDOWN) {
      playSound(shootSound);
      setBullets((prev) => [
        ...prev,
        { x: playerX + PLAYER_WIDTH / 2 - BULLET_WIDTH / 2, y: GRID_HEIGHT - PLAYER_HEIGHT },
      ]);
      lastShotTimeRef.current = now;
    }
  }, [playerX]);

  const handleKeyDown = useCallback(
    (e) => {
      if (gameState !== "running") return;

      if (e.key.toLowerCase() === "p") {
        setPaused((prev) => !prev);
      }
      if (paused) return;

      if (e.key === "ArrowLeft") setPlayerX((prev) => Math.max(prev - 20, 0));
      if (e.key === "ArrowRight") setPlayerX((prev) => Math.min(prev + 20, GRID_WIDTH - PLAYER_WIDTH));
      if (e.key === " ") shootBullet();
    },
    [gameState, paused, shootBullet]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (paused || gameState !== "running") return;

    const loop = setInterval(() => {
      setBullets((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - 10 }))
          .filter((b) => b.y > -BULLET_HEIGHT)
      );
      setRockets((prev) => prev.map((r) => ({ ...r, y: r.y + rocketSpeedRef.current * 2 })));
    }, 50);

    return () => clearInterval(loop);
  }, [paused, gameState]);

  useEffect(() => {
    if (paused || gameState !== "running") return;

    const rocketGenerator = setInterval(() => {
      setRockets((prev) => [...prev, { x: Math.random() * (GRID_WIDTH - ROCKET_WIDTH), y: -ROCKET_HEIGHT }]);
    }, 2000 / rocketSpeedRef.current);

    return () => clearInterval(rocketGenerator);
  }, [paused, gameState]);

  useEffect(() => {
    if (paused || gameState !== "running") return;

    const remainingRockets = [...rockets];
    const remainingBullets = [];
    let scoreGained = 0;

    bullets.forEach((bullet) => {
      let bulletHit = false;
      for (let i = remainingRockets.length - 1; i >= 0; i--) {
        const rocket = remainingRockets[i];
        if (
          bullet.x < rocket.x + ROCKET_WIDTH &&
          bullet.x + BULLET_WIDTH > rocket.x &&
          bullet.y < rocket.y + ROCKET_HEIGHT &&
          bullet.y + BULLET_HEIGHT > rocket.y
        ) {
          playSound(hitSound);
          remainingRockets.splice(i, 1);
          scoreGained++;
          bulletHit = true;
          break;
        }
      }
      if (!bulletHit) remainingBullets.push(bullet);
    });

    if (scoreGained > 0) {
      setScore((prev) => {
        const newScore = prev + scoreGained;
        if (Math.floor(newScore / 20) > Math.floor(prev / 20)) playSound(score20Sound);
        rocketSpeedRef.current = 1 + newScore / 20;
        return newScore;
      });
      setBullets(remainingBullets);
      setRockets(remainingRockets);
    }
  }, [bullets, rockets, paused, gameState]);

  useEffect(() => {
    if (gameState !== "running") return;
    rockets.forEach((r) => {
      if (r.y + ROCKET_HEIGHT >= GRID_HEIGHT) {
        playSound(gameOverSound);
        setGameState("game-over");
        setSessionScores((prev) => [score, ...prev]);
      }
    });
  }, [rockets, score, gameState]);

  const startGame = () => {
    setRockets([]);
    setBullets([]);
    setScore(0);
    setPaused(false);
    rocketSpeedRef.current = 1;
    setPlayerX(GRID_WIDTH / 2 - PLAYER_WIDTH / 2);
    setGameState("running");
  };

  return (
    <div className="game-wrapper">
      <h1>Rocket Shooter Retro</h1>
      <h2>Score: {score}</h2>
      <div className="game-area" style={{ width: GRID_WIDTH, height: GRID_HEIGHT }}>
        {gameState !== "pre-game" && (
          <>
            {rockets.map((r, idx) => (
              <img key={idx} src={rocketImg} alt="rocket" className="rocket" style={{ left: r.x, top: r.y }} />
            ))}
            {bullets.map((b, idx) => (
              <div key={idx} className="bullet" style={{ left: b.x, top: b.y }} />
            ))}
            {gameState === "running" && <img src={playerImg} alt="player" className="player" style={{ left: playerX, bottom: 0 }} />}
          </>
        )}

        {gameState === "pre-game" && (
          <div className="gameover-card">
            <h2>Welcome!</h2>
            <p>Arrow Keys → Move | Space → Shoot | P → Pause</p>
            <button onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameState === "game-over" && (
          <div className="gameover-card">
            <h2>!             Game Over          !</h2>
            <h2>             GG      </h2>
            <p>Your Score: {score}</p>
            <button onClick={startGame}>Restart</button>
          </div>
        )}
      </div>

      <div className="scoreboard">
        <h3>Session Scores</h3>
        <ul>
          {sessionScores.map((s, i) => (
            <li key={i}>Game {sessionScores.length - i}: {s}</li>
          ))}
        </ul>
      </div>

      {paused && gameState === "running" && <div className="paused-overlay">⏸ Paused ⏸</div>}
    </div>
  );
}
export default App;
