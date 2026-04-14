const fs = require('fs');

function unescapeFile({ path }) {
  let content = fs.readFileSync(path, 'utf8');
  content = content.replace(/\\\$/g, '$').replace(/\\\`/g, '`');
  fs.writeFileSync(path, content);
}

unescapeFile({ path: 'app/api/waifu/route.ts' });
unescapeFile({ path: 'components/miku-chat.tsx' });
