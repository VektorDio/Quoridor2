import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Game from "./model/Game.ts";

function App() {
	const [count, setCount] = useState(0)

	const game = new Game()
	game.initializeEdges()
	game.initializeWalls()

	//console.log(game)
	// try {
	// 	game.executeMove({position: "31h", removedWalls: []})
	// } catch (e) {
	// 	// @ts-ignore
	// 	console.log(e.message)
	// }

	//game.executeMove({newX: 4, newY: 0})
	//game.executeMove({newX: 4, newY: 1})
	//game.executeMove({newX: 4, newY: 1})
	//game.executeMove({position: "30v", removedWalls: []})
	//game.executeMove({position: "40v", removedWalls: []})
	//game.executeMove({position: "41h", removedWalls: []})
	// console.log(game.showGameState())
	// game.undoLastMove()
	//console.log(game.showGameState())
	//console.log(game)
	//console.log(game.generatePossibleMoves())

	//console.log(`Call took ${endTime - startTime} milliseconds`)

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
