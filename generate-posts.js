const fs = require('fs');
const path = require('path');
 
const postsDir = path.join(__dirname, 'static/posts');
const outputFile = path.join(__dirname, 'static/posts.json');
 
function parseMetadata(content) {
  const lines = content.split('\n');
  const meta = {};
  let inFrontmatter = false;
  let bodyStart = 0;
 
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
      } else {
        bodyStart = i + 1;
        break;
      }
      continue;
    }
    if (inFrontmatter) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
        meta[key] = value;
      }
    }
  }
 
  return meta;
}
 
function slugFromFilename(filename) {
  return filename.replace(/\.md$/, '');
}
 
try {
  if (!fs.existsSync(postsDir)) {
    console.log('No posts directory found, creating empty posts.json');
    fs.writeFileSync(outputFile, '[]');
    process.exit(0);
  }
 
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
 
  const posts = files.map(filename => {
    const content = fs.readFileSync(path.join(postsDir, filename), 'utf8');
    const meta = parseMetadata(content);
    const slug = slugFromFilename(filename);
 
    return {
      slug,
      title: meta.title || slug,
      category: meta.category || 'General',
      excerpt: meta.excerpt || '',
      image: meta.image || '/images/ev-transport.jpg',
      readtime: meta.readtime || '5 min read',
      date: meta.date ? meta.date.split('T')[0] : slug.slice(0, 10)
    };
  });
 
  fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2));
  console.log(`Generated posts.json with ${posts.length} articles`);
} catch (err) {
  console.error('Error generating posts.json:', err);
  process.exit(1);
}
