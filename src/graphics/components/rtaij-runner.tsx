import React from 'react';
import runnerIcon from '../images/icon/runner.png';
import {CurrentRun} from '../../../types/schemas/currentRun';
import {BaseNameplate} from './lib/base-nameplate';
import styled from '../../../node_modules/styled-components';

const FinishTime = styled.div`
	position: absolute;
	right: 15px;
	bottom: 8px;
	color: #ffff52;
	opacity: 0;
	transition: opacity 0.33s linear;
	font-size: 30px;
`;

export class RtaijRunner extends BaseNameplate {
	applyCurrentRunChangeToState = (newVal: CurrentRun) => {
		this.setState({
			runners: newVal.runners,
		});
	};
	iconPath = runnerIcon;
	rootId = 'runner';
	label = 'Runner';

	render() {
		const Container = this.Container;
		return (
			<Container>
				<FinishTime>finish time</FinishTime>
			</Container>
		);
	}
}
