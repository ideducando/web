"""Completa los metadatos de un PDF generado con Chromium sin perder sus etiquetas.

Uso: python3 metadatos.py ruta.pdf "Asunto" "palabras, clave" [titulos.json]

Añade autoría, asunto y palabras clave, y pide al visor que muestre el título del
documento en lugar del nombre del archivo (una recomendación de PDF/UA, la norma
ISO 14289 de PDF accesibles).

Con titulos.json (los títulos h1 a h6 del HTML, en orden, que prepara generar.mjs)
corrige también el texto de los marcadores, el índice lateral del lector de PDF que
usan también los lectores de pantalla. Chromium los escribe con las letras que pinta:
pierde el espacio de cada salto de línea («El rincónde la calma») y a veces repite el
título. Antes de cambiar nada comprueba que cada marcador es el de su título; si no
cuadran, lo explica y sale con el código 3 sin tocar el PDF.
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


def corregir_marcadores(raiz, titulos):
    indice = raiz.get("/Outlines")
    lista = list(marcadores(indice.get_object().get("/First"))) if indice is not None else []
    if len(lista) != len(titulos):
        print(f"El PDF tiene {len(lista)} marcadores y el HTML, {len(titulos)} títulos.", file=sys.stderr)
        sys.exit(3)
    for marcador, titulo in zip(lista, titulos):
        if not es_su_titulo(str(marcador.get("/Title", "")), titulo):
            print(f"El marcador «{marcador.get('/Title')}» no es el del título «{titulo}».", file=sys.stderr)
            sys.exit(3)
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
