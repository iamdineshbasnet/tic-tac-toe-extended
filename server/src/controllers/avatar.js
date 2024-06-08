const { createAvatar } = require('@dicebear/avatars');
const bottts = require('@dicebear/avatars-bottts-sprites');
const sharp = require('sharp');
const fs = require('fs').promises;
const { join } = require('path');


const generateAvatar = async () => {
  const seeds = Array(20).fill('').map((_, index) => `Avatar-${index + 1}`);
  const VERSION = `/api/${process.env.VERSION}`;
  const seedData = await Promise.all(
    seeds.map(async (seed) => {
      try {
        const avatar = createAvatar(bottts, {
          seed,
          radius: 10,
          backgroundType: ['gradientLinear'],
          backgroundRotation: [0, 360, 10, 20, 350, 330],
          backgroundColor: ['b6e3f4', 'ffdfbf', 'd1d4f9', 'c0aede', 'ffd5dc'],
        });
        const svgString = avatar.toString();
        
        const pngBuffer = await sharp(Buffer.from(svgString))
          .png()
          .toBuffer();

        const directory = join(__dirname, '../avatars/bottts/');
        
        await fs.mkdir(directory, { recursive: true });

        // Save PNG buffer to file
        const filename = `${seed}.png`;
        const filepath = join(directory, filename);
        await fs.writeFile(filepath, pngBuffer);

        const imageUrl = `http://localhost:3000${VERSION}/avatars/bottts/${filename}`;
        return {
          name: seed,
          image: imageUrl
        };
      } catch (error) {
        console.error(`Error generating avatar for seed ${seed}:`, error);
        return error.message;
      }
    })
  );
  return seedData;
};

const generateAvatars = async (req, res) => {
  try {
    const seedData = await generateAvatar();
    res.json(seedData);
  } catch (error) {
    console.error('Error generating avatars:', error);
    res.status(500).json({ error: 'Error generating avatars' });
  }
};

module.exports = { generateAvatars };
