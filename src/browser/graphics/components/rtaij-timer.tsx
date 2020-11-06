import {BaseInfo} from './lib/base-info';
import {Timer} from '../../../nodecg/replicants';

const timerRep = nodecg.Replicant('timer');

const timerStateColorMap = {
	Stopped: '#9a9fa1',
	Running: '#ffffff',
	Finished: '#ffff52',
};

const calcColorFromTimeState = (timer: Timer) => {
	if (timer.timerState === 'Stopped') {
		return timerStateColorMap['Stopped'];
	}
	if (timer.timerState === 'Running') {
		return timerStateColorMap['Running'];
	}
	const allForfeit = timer.results.every((result) =>
		Boolean(result && result.forfeit),
	);
	if (allForfeit) {
		return timerStateColorMap['Stopped'];
	}
	return timerStateColorMap['Finished'];
};

export class RtaijTimer extends BaseInfo {
	public componentDidMount() {
		if (super.componentDidMount) {
			super.componentDidMount();
		}
		timerRep.on('change', this.timerChangeHandler);
	}

	public componentWillUnmount() {
		if (super.componentWillUnmount) {
			super.componentWillUnmount();
		}
		timerRep.removeListener('change', this.timerChangeHandler);
	}

	private readonly timerChangeHandler = (newVal: Timer) => {
		const color = calcColorFromTimeState(newVal);
		this.setState({
			primaryInfo: newVal.formatted,
			primaryInfoColor: color,
		});
	};
}
