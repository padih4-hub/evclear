export default async function handler(request, context) {
  const url = new URL(request.url);
  
  if (!url.pathname.startsWith('/posts/')) {
    return context.next();
  }

  const slug = url.pathname.replace('/posts/', '').replace(/\/$/, '');
  
  try {
    const mdUrl = `${url.origin}/posts/${slug}.md`;
    const mdRes = await fetch(mdUrl);
    
    let title = 'EVClear';
    let excerpt = 'Australian EV news and buying guides';
    let imageUrl = '';

    if (mdRes.ok) {
      const text = await mdRes.text();
      const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const fm = frontmatterMatch[1];
        title = fm.match(/title:\s*"?([^"\n]+)"?/)?.[1] || title;
        excerpt = fm.match(/excerpt:\s*"?([^"\n]+)"?/)?.[1] || excerpt;
        const image = fm.match(/image:\s*"?([^"\n]+)"?/)?.[1] || '';
        imageUrl = image.startsWith('http') ? image : image ? `${url.origin}${image}` : '';
      }
    }

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
      status: response.status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });

  } catch (e) {
    return context.next();
  }
}

export const config = {
  path: '/posts/*',
};
