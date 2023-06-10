import * as path from 'node:path';
import * as fs from 'node:fs/promises';

export async function loadAppConfig() {
  // Construct an absolute path to the config file.
  const filePath = path.resolve('./config.json');
  // Read the file contents.
  const text = await fs.readFile(filePath, 'utf-8');

  // Parse the file contents as JSON.
  let config;
  try {
    config = JSON.parse(text);
  } catch (err) {
    // Could not parse the config file as JSON.
    throw new Error(`Could not parse config file "${filePath}" as JSON.`);
  }

  // Successfully loaded the config file.
  return config;
}
