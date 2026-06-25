import fs from 'fs/promises';
import path from 'path';

const contentFilePath = path.join(process.cwd(), 'src/data/content.json');

export async function readContent(): Promise<any> {
  try {
    const fileContent = await fs.readFile(contentFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading content file:', error);
    throw new Error('Failed to read website content.');
  }
}

export async function writeContent(content: any): Promise<void> {
  try {
    await fs.writeFile(contentFilePath, JSON.stringify(content, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing content file:', error);
    throw new Error('Failed to save website content.');
  }
}
