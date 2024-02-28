import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from "./model/Game.ts";
import aStar from "./pathfinding/AStar.ts";

function App() {
	const [count, setCount] = useState(0)

	const game = new Game()

	// game.executeMove({newX: 4, newY: 0})
	// game.executeMove({newX: 4, newY: 1})
	// game.executeMove({newX: 4, newY: 1})
	game.executeMove({position: "00v", removedWalls: []})
	game.executeMove({position: "11v", removedWalls: []})
	game.executeMove({position: "22v", removedWalls: []})
	game.executeMove({position: "33v", removedWalls: []})
	game.executeMove({position: "44v", removedWalls: []})
	game.executeMove({position: "55v", removedWalls: []})
	game.executeMove({position: "66v", removedWalls: []})
	game.executeMove({position: "77v", removedWalls: []})
	// console.log(game.showGameState())
	// game.undoLastMove()
	// console.log(game.showGameState())
	// console.log(game)
	// console.log(game.possiblePlayerMoves())
	const startTime = performance.now()
	aStar({x:0,y:0}, {x:8,y:8}, game)
	const endTime = performance.now()
	console.log(`Call took ${endTime - startTime} milliseconds`)

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={() => setCount(prev => prev + 1)}>
          count is {count}
				</button>
				<p>
          Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
        Click on the Vite and React logos to learn more
			</p>
		</>
	)
}

export default App
