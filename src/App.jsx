import { useState } from "react"
import PomodoroClock from "./components/PomodoroClock"

function App() {
	const [onBreak, setOnBreak] = useState(false);

	return (
		<div className={`${onBreak ? 'bg-[#38858a]' : 'bg-[#ba4949]'} h-dvh antialiased text-[#FFFFFF] flex items-center transition-all`}>
			<PomodoroClock onBreak={onBreak} setOnBreak={setOnBreak}/>
		</div>
	)
}

export default App
