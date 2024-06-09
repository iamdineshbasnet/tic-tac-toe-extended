const player = require('../model/player');

const getPlayer = async (req, res) => {
	try {
		const { username } = req.player;

		// find player with username in database
		const playerDetails = await player.findOne({ username });

		if (!playerDetails) {
			return res.status(404).json({ status: 'failed', message: `player not found` });
		}

		playerDetails.password = undefined;

		res.status(200).json({ stauts: 'success', result: playerDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

const updatePlayer = async (req, res) => {
	try {
		const { name, image } = req.body;
		const { username } = req.player;

		const playerDetails = await player.findOne({ username });

		if (!playerDetails) {
			return res.status(404).json({ status: 'failed', message: 'player not found' });
		}

		if (name) playerDetails.name = name;
		if (image) playerDetails.image = image;

		await playerDetails.save();

		playerDetails.password = undefined;
		res.status(200).json({ status: 'success', result: playerDetails });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

const deletePlayer = async (req, res) => {
	try {
		const { username } = req.player;
		const playerDetails = await player.findOneAndDelete({ username });

		if (!playerDetails) {
			return res.status(404).json({ status: 'failed', message: 'Player not found' });
		}

		res.status(200).json({ status: 'success', message: 'Player deleted successfully' });
	} catch (error) {
		res.status(500).json({ status: 'error', message: error.message });
	}
};

module.exports = { getPlayer, updatePlayer, deletePlayer };
