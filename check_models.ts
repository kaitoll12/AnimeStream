import * as fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const keyMatch = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);

if (keyMatch) {
  let key = keyMatch[1].trim();
  if (key.startsWith('"')) key = key.slice(1, -1);
  if (key.startsWith("'")) key = key.slice(1, -1);
  
  fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + key)
    .then(r => r.json())
    .then(d => {
      if (d.error) console.error(d.error);
      else console.log(d.models?.map((m: any) => m.name).filter((n: string) => n.includes('gemini')));
    })
    .catch(console.error);
} else {
  console.error("Key not found");
}
