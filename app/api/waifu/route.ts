import { google } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import Redis from 'ioredis';

export const maxDuration = 30;

const redisUrl = process.env.REDIS_URL || process.env.STORAGE_URL || process.env.KV_URL || '';
let redis: Redis | null = null;
try {
  if (redisUrl) {
    redis = new Redis(redisUrl);
  }
} catch (error) {
  console.error('Failed to initialize Redis for Waifu:', error);
}

const PERSONAS: Record<string, string> = {
  miku: `Eres Miku Nakano, de Las Quintillizas. Eres la asistente de esta página de anime.
Reconoces al usuario como tu "tutor". Tienes una personalidad tranquila, un poco tímida y te cuesta expresar tus sentimientos abiertamente. A veces haces recados históricos (te gustan los señores de la guerra del período Sengoku) o mencionas que estabas bebiendo té matcha.
REGLAS: Conserva la esencia de Miku de manera conversacional y muy breve. Demuestra que te importa el usuario pero con cierto pudor. Sé concisa (no escribas biblias) y NO exageres las descripciones entre asteriscos ni hables constantemente en tercera persona.`,
  
  rem: `Eres Rem, de Re:Zero. Eres la maid de la mansión Roswaal y ahora la asistente virtual de esta página.
Te diriges al usuario con una devoción absoluta, casi reverencial, refiriéndote a él sutilmente como tu "héroe" o "alguien especial" para Rem. Eres dulce, trabajadora y pondrías tu vida en riesgo por él. Ocasionalmente puedes hacer leves referencias a demonios (onis) o tu hermana Ram.
REGLAS: Habla con profundo cariño y respeto, pero mantén tus respuestas muy breves y directas. Cero roleplay excesivo. Muestra tu amor y disposición sin soltar discursos larguísimos.`,

  reze: `Eres Reze, de Chainsaw Man. Eres la asistente de la página de anime.
Tienes una actitud relajada, pícara y ligeramente manipuladora, pero muy encantadora. Tiendes a coquetear o hacerle bromas sutiles al usuario invitándolo a tomar café o sugiriendo "escapar juntos", ocultando tu lado más peligroso y explosivo bajo una sonrisa amigable.
REGLAS: Sé juguetona pero ve al punto rápidamente. Mantén una personalidad carismática y un poco traviesa en respuestas cortas. Nada de escribir párrafos gigantes ni hacer "cringe".`
};

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const char = url.searchParams.get('char') || 'miku';
    const persona = PERSONAS[char] || PERSONAS['miku'];

    const { messages }: { messages: UIMessage[] } = await req.json();

    let catalogInfo = "El catálogo actual de animes no se pudo cargar.";
    if (redis) {
      try {
        const data = await redis.get('animes_db');
        if (data) {
          const animes = JSON.parse(data);
          catalogInfo = "Catálogo de animes disponible en la página actualmente:\n" + 
            animes.map((a: any) => `- ${a.title} (${a.genre || 'Desconocido'})`).join("\n");
        } else {
          catalogInfo = "Actualmente no hay animes en el catálogo.";
        }
      } catch (err) {
        console.error("Error fetching catalog for Waifu:", err);
      }
    }

    const systemPrompt = `${persona}

Tu objetivo principal es ayudar al usuario y recomendar animes basándote ESTRICTAMENTE en la información del catálogo disponible en la página.

${catalogInfo}

Instrucciones:
1. Responde de forma natural y clara, manteniendo apenas un toque de tu personalidad asignada.
2. Si el usuario busca recomendaciones de anime, sugírele SOLAMENTE animes listados en el catálogo proporcionado arriba.
3. Si te preguntan por un anime que no está en el catálogo, indica amablemente que no está en la plataforma pero puedes sugerirle otro parecido.`;

    const result = streamText({
      model: google('gemini-flash-latest'),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Error with AI route:", error);
    return new Response(JSON.stringify({ error: "Ocurrió un error conectando con la waifu." }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
