export default async function handler(request, context) {
  const url = new URL(request.url);
  
  if (!url.pathname.startsWith('/posts/')) {
    return context.next();
  }

  const slug = url.pathname.replace('/posts/', '').replace(/\/$/, '');
  
  try {
    const mdUrl = new URL(`/posts/${slug}.md`, url.origin);
    const mdRes = await fetch(mdUrl.toString());
    
    if (!mdRes.ok) return context.next();
    
    const text = await mdRes.text();
    const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return context.next();
    
    const frontmatter = frontmatterMatch[1];
    const title = frontmatter.match(/title:\s*"?([^"\n]+)"?/)?.[1] || 'EVClear';
    const excerpt = frontmatter.match(/excerpt:\s*"?([^"\n]+)"?/)?.[1] || 'Australian EV news and buying guides';
    const image = frontmatter.match(/image:\s*"?([^"\n]+)"?/)?.[1] || '';
    const imageUrl = image.startsWith('http') ? image : `${url.origin}${image}`;

    const response = await context.next();
    const html = await response.text();

    const injected = html.replace(
      '<title>EVClear — Article</title>',
      `<title>${title} — EVClear</title>
<meta property="og:title" content="${title} — EVClear">
<meta property="og:description" content="${excerpt}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:type" content="article">
<meta property="og:url" content="${url.href}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title} — EVClear">
<meta name="twitter:description" content="${excerpt}">
<meta name="twitter:image" content="${imageUrl}">`
    );

    return new Response(injected, {
      headers: { 'content-type': 'text/html' },
    });

  } catch (e) {
    return context.next();
  }
}

export const config = {
  path: '/posts/*',
};
