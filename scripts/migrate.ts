import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';
import { v2 as cloudinary } from 'cloudinary';

// Manually load .env.local
async function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const content = await fs.readFile(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = trimmed.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
    console.log('Loaded environment variables from .env.local');
  } catch (err) {
    console.warn('.env.local not found or failed to parse, using existing process.env');
  }
}

async function run() {
  await loadEnv();

  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  const dbName = process.env.MONGODB_DB_NAME || 'glamlounge';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINSRY_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY || process.env.CLOUDINSRY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.COUDINARY_SECRET_KEY;

  if (!uri) {
    console.error('Error: MONGODB_URI or DATABASE_URL is not set.');
    process.exit(1);
  }
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Error: Cloudinary credentials are not set.');
    process.exit(1);
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  // Read content.json
  const contentPath = path.join(process.cwd(), 'src/data/content.json');
  let content: any;
  try {
    const rawContent = await fs.readFile(contentPath, 'utf8');
    content = JSON.parse(rawContent);
  } catch (error) {
    console.error(`Error reading content.json from ${contentPath}:`, error);
    process.exit(1);
  }

  console.log('Successfully read content.json. Starting migration...');

  // Helper function to upload a local image to Cloudinary
  async function migrateImage(imagePath: string, folder: string) {
    if (!imagePath || !imagePath.startsWith('/uploads/')) {
      return { url: imagePath, publicId: undefined };
    }
    const relativePath = imagePath.substring(1);
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    
    try {
      console.log(`Uploading ${imagePath} to Cloudinary under folder "glamlounge/${folder}"...`);
      const result = await cloudinary.uploader.upload(absolutePath, {
        folder: `glamlounge/${folder}`,
        overwrite: true,
        resource_type: 'image',
      });
      console.log(`  Uploaded! URL: ${result.secure_url}`);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (err) {
      console.error(`  Failed to upload ${imagePath}:`, err);
      // Return original path as fallback
      return { url: imagePath, publicId: undefined };
    }
  }

  // 1. Migrate homepage images
  if (content.homepage) {
    if (content.homepage.heroImage) {
      const { url, publicId } = await migrateImage(content.homepage.heroImage, 'homepage');
      content.homepage.heroImage = url;
      if (publicId) content.homepage.heroImagePublicId = publicId;
    }
    if (content.homepage.aboutImage) {
      const { url, publicId } = await migrateImage(content.homepage.aboutImage, 'homepage');
      content.homepage.aboutImage = url;
      if (publicId) content.homepage.aboutImagePublicId = publicId;
    }
  }

  // 2. Migrate Gul Arora photo
  if (content.gulArora) {
    if (content.gulArora.photo) {
      const { url, publicId } = await migrateImage(content.gulArora.photo, 'gul-arora');
      content.gulArora.photo = url;
      if (publicId) content.gulArora.photoPublicId = publicId;
    }
  }

  // 3. Migrate team images
  if (content.team && Array.isArray(content.team)) {
    for (const member of content.team) {
      if (member.image) {
        const { url, publicId } = await migrateImage(member.image, 'team');
        member.image = url;
        if (publicId) member.imagePublicId = publicId;
      }
    }
  }

  // 4. Migrate services images
  if (content.categories && Array.isArray(content.categories)) {
    for (const category of content.categories) {
      if (category.services && Array.isArray(category.services)) {
        for (const service of category.services) {
          if (service.image) {
            const { url, publicId } = await migrateImage(service.image, 'services');
            service.image = url;
            if (publicId) service.imagePublicId = publicId;
          }
        }
      }
    }
  }

  // 5. Migrate gallery images
  if (content.gallery && Array.isArray(content.gallery)) {
    for (const item of content.gallery) {
      if (item.image) {
        const { url, publicId } = await migrateImage(item.image, 'gallery');
        item.image = url;
        if (publicId) item.imagePublicId = publicId;
      }
    }
  }

  console.log('\nAll local images uploaded to Cloudinary. Connecting to MongoDB...');

  // Connect to MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

    // 1. Save singleton content document
    console.log('Writing content collection...');
    const siteContent = {
      _id: 'site',
      business: content.business || {},
      homepage: content.homepage || {},
      gulArora: content.gulArora || {},
      team: content.team || [],
      contact: content.contact || {},
      updatedAt: new Date().toISOString(),
    };
    await db.collection('content').replaceOne({ _id: 'site' as any }, siteContent, { upsert: true });

    // 2. Save categories collection
    if (content.categories && Array.isArray(content.categories)) {
      console.log('Writing categories collection...');
      await db.collection('categories').deleteMany({});
      const categoriesWithOrder = content.categories.map((cat: any, index: number) => ({
        ...cat,
        order: index,
      }));
      await db.collection('categories').insertMany(categoriesWithOrder);
    }

    // 3. Save gallery collection
    if (content.gallery && Array.isArray(content.gallery)) {
      console.log('Writing gallery collection...');
      await db.collection('gallery').deleteMany({});
      const galleryWithOrder = content.gallery.map((item: any, index: number) => ({
        ...item,
        order: index,
      }));
      await db.collection('gallery').insertMany(galleryWithOrder);
    }

    // 4. Save testimonials collection
    if (content.testimonials && Array.isArray(content.testimonials)) {
      console.log('Writing testimonials collection...');
      await db.collection('testimonials').deleteMany({});
      const testimonialsWithOrder = content.testimonials.map((item: any, index: number) => ({
        ...item,
        order: index,
      }));
      await db.collection('testimonials').insertMany(testimonialsWithOrder);
    }

    // 5. Save users collection
    if (content.auth) {
      console.log('Writing users collection...');
      await db.collection('users').updateOne(
        { username: 'admin' },
        {
          $set: {
            passwordHash: content.auth.passwordHash,
            updatedAt: content.auth.updatedAt || new Date().toISOString(),
          },
        },
        { upsert: true }
      );
    }

    console.log('\nMigration completed successfully!');
    console.log('--- Summary ---');
    console.log(`Content document: Written`);
    console.log(`Categories count: ${content.categories?.length || 0}`);
    console.log(`Gallery items count: ${content.gallery?.length || 0}`);
    console.log(`Testimonials count: ${content.testimonials?.length || 0}`);
    console.log(`Admin user: Seeded`);
    console.log('\nIMPORTANT REMINDER: Rotate the admin password via the Admin Dashboard soon.');

  } catch (error) {
    console.error('Database migration failed:', error);
  } finally {
    await client.close();
  }
}

run();
