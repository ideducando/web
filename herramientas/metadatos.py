"""Completa los metadatos de un PDF generado con Chromium sin perder sus etiquetas.

Uso: python3 metadatos.py ruta.pdf "Asunto" "palabras, clave"

Añade autoría, asunto y palabras clave, y pide al visor que muestre el título del
documento en lugar del nombre del archivo (una recomendación de PDF/UA, la norma
ISO 14289 de PDF accesibles).
"""

import sys

from pypdf import PdfReader, PdfWriter
from pypdf.generic import BooleanObject, DictionaryObject, NameObject


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
    with open(ruta, "wb") as archivo:
        escritor.write(archivo)


if __name__ == "__main__":
    main()
