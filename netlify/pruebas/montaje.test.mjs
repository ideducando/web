// Pruebas de «¿Lo necesitas montado?»: npm test.
// No mandan ningún correo: el catálogo de la web y Brevo se sustituyen por respuestas de mentira.
import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import montaje, { AVISOS_AL_DIA } from '../functions/montaje.mjs';
import { correoMontaje } from '../lib/correos.mjs';
import { leerPeticion, limpiarNombre, limpiarTelefono, telefonoParaLeer, telefonoParaLlamar } from '../lib/montaje.mjs';

const WEB = 'https://www.ideducando.es';
const CATALOGO = [
  {
    id: 'material:agenda-visual',
    titulo: 'Agenda visual: la semana y el día',
    ficha: '/material-gratuito/agenda-visual/',
    origen: 'material',
    arasaac: false,
  },
  {
    id: 'material:tablero-comunicacion',
    titulo: 'Tablero de comunicación',
    ficha: '/material-gratuito/tablero-comunicacion/',
    origen: 'material',
    arasaac: true,
  },
  { id: 'tienda:ya-montado', titulo: 'Materiales ya montados, desde Cartagena', ficha: '/tienda/ya-montado/', origen: 'tienda', arasaac: false },
];

const campos = (datos) => new URLSearchParams(datos);
const BASICO = { nombre: 'María López', correo: 'maria@ejemplo.es', privacidad: 'si', producto: 'material:agenda-visual' };

describe('lo que llega del formulario', () => {
  test('vale con el correo o con el teléfono', () => {
    assert.deepEqual(leerPeticion(campos(BASICO)).datos, {
      nombre: 'María López',
      correo: 'maria@ejemplo.es',
      telefono: '',
      producto: 'material:agenda-visual',
    });
    const soloTelefono = leerPeticion(campos({ ...BASICO, correo: '', telefono: '612 34 56 78' }));
    assert.equal(soloTelefono.datos.telefono, '612345678');
    assert.equal(soloTelefono.datos.correo, '');
  });

  test('sin correo ni teléfono, no', () => {
    assert.deepEqual(leerPeticion(campos({ ...BASICO, correo: '' })), { error: 'contacto' });
  });

  test('el nombre es obligatorio y sin enlaces', () => {
    assert.deepEqual(leerPeticion(campos({ ...BASICO, nombre: '  ' })), { error: 'nombre' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, nombre: 'Visita https://spam.example' })), { error: 'nombre' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, nombre: 'Ana <b>' })), { error: 'nombre' });
    assert.equal(limpiarNombre("  María   de los Ángeles O'Neill-Pérez "), "María de los Ángeles O'Neill-Pérez");
  });

  test('correo y teléfono mal escritos', () => {
    assert.deepEqual(leerPeticion(campos({ ...BASICO, correo: 'maria@' })), { error: 'correo' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, telefono: 'llámame' })), { error: 'telefono' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, telefono: '612 34' })), { error: 'telefono' });
  });

  test('privacidad y producto', () => {
    assert.deepEqual(leerPeticion(campos({ ...BASICO, privacidad: '' })), { error: 'privacidad' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, producto: '../secreto' })), { error: 'producto' });
    assert.deepEqual(leerPeticion(campos({ ...BASICO, producto: 'agenda-visual' })), { error: 'producto' });
  });

  test('teléfonos', () => {
    assert.equal(limpiarTelefono(''), '');
    assert.equal(limpiarTelefono('+34 612-345-678'), '+34612345678');
    assert.equal(limpiarTelefono('(968) 12 34 56'), '968123456');
    assert.equal(limpiarTelefono('abc'), null);
    assert.equal(telefonoParaLlamar('612345678'), '+34612345678');
    assert.equal(telefonoParaLlamar('0034612345678'), '+34612345678');
    assert.equal(telefonoParaLlamar('+447700900123'), '+447700900123');
    assert.equal(telefonoParaLeer('612345678'), '612 345 678');
  });
});

