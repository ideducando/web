// Pruebas de Mi mochila: npm test.
// Desde el 27/11/2026 es un solo correo: el material, las gracias, compartir, las redes y el boletín.
// No mandan ningún correo: el catálogo de la web y Brevo se sustituyen por respuestas de mentira.
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import mochila from '../functions/mochila.mjs';
import { correoMaterial } from '../lib/correos.mjs';
import { comprobar } from '../lib/firma.mjs';

const WEB = 'https://www.ideducando.es';
const CATALOGO = [
  {
    id: 'rincon-de-la-calma',
    titulo: 'Rincón de la calma: termómetro de emociones',
    tipo: 'Tableros y agendas',
    ficha: '/material-gratuito/rincon-de-la-calma/',
    archivo: '/descargas/rincon-de-la-calma.pdf',
    detalle: 'PDF, 1 MB, 11 páginas',
    montaje: true,
  },
  {
    id: 'derechos-infancia',
    titulo: 'Derechos de la infancia en lectura fácil',
    tipo: 'Cuentos',
    ficha: '/material-gratuito/derechos-infancia/',
    archivo: '/descargas/derechos-infancia.pdf',
    detalle: 'PDF, 2 MB, 20 páginas',
    montaje: false,
  },
];

/** El código del botón del boletín: lo que va detrás de «?t=» en el enlace a /boletin/confirmar/. */
const codigoDelBoton = (html) => html.match(/\/boletin\/confirmar\/\?t=([\w.-]+)/)?.[1];

describe('Mi mochila: un solo correo', () => {
  const fetchDeVerdad = globalThis.fetch;
  const claveDeVerdad = process.env.BREVO_API_KEY;
  let enviados;
  let enLaLista;

  before(() => {
    process.env.BREVO_API_KEY = 'clave-de-prueba';
    globalThis.fetch = async (url, opciones = {}) => {
      const direccion = String(url);
      if (direccion === `${WEB}/datos/mochila.json`) return new Response(JSON.stringify(CATALOGO));
      if (direccion.startsWith('https://api.brevo.com/v3/smtp/statistics/events')) {
        return new Response(JSON.stringify({ events: [] }));
      }
      if (direccion.startsWith('https://api.brevo.com/v3/contacts/')) {
        return enLaLista
          ? new Response(JSON.stringify({ listIds: [3], emailBlacklisted: false }))
          : new Response(JSON.stringify({ code: 'document_not_found' }), { status: 404 });
      }
      if (direccion === 'https://api.brevo.com/v3/smtp/email') {
        enviados.push(JSON.parse(opciones.body));
        return new Response(JSON.stringify({ messageId: '<prueba@brevo>' }), { status: 201 });
      }
      throw new Error(`Petición inesperada en la prueba: ${direccion}`);
    };
  });

  after(() => {
    globalThis.fetch = fetchDeVerdad;
    if (claveDeVerdad === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = claveDeVerdad;
  });

  const pedir = async (datos = {}, { yaApuntada = false } = {}) => {
    enviados = [];
    enLaLista = yaApuntada;
    const respuesta = await mochila(
      new Request(`${WEB}/api/mochila`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', origin: WEB },
        body: new URLSearchParams({
          correo: 'lucia@ejemplo.es',
          nombre: 'Lucía',
          privacidad: 'si',
          materiales: 'rincon-de-la-calma',
          ...datos,
        }).toString(),
      }),
    );
    return { estado: respuesta.status, cuerpo: await respuesta.json() };
  };

  test('con la casilla marcada: un correo, con el botón para confirmar el boletín', async () => {
    const { cuerpo } = await pedir({ boletin: 'si' });
    assert.deepEqual(cuerpo, { enviado: true, boletin: 'enviado' });
    assert.equal(enviados.length, 1, 'ya no se manda un segundo correo para confirmar');
    const [correo] = enviados;
    assert.deepEqual(correo.tags, ['mochila']);
    assert.ok(correo.htmlContent.includes('Sí, confirmo el boletín'));
    assert.deepEqual(comprobar(codigoDelBoton(correo.htmlContent)), { correo: 'lucia@ejemplo.es', nombre: 'Lucía' });
    assert.ok(correo.textContent.includes('/boletin/confirmar/?t='));
  });

  test('sin la casilla: un correo con la invitación al boletín, sin apuntar a nadie', async () => {
    const { cuerpo } = await pedir();
    assert.deepEqual(cuerpo, { enviado: true, boletin: 'no' });
    assert.equal(enviados.length, 1);
    const [correo] = enviados;
    assert.ok(correo.htmlContent.includes('Quiero el boletín'));
    assert.ok(correo.htmlContent.includes('Solo te apuntamos si pulsas el botón'));
    assert.equal(comprobar(codigoDelBoton(correo.htmlContent))?.correo, 'lucia@ejemplo.es');
  });

  test('si ya está en el boletín, no se le invita otra vez', async () => {
    const { cuerpo } = await pedir({ boletin: 'si' }, { yaApuntada: true });
    assert.deepEqual(cuerpo, { enviado: true, boletin: 'ya' });
    const [correo] = enviados;
    assert.ok(!correo.htmlContent.includes('/boletin/confirmar/'));
    assert.ok(correo.htmlContent.includes('Ya recibes nuestro boletín'));
  });

  test('las gracias, compartir, las redes, las estrellas y pedirlo montado', async () => {
    await pedir();
    const { htmlContent: html, textContent: texto } = enviados[0];
    assert.ok(html.includes('¡Gracias por confiar en IdEducando!'));
    const ficha = encodeURIComponent(`${WEB}/material-gratuito/rincon-de-la-calma/`);
    assert.ok(html.includes(`https://wa.me/?text=`) && html.includes(ficha), 'WhatsApp lleva a la ficha, no al PDF');
    assert.ok(html.includes('https://www.instagram.com/ideducando/'));
    assert.ok(html.includes('https://www.pinterest.com/ideducando/'));
    assert.ok(html.includes(`${WEB}/material-gratuito/rincon-de-la-calma/#valorar`));
    assert.ok(html.includes('puedes pedirlo montado'));
    for (const trozo of ['¡Gracias por confiar en IdEducando!', 'Compártelo por WhatsApp', '#valorar', 'Quiero el boletín']) {
      assert.ok(texto.includes(trozo), `la versión en texto lleva «${trozo}»`);
    }
  });
});

