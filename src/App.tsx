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
	const node = {x: 8, y: 8}
	console.log({
		up: game.getTopEdge(node.x, node.y),
		right: game.getRightEdge(node.x, node.y),
		left: game.getLeftEdge(node.x, node.y),
		down: game.getBottomEdge(node.x, node.y)
	})
	//game.executeMove({position: "00v"})

	//console.log(game)

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
