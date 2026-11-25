// Pruebas de las valoraciones con estrellas: npm test.
// Usan el servidor de Netlify Blobs para pruebas, que guarda los datos en una carpeta temporal:
// no tocan el almacén de la web ni gastan créditos.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, describe, test } from 'node:test';
import { setEnvironmentContext } from '@netlify/blobs';
import { BlobsServer } from '@netlify/blobs/server';
import {
  estrellasValidas,
  idValido,
  limpiarCuentas,
  resumen,
  resumenes,
  sumarVoto,
} from '../lib/valoraciones.mjs';
import valorar from '../functions/valorar.mjs';
import valoraciones from '../functions/valoraciones.mjs';

const WEB = 'https://www.ideducando.es';
const PUBLICADA = { deploy: { context: 'production' } };
const VISTA_PREVIA = { deploy: { context: 'deploy-preview' } };

describe('cuentas y resúmenes', () => {
  test('sin 5 votos no hay media', () => {
    assert.deepEqual(resumen([0, 0, 0, 1, 3]), { votos: 4, media: null });
    assert.deepEqual(resumen(), { votos: 0, media: null });
  });

  test('con 5 votos o más, media con un decimal', () => {
    assert.deepEqual(resumen([0, 0, 0, 2, 3]), { votos: 5, media: 4.6 });
    assert.deepEqual(resumen([1, 0, 0, 0, 2]), { votos: 3, media: null });
    assert.deepEqual(resumen([1, 1, 1, 1, 1]), { votos: 5, media: 3 });
    assert.deepEqual(resumen([0, 0, 1, 1, 1]).media, null);
    assert.deepEqual(resumen([2, 0, 0, 0, 4]), { votos: 6, media: 3.7 });
  });

  test('lo guardado roto se limpia', () => {
    assert.deepEqual(limpiarCuentas(null), {});
    assert.deepEqual(limpiarCuentas([1, 2]), {});
    assert.deepEqual(
      limpiarCuentas({
        'agenda-visual': [1, -2, 'x', 3.5, 4, 99],
        'Con Mayúsculas': [1, 1, 1, 1, 1],
        'sin-lista': 7,
      }),
      { 'agenda-visual': [1, 0, 0, 0, 4] },
    );
  });

  test('ids y estrellas', () => {
    assert.ok(idValido('tren-de-las-silabas'));
    assert.ok(!idValido('../cuentas'));
    assert.ok(!idValido(''));
    assert.ok(!idValido('a'.repeat(101)));
    assert.ok(estrellasValidas(1) && estrellasValidas(5));
    assert.ok(!estrellasValidas(0) && !estrellasValidas(6) && !estrellasValidas(4.5) && !estrellasValidas(NaN));
  });

  test('resumenes() da uno por material', () => {
    assert.deepEqual(resumenes({ a: [0, 0, 0, 0, 5], b: [0, 1, 0, 0, 0] }), {
      a: { votos: 5, media: 5 },
      b: { votos: 1, media: null },
    });
  });
});

/** Almacén de mentira con escritura condicionada atómica y pausas al azar, para cruzar votos a la vez. */
function almacenConPrisas() {
  let dato = null;
  let version = 0;
  const pausa = () => new Promise((listo) => setTimeout(listo, Math.random() * 4));
  return {
    conflictos: 0,
    async getWithMetadata() {
      await pausa();
      return dato === null ? null : { data: structuredClone(dato), etag: `"v${version}"`, metadata: {} };
    },
    async setJSON(_clave, valor, { onlyIfMatch, onlyIfNew } = {}) {
      await pausa();
      if ((onlyIfNew && dato !== null) || (onlyIfMatch && onlyIfMatch !== `"v${version}"`)) {
        this.conflictos++;
        return { modified: false };
      }
      dato = structuredClone(valor);
      version++;
      return { modified: true, etag: `"v${version}"` };
    },
    leer: () => dato,
  };
}

