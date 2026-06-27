import clientPromise from './mongodb';

const DEFAULT_HASH = '$2a$12$UuTDd3J0W0ablxbSz6g2HOpe3levS.D49HLEnMBrgGtHFTdAN9DQG';

async function getDb() {
  const client = await clientPromise;
  return client.db(process.env.MONGODB_DB_NAME || 'glamlounge');
}

export async function readContent(): Promise<any> {
  try {
    const db = await getDb();
    
    // Fetch site singleton content
    const siteDoc = await db.collection('content').findOne({ _id: 'site' as any });
    
    // Fetch collections
    const categories = await db.collection('categories').find().sort({ order: 1 }).toArray();
    const gallery = await db.collection('gallery').find().sort({ order: 1 }).toArray();
    const testimonials = await db.collection('testimonials').find().sort({ order: 1 }).toArray();
    const adminUser = await db.collection('users').findOne({ username: 'admin' });

    // Clean up MongoDB _id field to avoid serialization issues in Next.js Server Components
    const cleanDoc = (doc: any) => {
      if (!doc) return doc;
      const { _id, ...rest } = doc;
      return rest;
    };

    const cleanArray = (arr: any[]) => {
      return (arr || []).map(item => cleanDoc(item));
    };

    return {
      business: siteDoc?.business || {},
      homepage: siteDoc?.homepage || {},
      gulArora: siteDoc?.gulArora || {},
      team: siteDoc?.team || [],
      contact: siteDoc?.contact || {},
      categories: cleanArray(categories),
      gallery: cleanArray(gallery),
      testimonials: cleanArray(testimonials),
      auth: {
        passwordHash: adminUser?.passwordHash || DEFAULT_HASH,
        updatedAt: adminUser?.updatedAt || new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error reading from MongoDB:', error);
    throw new Error('Failed to read database content.');
  }
}

export async function writeContent(content: any): Promise<void> {
  try {
    const db = await getDb();

    // 1. Update site content singleton
    const siteContent = {
      _id: 'site',
      business: content.business || {},
      homepage: content.homepage || {},
      gulArora: content.gulArora || {},
      team: content.team || [],
      contact: content.contact || {},
      updatedAt: new Date().toISOString()
    };
    await db.collection('content').replaceOne({ _id: 'site' as any }, siteContent, { upsert: true });

    // 2. Update categories
    if (content.categories && Array.isArray(content.categories)) {
      await db.collection('categories').deleteMany({});
      if (content.categories.length > 0) {
        const categoriesWithOrder = content.categories.map((cat: any, index: number) => {
          const { _id, ...cleanCat } = cat;
          return {
            ...cleanCat,
            order: index
          };
        });
        await db.collection('categories').insertMany(categoriesWithOrder);
      }
    }

    // 3. Update gallery
    if (content.gallery && Array.isArray(content.gallery)) {
      await db.collection('gallery').deleteMany({});
      if (content.gallery.length > 0) {
        const galleryWithOrder = content.gallery.map((item: any, index: number) => {
          const { _id, ...cleanItem } = item;
          return {
            ...cleanItem,
            order: index
          };
        });
        await db.collection('gallery').insertMany(galleryWithOrder);
      }
    }

    // 4. Update testimonials
    if (content.testimonials && Array.isArray(content.testimonials)) {
      await db.collection('testimonials').deleteMany({});
      if (content.testimonials.length > 0) {
        const testimonialsWithOrder = content.testimonials.map((item: any, index: number) => {
          const { _id, ...cleanItem } = item;
          return {
            ...cleanItem,
            order: index
          };
        });
        await db.collection('testimonials').insertMany(testimonialsWithOrder);
      }
    }

    // 5. Update auth/users
    if (content.auth) {
      await db.collection('users').updateOne(
        { username: 'admin' },
        {
          $set: {
            passwordHash: content.auth.passwordHash,
            updatedAt: content.auth.updatedAt || new Date().toISOString()
          }
        },
        { upsert: true }
      );
    }
  } catch (error) {
    console.error('Error writing to MongoDB:', error);
    throw new Error('Failed to save database content.');
  }
}
