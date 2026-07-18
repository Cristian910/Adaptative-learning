# Backend proxy (opcional)

Este servidor **no es necesario** para correr la app — es la forma correcta de
manejar la key de OpenAI si algún día publicás el proyecto en internet, en vez
de dejarla puesta en el navegador (ver el aviso de seguridad en el README
principal).

## Cómo usarlo

```bash
cd server
npm init -y
npm install express cors
OPENAI_API_KEY=sk-tu-key-real node index.js
```

Esto levanta un servidor en `http://localhost:8787/ai`.

Después, en el proyecto principal (no acá adentro), en tu `.env.local`:

```
VITE_AI_PROXY_URL=http://localhost:8787/ai
```

Y reiniciá `npm run dev`. A partir de ahí, `aiService.ts` va a llamar a **tu**
servidor en vez de llamar a OpenAI directo desde el navegador — la key nunca
sale del servidor, así que ya no importa que alguien abra las herramientas de
desarrollador del navegador.

## Para producción real

Este `index.js` es un ejemplo mínimo para entender el patrón, no un servidor
listo para producción. Si vas a desplegar esto en serio, como mínimo agregá:

- **Rate limiting** por IP/usuario (para que nadie agote tu cuota de OpenAI).
- **CORS restringido** al dominio real de tu frontend (`cors({ origin: 'https://tu-dominio.com' })`), no abierto a cualquiera como está acá.
- **Logging/monitoreo** de uso y errores.
- Desplegarlo en algo administrado (Vercel Functions, Cloudflare Workers, Railway, etc.) en vez de correrlo a mano.
