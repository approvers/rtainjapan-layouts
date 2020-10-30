import delay from 'delay';
import React from 'react';
import styled, {css} from 'styled-components';

import {Tweet} from './lib/tweet';

import blueLogoR from '../images/logo/blue/index.png';
import brownLogoR from '../images/logo/brown/index.png';

const {colorTheme, hasSponsor} = nodecg.bundleConfig;

const logos = (() => {
	switch (colorTheme) {
		case undefined:
		case 'blue':
			return {
				logoR: blueLogoR,
			};
		case 'brown':
			return {
				logoR: brownLogoR,
			};
	}
})();

const LOGO_TRANSFORM_DURATION_SECONDS = 1;

const Container = styled.div`
	position: absolute;
	width: 1920px;
	height: 1080px;
	z-index: 0;
`;

const Top = styled.div`
	position: absolute;
	height: 150px;
	width: 100%;
	top: 0;
	background-color: rgba(0, 10, 60, 0.6);
	${({theme}) =>
		theme.isBreak &&
		css`
			background: none;
		`};
`;

const Bottom = styled.div`
	position: absolute;
	width: 100%;
	bottom: 0;
	background-color: rgba(0, 10, 60, 0.6);
`;

const LogoR = styled.img`
	position: absolute;
	z-index: 2;
`;

const Sponsor = styled.div`
	position: absolute;
	right: 0px;
	height: 100%;
	width: 210px;
	border-top-left-radius: 30px;
	background: url(https://i.imgur.com/w10XAGC.png) white no-repeat center;
	box-sizing: border-box;
	padding: 15px;

	display: grid;
	justify-items: center;
	align-items: center;
`;

interface State {
	logoR: string;
	logoRestTransformed: boolean;
}
interface Props {
	isBreak?: boolean;
	bottomHeightPx: number;
	TweetProps?: {
		widthPx?: number;
		leftAttached?: boolean;
		rowDirection?: boolean;
		hideLogo?: boolean;
		maxHeightPx?: number;
	};
}
export class RtaijOverlay extends React.Component<Props, State> {
	public state = {
		logoR: logos.logoR,
		logoRestTransformed: false,
	};

	public render() {
		return (
			<Container>
				<Top theme={{isBreak: this.props.isBreak}}>
					<LogoR src={this.state.logoR} />
				</Top>
				<Bottom style={{height: `${this.props.bottomHeightPx}px`}}>
					{hasSponsor && <Sponsor />}
				</Bottom>
				<Tweet
					{...this.props.TweetProps}
					beforeShowingTweet={
						this.props.TweetProps && this.props.TweetProps.hideLogo
							? this.beforeShowingTweet
							: undefined
					}
					afterShowingTweet={
						this.props.TweetProps && this.props.TweetProps.hideLogo
							? this.afterShowingTweet
							: undefined
					}
				/>
			</Container>
		);
	}

	private readonly beforeShowingTweet = async () => {
		this.setState({logoRestTransformed: true});
		await delay(LOGO_TRANSFORM_DURATION_SECONDS * 1000);
	};

	private readonly afterShowingTweet = async () => {
		this.setState({logoRestTransformed: false});
		await delay(LOGO_TRANSFORM_DURATION_SECONDS * 1000);
	};
}
