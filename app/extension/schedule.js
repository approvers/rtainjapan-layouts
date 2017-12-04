const path = require('path');
const request = require('superagent');
const clone = require('clone');

const defaultGameList = require(path.join(__dirname, 'default/game.json'));
const defaultRunnerList = require(path.join(__dirname, 'default/runner.json'));

module.exports = nodecg => {
	const horaroId = nodecg.bundleConfig.horaro.scheduleId;

	const scheduleRep = nodecg.Replicant('schedule');
	const horaroRep = nodecg.Replicant('horaro');
	const gameListRep = nodecg.Replicant('gameList', {defaultValue: defaultGameList});
	const runnerListRep = nodecg.Replicant('runnerList', {defaultValue: defaultRunnerList});
	const currentRunRep = nodecg.Replicant('currentRun');
	const nextRunRep = nodecg.Replicant('nextRun');

	let updateInterval;

	// Listen to schedule-related events
	nodecg.listenFor('nextRun', toNextRun);
	nodecg.listenFor('previousRun', toPreviousRun);
	nodecg.listenFor('specificRun', updateCurrentRun);
	nodecg.listenFor('manualUpdate', manuallyUpdateHoraroSchedule);

	// Listen to replicants changes and merge them into schedule replicant
	horaroRep.on('change', mergeSchedule);
	gameListRep.on('change', mergeSchedule);
	runnerListRep.on('change', mergeSchedule);

	// Update schedule from Horaro once NodeCG is launched
	if (horaroId) {
		updateHoraroSchedule();
		// Automatically update every 60 seconds
		updateInterval = setInterval(updateHoraroSchedule, 60 * 1000);
	} else {
		nodecg.log.warn(`Horaro schedule isn't provided. Schedule won't be updated.`);
	}

	/**
	 * Retrieves schedule from Horaro and updates schedule Replicant
	 */
	function updateHoraroSchedule() {
		const url = `https://horaro.org/-/api/v1/schedules/${horaroId}`;
		request.get(url).end((err, {body: {data: horaroSchedule}}) => {
			if (err) {
				nodecg.log.error('Couldn\'t update Horaro schedule');
			} else {
				// Update horaro schedule
				const indexOfPk = horaroSchedule.columns.indexOf('pk');
				horaroRep.value = horaroSchedule.items.map(({data, scheduled_t: scheduled}) => {
					return {
						pk: parseInt(data[indexOfPk], 10),
						scheduled: scheduled * 1000 // Convert to UNIX time
					};
				});
				nodecg.log.info(`Schedule updated from Horaro at ${new Date().toLocaleString()}`);
			}
		});
	}

	/**
	 * Manually updates Horaro schedule
	 */
	function manuallyUpdateHoraroSchedule() {
		updateHoraroSchedule();
		clearInterval(updateInterval);
		updateInterval = setInterval(updateHoraroSchedule, 60 * 1000);
	}

	/**
	 * Merges the schedule from Horaro and games list into one big schedule
	 */
	function mergeSchedule() {
		const gameList = gameListRep.value;
		const runnerList = runnerListRep.value;
		if (!horaroRep.value) {
			nodecg.log.info('Tried to merge schedule but Horaro schedule is empty.');
			return;
		}
		scheduleRep.value = horaroRep.value.map((horaro, index) => {
			const game = gameList.find(game => game.pk === horaro.pk);
			if (!game && horaro.pk !== -1) {
				nodecg.log.error(`Couldn't find the game ${horaro.pk}`);
			}
			const {pk, startsAt} = horaro;
			const {
				title = 'セットアップ',
				category,
				hardware,
				runnerPkAry = [],
				commentatorPkAry = []
			} = game ? game : {};
			const runners = runnerPkAry.map(runnerPk => {
				const runner = runnerList.find(runner => runner.runnerPk === runnerPk);
				if (!game) {
					nodecg.log.error(`Couldn't find the runner ${runnerPk}`);
				}
				return {
					name: runner.name,
					twitch: runner.twitch,
					nico: runner.nico,
					twitter: runner.twitter
				};
			});
			const commentators = commentatorPkAry.map(commentatorPk => {
				const runner = runnerList.find(runner => runner.runnerPk === commentatorPk);
				if (!game) {
					nodecg.log.error(`Couldn't find the runner ${commentatorPk}`);
				}
				return {
					name: runner.name,
					twitch: runner.twitch,
					nico: runner.nico,
					twitter: runner.twitter
				};
			});
			return {
				pk,
				index,
				startsAt,
				title,
				category,
				hardware,
				runners,
				commentators
			};
		});
	}

	/**
	 * Updates currentRun and nextRun Replicants, default is first run in the schedule
	 * @param {Number} index - Index of the current game in the schedule (Not the pk)
	 */
	function updateCurrentRun(index = 0) {
		currentRunRep.value = clone(scheduleRep.value[index]);
		nextRunRep.value = clone(scheduleRep.value[index + 1]);
	}

	/**
	 * Moves currentRun to next game
	 */
	function toNextRun() {
		updateCurrentRun(currentRunRep.value.index + 1);
	}

	/**
	 * Moves currentRun to previous game
	 */
	function toPreviousRun() {
		updateCurrentRun(currentRunRep.value.index - 1);
	}
};
