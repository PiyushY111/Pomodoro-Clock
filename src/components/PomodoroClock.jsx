import React, { useEffect, useRef, useState } from 'react'
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDown } from "react-icons/fa";
import { VscDebugStart } from "react-icons/vsc";
import { VscDebugStop } from "react-icons/vsc";
import { VscDebugRestart } from "react-icons/vsc";
import './styles.css';

function PomodoroClock(props) {

	const [sessionLength, setSessionLength] = useState(1500);
	const [breakLength, setBreakLength] = useState(300);
	const [timeLeft, setTimeLeft] = useState(sessionLength);
	const [timerState, setTimerState] = useState('stopped');
	const [timerType, setTimerType] = useState('session');
	const [sessionCount, setSessionCount] = useState(0);
	const timerRef = useRef(null);
	const audioRef = useRef(null);

	const decrementBreak = () => setBreakLength((prev) => {
		const newValue = prev > 60 ? prev - 60 : prev;

		if (timerType === 'break')
			setTimeLeft(newValue);

		return newValue;
	});

	const incrementBreak = () => setBreakLength((prev) => {
		const newValue = prev < 3600 ? prev + 60 : prev;

		if (timerType === 'break')
			setTimeLeft(newValue);

		return newValue;
	});

	const decrementSession = () => setSessionLength((prev) => {
		const newValue = prev > 60 ? prev - 60 : prev;

		if (timerType === 'session')
			setTimeLeft(newValue);

		return newValue;
	});

	const incrementSession = () => setSessionLength((prev) => {
		const newValue = prev < 3600 ? prev + 60 : prev;

		if (timerType === 'session')
			setTimeLeft(newValue);

		return newValue;
	});

	// Set audio element reference
	useEffect(() => {
		const title = document.getElementById('title');
		title.innerHTML = `${formatTime(timeLeft)} [${timerType.charAt(0).toUpperCase() + timerType.slice(1)}] - Pomodoro Clock`; 
		if (audioRef.current) return;
		audioRef.current = document.getElementById('beep');
	})

	// Update background color on parent when timer type changes
	useEffect(() => {
		props.setOnBreak(timerType === "break");		
	}, [props, timerType])

	// If time equals 00:00, play beep, change timer type and set time left based on type.
	useEffect(() => {
		if (timeLeft === 0) {
			playBeep();

			setSessionCount((prev) => timerType === "session" ? prev + 1 : prev);
			setTimeout(() => {
				setTimerType(timerType === "session"? "break" : "session");
				setTimeLeft(timerType === "session"? breakLength : sessionLength);
				startTimer();
			}, 2000);
		}
	}, [breakLength, sessionLength, timerType, timeLeft]);

	// Format time display from seconds to mm:ss
	const formatTime = (timeInSec) => {
		const minutes = Math.floor(timeInSec / 60);
		const seconds = timeInSec % 60;

		return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}

	// Play beep sound when clock reaches 00:00
	const playBeep = () => {
		const audio = new Audio('/sounds/BeepSound.mp3');
		audio.volume = 1.0;
		audio.muted = false;

		audio.load();
		audio.play().then(() => {
			setTimeout(() => {
				audio.pause();
				audio.currentTime = 0;
			}, 2000);
        })
        .catch(err => {
          console.info(err)
        });
	}

	// Start timer on button click
	const startTimer = () => {
		if (timerRef.current) return;

		setTimerState('running');
		timerRef.current = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1)
				{
					clearIntervalRef();
					return 0;
				}
				return prev - 1;
			});
		}, 1000)
	}

	const stopTimer = () => {
		if (timerRef.current) {
			clearIntervalRef();
		}
	};

	const clearIntervalRef = () => {
		clearInterval(timerRef.current);
		timerRef.current = null;
		setTimerState("stopped");
	}

	const resetTimer = () => {
		if (timerRef.current) {
			clearInterval(timerRef.current);
			timerRef.current = null;
		}
		setTimerState('stopped');
		setSessionLength(1500);
		setTimeLeft(1500);
		setBreakLength(300);
	}

	return (
		<div className={`${props.onBreak ? 'bg-[#4c9196]' : 'bg-[#c15c5c]'} container lg:mx-auto max-w-lg p-4 rounded-md mx-2`}>
			<div className='flex justify-between'>
				<div className='flex items-center flex-col'>
					<p id="break-label" className='select-none'>
						Break Length
					</p>
					<div className='flex items-center justify-center gap-2 cursor-pointer'>
						<button id='break-decrement' className='incDecButtons' type='button' disabled={timerState === 'running'} onClick={decrementBreak}>
							<FaArrowDown />
						</button>
						<p id='break-length' className='text-4xl select-none'>
							{formatTime(breakLength)}
						</p>
						<button id='break-increment' className='incDecButtons' type='button' disabled={timerState === 'running'} onClick={incrementBreak}>
							<FaArrowUp />
						</button>
					</div>
				</div>
				<div className='flex items-center flex-col'>
					<p id="session-label" className='select-none'>
						Session Length
					</p>
					<div className='flex items-center gap-2'>
						<button id='session-decrement' className='incDecButtons' type='button' disabled={timerState === 'running'} onClick={decrementSession}>
							<FaArrowDown />
						</button>
						<p id='session-length' className='text-4xl select-none'>
							{formatTime(sessionLength)}
						</p>
						<button id='session-increment' className='incDecButtons' type='button' disabled={timerState === 'running'} onClick={incrementSession}>
							<FaArrowUp />
						</button>
					</div>
				</div>
			</div>
			<div className='flex flex-col items-center gap-6 mt-6 lg:mt-0'>
				<div>
					<p id='timer-label' className='text-xl lg:text-4xl text-center select-none'>
						{timerType === 'session' ?
							"Session"
							:
							"Break"
						}
					</p>
					<p id='time-left' className='text-6xl lg:text-9xl font-bold select-none'>
						{formatTime(timeLeft)}
					</p>
				</div>
				<div className='flex gap-2'>
					<button id="start_stop" type='button' className='startRestartButtons' onClick={() => timerState === 'running' ? stopTimer() : startTimer()}>
						{timerState === 'stopped' ?
							<VscDebugStart className={`${props.onBreak ? 'text-[#4c9196]' : 'text-[#c15c5c]'} text-3xl`} />
							:
							<VscDebugStop className={`${props.onBreak ? 'text-[#4c9196]' : 'text-[#c15c5c]'} text-3xl`} />
						}
					</button>

					<button id="reset" type='button' className='startRestartButtons' onClick={resetTimer}>
						<VscDebugRestart className={`${props.onBreak ? 'text-[#4c9196]' : 'text-[#c15c5c]'} text-3xl`} />
					</button>
				</div>
			</div>
			<p className='mt-4 text-center tracking-tight'>
				Complete sessions: {sessionCount}
			</p>
		</div>
	)
}

export default PomodoroClock