// «¿Lo necesitas montado?» (José, 26/11/2026): dónde sale el formulario. Lo usan las fichas, la tienda y
// el catálogo /datos/montaje.json de la función de Netlify, así que los tres dicen siempre lo mismo.
import { existeArchivo } from './formatos';
import type { Material } from './materiales';
import type { Producto } from './tienda';

/** En el material gratuito: solo en el que hay que montar (lleva «Cómo montarlo») y ya se puede descargar. */
export function materialSeMonta(material: Material): boolean {
  return material.data.pasos.length > 0 && existeArchivo(material.data.archivo);
}

/** En la tienda: en todo, menos en la asesoría por videollamada, que no se monta. */
export function productoSeMonta(producto: Producto): boolean {
  return producto.data.tipo !== 'asesoria';
}
