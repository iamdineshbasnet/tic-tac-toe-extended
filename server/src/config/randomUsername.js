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

module.exports = { generateRandomUsername };