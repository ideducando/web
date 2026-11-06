"""Completa los metadatos de un PDF generado con Chromium sin perder sus etiquetas.

Uso: python3 metadatos.py ruta.pdf "Asunto" "palabras, clave" [titulos.json]

Añade autoría, asunto y palabras clave, y pide al visor que muestre el título del
documento en lugar del nombre del archivo (una recomendación de PDF/UA, la norma
ISO 14289 de PDF accesibles).

Con titulos.json (los títulos h1 a h6 del HTML, en orden, que prepara generar.mjs)
arregla también el texto de los marcadores, el índice lateral del lector de PDF que
usan también los lectores de pantalla. Chromium los escribe con las letras que pinta:
junta dos palabras donde un título salta de línea («Tarjetasde trazo») o donde un
margen las separa («5Exploto»), y a veces repite el título. Antes de cambiar nada
comprueba que cada marcador es el de su título. Si no cuadran, avisa y solo devuelve
los espacios que faltan, sin tocar nada más.
"""

import json
import sys
import unicodedata

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, DictionaryObject, NameObject, TextStringObject


def marcadores(nodo):
    """Recorre los marcadores en orden de lectura: cada uno y, después, los que cuelgan de él."""
    while nodo is not None:
        nodo = nodo.get_object()
        yield nodo
        yield from marcadores(nodo.get("/First"))
        nodo = nodo.get("/Next")


def letras(texto):
    """Solo letras y cifras, en minúscula: lo que no cambia aunque falten o sobren espacios."""
    return "".join(c for c in unicodedata.normalize("NFC", texto).casefold() if c.isalnum())


def es_su_titulo(de_chromium, del_html):
    """Las letras del título del HTML están, en orden, en el marcador, que como mucho las repite."""
    marcador, titulo = letras(de_chromium), letras(del_html)
    quedan = iter(marcador)
    return all(letra in quedan for letra in titulo) and len(marcador) <= 2 * len(titulo)


def sin_espacios(texto: str) -> str:
    return "".join(texto.split())


def devolver_espacios(lista, titulos) -> None:
    """Plan B: pone a cada marcador el texto de su título si solo se diferencian en los espacios."""
    buenos: dict[str, str] = {}
    for titulo in titulos:
        buenos.setdefault(sin_espacios(titulo), titulo)
    for marcador in lista:
        bueno = buenos.get(sin_espacios(str(marcador.get("/Title", ""))))
        if bueno:
            marcador[NameObject("/Title")] = TextStringObject(bueno)


def corregir_marcadores(raiz, titulos) -> None:
    indice = raiz.get("/Outlines")
    lista = list(marcadores(indice.get_object().get("/First"))) if indice is not None else []
    problema = None
    if len(lista) != len(titulos):
        problema = f"el PDF tiene {len(lista)} marcadores y el HTML, {len(titulos)} títulos"
    else:
        for marcador, titulo in zip(lista, titulos):
            if not es_su_titulo(str(marcador.get("/Title", "")), titulo):
                problema = f"el marcador «{marcador.get('/Title')}» no es el del título «{titulo}»"
                break
    if problema:
        print(f"Aviso: {problema}. Solo se devuelven los espacios que faltan.", file=sys.stderr)
        devolver_espacios(lista, titulos)
        return
    for marcador, titulo in zip(lista, titulos):
        marcador[NameObject("/Title")] = TextStringObject(titulo)


def main() -> None:
    ruta, asunto, palabras = sys.argv[1], sys.argv[2], sys.argv[3]
    lector = PdfReader(ruta)
    titulo = (lector.metadata or {}).get("/Title", "")
    escritor = PdfWriter(clone_from=lector)
    escritor.add_metadata(
        {
            "/Title": titulo,
            "/Author": "IdEducando",
            "/Subject": asunto,
            "/Keywords": palabras,
            "/Creator": "IdEducando (HTML impreso con Chromium)",
        }
    )
    raiz = getattr(escritor, "root_object", None) or escritor._root_object
    preferencias = raiz.get("/ViewerPreferences")
    if preferencias is None:
        preferencias = DictionaryObject()
        raiz[NameObject("/ViewerPreferences")] = preferencias
    preferencias[NameObject("/DisplayDocTitle")] = BooleanObject(True)
    if len(sys.argv) > 4:
        with open(sys.argv[4], encoding="utf-8") as archivo:
            corregir_marcadores(raiz, json.load(archivo))
    with open(ruta, "wb") as archivo:
        escritor.write(archivo)


if __name__ == "__main__":
    main()