describe('votos a la vez', () => {
  test('no se pierde ninguno', async () => {
    const almacen = almacenConPrisas();
    const votos = [5, 4, 5, 3, 5, 5, 1, 4, 5, 2, 5, 4];
    const resultados = await Promise.all(
      votos.map((n) => sumarVoto(almacen, 'agenda-visual', n, { intentos: 40, pausa: 2 })),
    );
    assert.ok(resultados.every(Boolean), 'todos los votos se han guardado');
    assert.ok(almacen.conflictos > 0, 'la prueba ha cruzado votos de verdad');
    assert.deepEqual(almacen.leer()['agenda-visual'], [1, 1, 1, 3, 6]);
  });

  test('si no puede guardar, lo dice', async () => {
    const siempreOcupado = {
      getWithMetadata: async () => ({ data: {}, etag: '"v1"' }),
      setJSON: async () => ({ modified: false }),
    };
    assert.equal(await sumarVoto(siempreOcupado, 'agenda-visual', 5, { intentos: 3, pausa: 1 }), null);
  });
});

describe('funciones de Netlify', () => {
  let servidor;
  let carpeta;
  const fetchDeVerdad = globalThis.fetch;

  before(async () => {
    carpeta = await mkdtemp(join(tmpdir(), 'valoraciones-'));
    servidor = new BlobsServer({ directory: carpeta, token: 'prueba' });
    const { port } = await servidor.start();
    const direccion = `http://localhost:${port}`;
    setEnvironmentContext({ siteID: 'sitio-de-prueba', token: 'prueba', edgeURL: direccion, uncachedEdgeURL: direccion });
    // El catálogo de la web, sin salir a internet.
    globalThis.fetch = async (recurso, opciones) => {
      if (String(recurso).endsWith('/datos/mochila.json')) {
        return Response.json([{ id: 'agenda-visual' }, { id: 'tren-de-las-silabas' }]);
      }
      return fetchDeVerdad(recurso, opciones);
    };
  });

  after(async () => {
    globalThis.fetch = fetchDeVerdad;
    await servidor.stop();
    await rm(carpeta, { recursive: true, force: true });
  });

  const voto = (cuerpo, origen = WEB) =>
    new Request(`${WEB}/api/valorar`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded', ...(origen ? { origin: origen } : {}) },
      body: new URLSearchParams(cuerpo),
    });

  test('rechaza lo que no viene de la web o no es válido', async () => {
    const casos = [
      [voto({ material: 'agenda-visual', estrellas: '5' }, null), 403],
      [voto({ material: 'agenda-visual', estrellas: '5' }, 'https://otra-web.example'), 403],
      [voto({ material: 'no-existe', estrellas: '5' }), 400],
      [voto({ material: '../cuentas', estrellas: '5' }), 400],
      [voto({ material: 'agenda-visual', estrellas: '6' }), 400],
      [voto({ material: 'agenda-visual', estrellas: '' }), 400],
    ];
    for (const [peticion, estado] of casos) {
      assert.equal((await valorar(peticion, PUBLICADA)).status, estado);
    }
  });

  test('suma votos y enseña la media desde el quinto', async () => {
    const respuestas = [];
    for (const estrellas of [5, 5, 4, 5, 4]) {
      const respuesta = await valorar(voto({ material: 'agenda-visual', estrellas: String(estrellas) }), PUBLICADA);
      assert.equal(respuesta.status, 200);
      respuestas.push(await respuesta.json());
    }
    assert.deepEqual(respuestas[3], { guardado: true, votos: 4, media: null });
    assert.deepEqual(respuestas[4], { guardado: true, votos: 5, media: 4.6 });

    const lista = await valoraciones(new Request(`${WEB}/api/valoraciones`), PUBLICADA);
    assert.equal(lista.status, 200);
    assert.match(lista.headers.get('netlify-cdn-cache-control'), /durable/);
    assert.deepEqual(await lista.json(), { 'agenda-visual': { votos: 5, media: 4.6 } });
  });

  test('lo que se vota en una vista previa no cuenta en la web publicada', async () => {
    const respuesta = await valorar(voto({ material: 'tren-de-las-silabas', estrellas: '1' }), VISTA_PREVIA);
    assert.equal(respuesta.status, 200);
    const publicada = await (await valoraciones(new Request(`${WEB}/api/valoraciones`), PUBLICADA)).json();
    assert.equal(publicada['tren-de-las-silabas'], undefined);
    const prueba = await (await valoraciones(new Request(`${WEB}/api/valoraciones`), VISTA_PREVIA)).json();
    assert.deepEqual(prueba, { 'tren-de-las-silabas': { votos: 1, media: null } });
  });
});