describe('el aviso que llega a hola@', () => {
  test('con correo, al contestar le llega a esa persona', () => {
    const aviso = correoMontaje({ base: WEB, ...leerPeticion(campos(BASICO)).datos, producto: CATALOGO[0] });
    assert.deepEqual(aviso.to, [{ email: 'hola@ideducando.es', name: 'IdEducando' }]);
    assert.deepEqual(aviso.replyTo, { email: 'maria@ejemplo.es', name: 'María López' });
    assert.deepEqual(aviso.tags, ['montaje']);
    assert.match(aviso.subject, /Agenda visual: la semana y el día · María López/);
    assert.match(aviso.htmlContent, /https:\/\/www\.ideducando\.es\/material-gratuito\/agenda-visual\//);
    assert.doesNotMatch(aviso.textContent, /ARASAAC/);
  });

  test('sin correo, se contesta desde hola@ y se recuerda lo de ARASAAC', () => {
    const datos = leerPeticion(campos({ ...BASICO, correo: '', telefono: '612345678' })).datos;
    const aviso = correoMontaje({ base: WEB, ...datos, producto: CATALOGO[1] });
    assert.equal(aviso.replyTo.email, 'hola@ideducando.es');
    assert.match(aviso.htmlContent, /tel:\+34612345678/);
    assert.match(aviso.textContent, /Teléfono: 612 345 678/);
    assert.match(aviso.textContent, /ARASAAC/);
  });

  test('lo que viene del catálogo también se escapa', () => {
    const raro = { ...CATALOGO[0], titulo: 'Juego <b>& </b>' };
    const aviso = correoMontaje({ base: WEB, ...leerPeticion(campos(BASICO)).datos, producto: raro });
    assert.ok(!aviso.htmlContent.includes('<b>& </b>'));
    assert.ok(aviso.htmlContent.includes('Juego &lt;b&gt;&amp; &lt;/b&gt;'));
  });
});

describe('la función de Netlify', () => {
  const fetchDeVerdad = globalThis.fetch;
  const claveDeVerdad = process.env.BREVO_API_KEY;
  let enviados;
  let avisosDeHoy;
  let brevoFalla;

  before(() => {
    process.env.BREVO_API_KEY = 'clave-de-prueba';
    globalThis.fetch = async (url, opciones = {}) => {
      const direccion = String(url);
      if (direccion === `${WEB}/datos/montaje.json`) return new Response(JSON.stringify(CATALOGO));
      if (direccion.startsWith('https://api.brevo.com/v3/smtp/statistics/events')) {
        const events = Array.from({ length: avisosDeHoy }, () => ({ tag: 'montaje' }));
        return new Response(JSON.stringify({ events }));
      }
      if (direccion === 'https://api.brevo.com/v3/smtp/email') {
        if (brevoFalla) return new Response(JSON.stringify({ code: 'not_enough_credits' }), { status: 402 });
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

  const pedir = (datos, { origen = WEB } = {}) => {
    enviados = [];
    return montaje(
      new Request(`${WEB}/api/montaje`, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded', ...(origen ? { origin: origen } : {}) },
        body: new URLSearchParams(datos).toString(),
      }),
    );
  };

  test('manda el aviso a hola@', async () => {
    avisosDeHoy = 0;
    brevoFalla = false;
    const respuesta = await pedir(BASICO);
    assert.equal(respuesta.status, 200);
    assert.deepEqual(await respuesta.json(), { enviado: true });
    assert.equal(enviados.length, 1);
    assert.equal(enviados[0].to[0].email, 'hola@ideducando.es');
    assert.equal(enviados[0].replyTo.email, 'maria@ejemplo.es');
  });

  test('solo atiende a la propia web', async () => {
    const respuesta = await pedir(BASICO, { origen: 'https://otra.example' });
    assert.equal(respuesta.status, 403);
    assert.equal(enviados.length, 0);
  });

  test('a los robots se les contesta como si nada', async () => {
    const respuesta = await pedir({ ...BASICO, sitio_web: 'https://spam.example' });
    assert.deepEqual(await respuesta.json(), { enviado: true });
    assert.equal(enviados.length, 0);
  });

  test('sin correo ni teléfono, error 400', async () => {
    const respuesta = await pedir({ ...BASICO, correo: '' });
    assert.equal(respuesta.status, 400);
    assert.deepEqual(await respuesta.json(), { error: 'contacto' });
  });

  test('lo que no está en el catálogo no se acepta', async () => {
    const respuesta = await pedir({ ...BASICO, producto: 'material:no-existe' });
    assert.equal(respuesta.status, 400);
    assert.deepEqual(await respuesta.json(), { error: 'producto' });
    assert.equal(enviados.length, 0);
  });

  test(`con ${AVISOS_AL_DIA} avisos en el día, no manda más`, async () => {
    avisosDeHoy = AVISOS_AL_DIA;
    const respuesta = await pedir(BASICO);
    assert.deepEqual(await respuesta.json(), { enviado: false, motivo: 'cupo' });
    assert.equal(enviados.length, 0);
    avisosDeHoy = 0;
  });

  test('si Brevo falla, la ficha ofrece escribirnos', async () => {
    brevoFalla = true;
    const respuesta = await pedir(BASICO);
    assert.deepEqual(await respuesta.json(), { enviado: false, motivo: 'brevo' });
    brevoFalla = false;
  });
});
