function generateRandomUsername() {
	const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let randomUsername = '';

	// Generate 16 random alphanumeric characters
	for (let i = 0; i < 16; i++) {
		const randomIndex = Math.floor(Math.random() * alphanumeric.length);
		randomUsername += alphanumeric[randomIndex];
	}

  // Append '@ultimate.com'
  randomUsername += '@ultimate.com';
  return randomUsername
}

// generate a random 6-digit number
function generateRoomId() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


module.exports = { generateRandomUsername, generateRoomId };