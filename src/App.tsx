import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from "./model/Game.ts";

import jps from "./pathfinding/JPS.ts";
import aStar from "./pathfinding/AStar.ts";

function App() {
	const [count, setCount] = useState(0)

	const game = new Game()

	// game.executeMove({newPosition: {x: 5, y: 4}})
	// game.executeMove({newPosition: {x: 4, y: 4}})
	// game.executeMove({position: "11v", removedWalls: []})
	// game.executeMove({position: "21h", removedWalls: []})
	// game.executeMove({position: "07v", removedWalls: []})
	// game.executeMove({position: "16v", removedWalls: []})
	// game.executeMove({position: "32v", removedWalls: []})
	// game.executeMove({position: "42v", removedWalls: []})
	// game.executeMove({position: "52h", removedWalls: []})
	// game.executeMove({position: "03h", removedWalls: []})
	// game.executeMove({position: "23h", removedWalls: []})
	// game.executeMove({position: "63h", removedWalls: []})
	// game.executeMove({position: "14h", removedWalls: []})
	// game.executeMove({position: "54h", removedWalls: []})
	// game.executeMove({position: "74h", removedWalls: []})
	// game.executeMove({position: "25h", removedWalls: []})
	// game.executeMove({position: "35v", removedWalls: []})
	// game.executeMove({position: "45v", removedWalls: []})
	// game.executeMove({position: "70v", removedWalls: []})
	// game.executeMove({position: "61v", removedWalls: []})
	// game.executeMove({position: "65h", removedWalls: []})
	// game.executeMove({position: "66v", removedWalls: []})

	//console.log(game.showGameState())
	game.executeMove({position: "47h", removedWalls: []})
	console.log(game.showGameState())

	const startTime = performance.now()
	console.log(jps({x:4,y:8}, {x:3,y:0}, game))
	const endTime = performance.now()
	console.log(`aStar took ${endTime - startTime} milliseconds`)

	const startTime2 = performance.now()
	console.log(aStar({x:4,y:8}, {x:3,y:0}, game))
	const endTime2 = performance.now()
	console.log(`JPS took ${endTime2 - startTime2} milliseconds`)

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
