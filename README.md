
# RetroRocket

A simple browser-based arcade game built with React. Dodge falling rockets and shoot them down to score points!

## Features
- Player movement and shooting
- Rockets fall from the top of the screen
- Score tracking and session high scores
- Sound effects for shooting, hits, and game over
- Pause and resume functionality
- **Rocket Facts:** Fun facts about rockets are fetched from Gemini API and displayed during gameplay.

## How to Play
- Use arrow keys or A/D to move left and right
- Press Spacebar to shoot bullets upward
- Avoid getting hit by rockets
- Shoot rockets to earn points
- Game ends when you are hit

## Rocket Facts Feature
- When the game is running, a new rocket fact is fetched every 10 seconds and displayed on the right side of the screen.
- Facts are generated using the Gemini API via a backend endpoint (`/rocket-fact`).
- Axios is used for API requests.

## Technologies Used
- React
- Axios
- Gemini API (via backend)
- CSS