describe('el correo del material, por dentro', () => {
  const material = (cambios = {}) => ({ ...CATALOGO[0], ...cambios });

  test('con varios materiales, WhatsApp lleva al catálogo', () => {
    const correo = correoMaterial({
      base: WEB,
      correo: 'lucia@ejemplo.es',
      nombre: '',
      materiales: CATALOGO,
      boletin: { estado: 'ya', enlace: '' },
    });
    assert.ok(correo.htmlContent.includes(encodeURIComponent(`${WEB}/material-gratuito/`)));
    assert.ok(correo.htmlContent.includes('Descargarlo todo junto'));
    assert.equal(correo.subject, 'Tu material de IdEducando: 2 materiales');
  });

  test('lo que no es para montar no ofrece pedirlo montado', () => {
    const correo = correoMaterial({
      base: WEB,
      correo: 'lucia@ejemplo.es',
      nombre: '',
      materiales: [CATALOGO[1]],
      boletin: { estado: 'ya', enlace: '' },
    });
    assert.ok(!correo.htmlContent.includes('pedirlo montado'));
  });

  test('los títulos se escapan', () => {
    const correo = correoMaterial({
      base: WEB,
      correo: 'lucia@ejemplo.es',
      nombre: '',
      materiales: [material({ titulo: 'Juego <b>& </b>' })],
      boletin: { estado: 'ya', enlace: '' },
    });
    assert.ok(!correo.htmlContent.includes('<b>& </b>'));
    assert.ok(correo.htmlContent.includes('Juego &lt;b&gt;&amp; &lt;/b&gt;'));
  });
});
