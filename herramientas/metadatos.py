"""Completa los metadatos de un PDF generado con Chromium sin perder sus etiquetas.

Uso: python3 metadatos.py ruta.pdf "Asunto" "palabras, clave" [titulos.json]

Añade autoría, asunto y palabras clave, y pide al visor que muestre el título del
documento en lugar del nombre del archivo (una recomendación de PDF/UA, la norma
ISO 14289 de PDF accesibles).

Si recibe titulos.json (la lista con el texto de cada título del HTML), arregla los
marcadores: Chromium junta dos palabras cuando un título salta de línea
(«Tarjetasde trazo»). Solo se devuelven los espacios que faltan; nada más cambia.
"""

import json
import sys

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, DictionaryObject, NameObject, TextStringObject


def sin_espacios(texto: str) -> str:
    return "".join(texto.split())


def arreglar_marcadores(raiz: DictionaryObject, titulos: list[str]) -> int:
    """Pone a cada marcador el texto de su título, si solo se diferencian en los espacios."""
    buenos: dict[str, str] = {}
    for titulo in titulos:
        buenos.setdefault(sin_espacios(titulo), titulo)
    indice = raiz.get("/Outlines")
    if indice is None:
        return 0
    cambiados = 0
    pendientes = [indice.get_object().get("/First")]
    while pendientes:
        nodo = pendientes.pop()
        while nodo is not None:
            marcador = nodo.get_object()
            actual = str(marcador.get("/Title", ""))
            bueno = buenos.get(sin_espacios(actual))
            if bueno and bueno != actual:
                marcador[NameObject("/Title")] = TextStringObject(bueno)
                cambiados += 1
            if marcador.get("/First") is not None:
                pendientes.append(marcador["/First"])
            nodo = marcador.get("/Next")
    return cambiados


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
            arreglar_marcadores(raiz, json.load(archivo))
    with open(ruta, "wb") as archivo:
        escritor.write(archivo)


if __name__ == "__main__":
    main()
