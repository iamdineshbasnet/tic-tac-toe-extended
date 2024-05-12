const player = require('../model/player');

const getPlayer = async (req, res) => {
	try {
		const { username } = req.player;

		// find player with username in database
		const playerDetails = await player.findOne({ username });

		if (!playerDetails) {
			return res.status(404).json({ status: 'failed', message: `player not found` });
		}

		playerDetails.password = undefined

		res.status(200).json({ stauts: 'success', result: playerDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = { getPlayer };
