// Escalera de habilidades específicas de PT y AL: las áreas y sus habilidades.
// Texto propio de IdEducando, escrito desde el currículo de Murcia y modelos clásicos (las fuentes están en la
// última página del PDF, en escalera-habilidades.mjs). Cada área tiene tres peldaños: «Primeros pasos»,
// «Avanzando» y «Lo consolida». Los códigos (AT-01, AT-02…) salen solos del orden: si se añade o se quita una
// habilidad, cambian los números de las que van detrás.
//
// Cada área: parte (PT o AL), codigo (dos letras), nombre, desc, color (de COLORES, en escalera-habilidades.mjs),
// icono (de ICONOS, en el mismo archivo), materiales (títulos de materiales de la web para trabajarlas) y peldanos.

export const PELDANOS = ['Primeros pasos', 'Avanzando', 'Lo consolida'];

const PT = 'Pedagogía Terapéutica';
const AL = 'Audición y Lenguaje';

export const AREAS = [
  {
    parte: PT,
    codigo: 'AT',
    nombre: 'Atención y percepción',
    desc: 'Mirar, escuchar y quedarse en la tarea el tiempo que pide.',
    color: 'azul',
    icono: 'ojo',
    materiales: ['Ya he terminado', 'Pausas activas para todos'],
    peldanos: [
      [
        'Mira el objeto o la persona que le señala el adulto.',
        'Sigue con la vista un objeto que se mueve despacio delante de sí.',
        'Se queda un minuto en una actividad con un adulto al lado.',
        'Encuentra, entre tres, el objeto igual al que se le enseña.',
      ],
      [
        'Acaba una tarea de unos 5 minutos con una sola llamada de atención.',
        'Busca un dibujo, una letra o un número concreto en una lámina con muchos elementos.',
        'Encuentra las diferencias entre dos dibujos sencillos.',
        'Retoma la tarea por su cuenta después de una interrupción breve.',
      ],
      [
        'Trabaja 15 minutos seguidos con el ruido normal del aula.',
        'Cambia de actividad cuando se avisa y después retoma lo que dejó a medias.',
        'Repasa su trabajo al terminar y corrige algún error.',
      ],
    ],
  },
  {
    parte: PT,
    codigo: 'FE',
    nombre: 'Memoria y funciones ejecutivas',
    desc: 'Recordar, planificar, esperar y cambiar de plan.',
    color: 'morado',
    icono: 'lista',
    materiales: ['Paso a paso: secuencias para las rutinas', 'Agenda visual'],
    peldanos: [
      [
        'Recuerda dónde se guarda su material de cada día.',
        'Repite dos palabras o dos números justo después de oírlos.',
        'Espera unos segundos antes de coger un material atractivo, si se le pide.',
        'Hace lo que se le pide en una instrucción de un paso, sin repetírsela.',
      ],
      [
        'Sigue una instrucción de dos pasos en el orden dicho.',
        'Ordena tres viñetas de una historia o de una rutina conocida.',
        'Acepta un cambio de plan avisado con antelación y con un apoyo visual.',
        'Dice qué necesita antes de empezar una tarea (por ejemplo, lápiz, ficha y goma).',
      ],
      [
        'Dice en voz alta los pasos de una tarea corta y los sigue.',
        'Prueba otra forma de hacerlo cuando la primera no le sale.',
        'Se para a pensar antes de contestar cuando se le recuerda.',
        'Recuerda un encargo y lo cumple más tarde, en la misma mañana.',
      ],
    ],
  },
  {
    parte: PT,
    codigo: 'AU',
    nombre: 'Autonomía y hábitos de trabajo',
    desc: 'Hacerse cargo de sus cosas, sus rutinas y su trabajo.',
    color: 'verde',
    icono: 'mochila',
    materiales: ['Agenda visual', 'Horario semanal con recreo'],
    peldanos: [
      [
        'Deja el abrigo y la mochila en su sitio al llegar a clase.',
        'Saca y guarda el material de una tarea cuando se le da una señal.',
        'Pide ir al baño con palabras, un gesto o una tarjeta.',
        'Mira su agenda visual con un adulto al empezar el día.',
      ],
      [
        'Prepara en la mesa lo que necesita para la siguiente tarea.',
        'Sigue una rutina del día (llegar, almorzar, recoger) mirando sus apoyos.',
        'Pide ayuda con una frase o una tarjeta cuando no sabe seguir.',
        'Recoge su sitio al terminar, sin que se le diga.',
      ],
      [
        'Consulta la agenda o el horario para saber qué toca después.',
        'Lleva y trae notas o tareas entre casa y el cole.',
        'Acaba una tarea sencilla por su cuenta y avisa cuando termina.',
      ],
    ],
  },
  {
    parte: PT,
    codigo: 'SE',
    nombre: 'Emociones y convivencia',
    desc: 'Entender lo que siente, calmarse y estar con los demás.',
    color: 'coral',
    icono: 'corazon',
    materiales: ['Rincón de la calma', 'Turnos visibles'],
    peldanos: [
      [
        'Acepta estar cerca de otros niños y niñas durante una actividad.',
        'Elige entre dos caras la que muestra cómo se siente (contento o enfadado).',
        'Espera su turno en un juego de dos con un apoyo visual.',
        'Usa la estrategia de calma que le propone el adulto (respirar, apretar una pelota).',
      ],
      [
        'Nombra la alegría, la tristeza, el enfado y el miedo en sí y en los demás.',
        'Pide un descanso o un sitio tranquilo cuando nota que se agobia.',
        'Comparte el material en una actividad de grupo.',
        'Acepta perder en un juego de mesa sin dejar de jugar.',
      ],
      [
        'Elige por su cuenta una estrategia de calma y vuelve a la actividad.',
        'Propone o acepta normas al jugar con otros en el recreo.',
        'Resuelve un conflicto sencillo hablando, por su cuenta o con un mediador.',
        'Se da cuenta de que alguien necesita ayuda y se la ofrece.',
      ],
    ],
  },
  {
    parte: PT,
    codigo: 'LE',
    nombre: 'Leer y escribir',
    desc: 'De los sonidos y las letras a leer y escribir frases.',
    color: 'naranja',
    icono: 'lapiz',
    materiales: ['El tren de las sílabas', 'Detectives de letras', 'Tarjetas de trazo'],
    peldanos: [
      [
        'Reconoce su nombre escrito entre otros.',
        'Separa palabras en sílabas con palmadas.',
        'Dice si dos palabras empiezan por el mismo sonido.',
        'Repasa trazos rectos y curvos siguiendo la guía.',
      ],
      [
        'Asocia las vocales y cinco consonantes con su sonido.',
        'Lee sílabas directas (consonante y vocal) con las letras que conoce.',
        'Escribe su nombre sin modelo.',
        'Lee palabras de dos sílabas y las une con su dibujo.',
      ],
      [
        'Lee frases cortas y demuestra que las entiende (señala, contesta o dibuja).',
        'Escribe al dictado palabras con las letras que conoce.',
        'Escribe una frase sobre una imagen con un banco de palabras.',
        'Lee en voz alta un texto breve haciendo una pausa en cada punto.',
      ],
    ],
  },
  {
    parte: PT,
    codigo: 'MA',
    nombre: 'Pensar con números',
    desc: 'Contar, comparar y usar los números en el día a día.',
    color: 'amarillo',
    icono: 'numeros',
    materiales: ['Estaciones de matemáticas de otoño', 'Mercadillo de clase'],
    peldanos: [
      [
        'Agrupa objetos por color, forma o tamaño.',
        'Distingue «muchos» y «pocos», «más» y «menos» con objetos.',
        'Cuenta hasta 5 tocando cada objeto una vez.',
        'Continúa una serie de dos elementos que se repiten (rojo, azul, rojo…).',
      ],
      [
        'Cuenta hasta 10 objetos y dice cuántos hay en total.',
        'Une cada número hasta el 10 con su cantidad.',
        'Ordena los números del 1 al 10.',
        'Suma hasta 10 con material que puede tocar.',
      ],
      [
        'Resuelve problemas orales de sumar y restar hasta 10 con apoyo visual.',
        'Forma y separa números hasta el 20 (12 es 10 y 2).',
        'Paga una cantidad pequeña con monedas de 1 y 2 euros.',
        'Lee la hora en punto en un reloj de agujas.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'ED',
    nombre: 'Escucha y discriminación auditiva',
    desc: 'Atender a los sonidos y distinguirlos entre sí.',
    color: 'azul',
    icono: 'sonido',
    materiales: ['El tren de las sílabas'],
    peldanos: [
      [
        'Reacciona a un sonido: se gira, se para o lo busca con la mirada.',
        'Se mueve cuando suena la música y se para cuando calla.',
        'Reconoce sonidos de casa y del cole (timbre, agua, animales) entre dos dibujos.',
      ],
      [
        'Dice si dos sonidos o dos palabras son iguales o distintos.',
        'Repite un ritmo sencillo de tres golpes.',
        'Distingue con dibujos palabras que solo cambian un sonido (pato y gato).',
        'Sigue una instrucción oral con el ruido normal del aula.',
        'Avisa cuando no oye bien o cuando su audífono o su implante no funciona.',
      ],
      [
        'Dice el primer sonido de una palabra.',
        'Cuenta los sonidos de una palabra corta.',
        'Recuerda y repite una frase de cinco o seis palabras.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'CI',
    nombre: 'Comunicación e interacción',
    desc: 'Querer comunicarse y hacerlo por turnos con otra persona.',
    color: 'verde',
    icono: 'bocadillos',
    materiales: ['Comunicación en el bolsillo', 'Turnos visibles'],
    peldanos: [
      [
        'Responde a un saludo con la mirada, una sonrisa, un gesto o una palabra.',
        'Comparte con un adulto el interés por un juguete o un libro.',
        'Pide lo que quiere: señala, hace un gesto, da una imagen o dice una palabra.',
        'Dice que no de forma aceptable (con un gesto, «no» o una tarjeta).',
      ],
      [
        'Da y recibe por turnos en un juego con un adulto.',
        'Llama la atención de alguien antes de decirle algo.',
        'Enseña algo que le interesa para compartirlo («¡mira!», señalando o con un pictograma).',
        'Copia gestos, sonidos o palabras cuando juega o canta con otros.',
      ],
      [
        'Empieza una interacción con un compañero o una compañera.',
        'Mantiene un intercambio de tres turnos sobre el mismo tema.',
        'Pide ayuda o que le repitan cuando no entiende algo.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'CA',
    nombre: 'Comunicación aumentativa y alternativa',
    desc: 'Comunicarse con pictogramas, signos o un comunicador.',
    color: 'morado',
    icono: 'tablero',
    materiales: ['Comunicación en el bolsillo'],
    peldanos: [
      [
        'Elige entre dos opciones mirando o tocando un pictograma o un objeto.',
        'Da una tarjeta a un adulto para pedir algo que quiere.',
        'Usa un gesto o un signo para «más», «se acabó» o «ayuda».',
      ],
      [
        'Busca su tablero o su comunicador cuando quiere decir algo.',
        'Señala en el tablero para pedir, rechazar y comentar.',
        'Une dos pictogramas en un mensaje («quiero agua»).',
        'Pasa de página o de carpeta en su tablero o su aplicación para encontrar una palabra.',
      ],
      [
        'Forma frases de tres o más pictogramas.',
        'Usa el tablero con distintas personas: su familia, sus compañeros y otros adultos.',
        'Combina el tablero con el habla, los gestos o los signos según la situación.',
        'Usa el tablero para contar algo que ha pasado o para preguntar.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'CO',
    nombre: 'Comprensión',
    desc: 'Entender palabras, órdenes, preguntas y relatos.',
    color: 'coral',
    icono: 'pregunta',
    materiales: ['Rincón de lenguaje de invierno'],
    peldanos: [
      [
        'Responde cuando le llaman por su nombre.',
        'Señala objetos o dibujos conocidos cuando se nombran.',
        'Cumple una orden sencilla que el contexto ayuda a entender («dame», «siéntate»).',
        'Entiende «sí» y «no» en situaciones del día a día.',
      ],
      [
        'Señala acciones y partes del cuerpo cuando se nombran.',
        'Cumple órdenes de dos elementos («coge el lápiz rojo»).',
        'Entiende dentro y fuera, encima y debajo, grande y pequeño.',
        'Contesta a qué y a quién sobre una lámina.',
      ],
      [
        'Contesta a dónde, cuándo y por qué sobre un cuento.',
        'Cumple órdenes de tres pasos sin apoyo visual.',
        'Entiende frases con «no» y con palabras de tiempo (antes, después).',
        'Explica con sus palabras de qué trata un relato oral breve.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'EX',
    nombre: 'Expresión: palabras y frases',
    desc: 'Decir palabras y unirlas en frases cada vez más largas.',
    color: 'naranja',
    icono: 'bocadillo',
    materiales: ['Rincón de lenguaje de invierno', 'Frase y dibujo'],
    peldanos: [
      [
        'Hace sonidos o dice palabras con intención de comunicar.',
        'Nombra unas 20 cosas y personas de su entorno.',
        'Usa palabras para pedir, nombrar y negar.',
      ],
      [
        'Junta dos palabras en una frase («más agua», «mamá, ven»).',
        'Nombra acciones, cualidades y lugares conocidos.',
        'Hace frases de tres o cuatro palabras con sujeto y verbo.',
        'Usa bien el plural y el femenino en palabras frecuentes.',
        'Hace preguntas sencillas con qué, dónde y quién.',
      ],
      [
        'Cuenta lo que ha hecho uniendo frases con «y», «después» o «porque».',
        'Usa el pasado y el futuro en verbos frecuentes.',
        'Cuenta un cuento conocido en orden con ayuda de imágenes.',
        'Explica qué es o para qué sirve una palabra conocida.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'HA',
    nombre: 'Habla: soplo, boca y sonidos',
    desc: 'Soplar, mover la boca y pronunciar bien cada sonido.',
    color: 'amarillo',
    icono: 'boca',
    materiales: [],
    peldanos: [
      [
        'Sopla para mover una pluma, un molinillo o una bola de papel.',
        'Imita movimientos de labios y lengua (sonreír, dar un beso, sacar la lengua).',
        'Repite sílabas sencillas con distintas vocales (pa, pe, pi…).',
      ],
      [
        'Mantiene un soplo suave unos 3 segundos.',
        'Dice bien el sonido que se trabaja en sílabas sueltas.',
        'Dice bien el sonido que se trabaja al principio, en medio y al final de palabras.',
        'Nota si el adulto dice una palabra bien o mal.',
      ],
      [
        'Usa el sonido que se trabaja en frases y al leer.',
        'Usa el sonido que se trabaja al hablar en una conversación.',
        'Habla con un volumen y un ritmo que se entienden en clase.',
        'Se corrige al notar un error al hablar.',
      ],
    ],
  },
  {
    parte: AL,
    codigo: 'US',
    nombre: 'Uso social del lenguaje',
    desc: 'Usar el lenguaje con cada persona y en cada lugar.',
    color: 'marino',
    icono: 'personas',
    materiales: ['Diálogos para completar', 'En el cole y en casa: historias sociales'],
    peldanos: [
      [
        'Saluda y se despide de personas conocidas.',
        'Dice «gracias» y «por favor» con un modelo.',
        'Se orienta hacia la persona con la que habla.',
      ],
      [
        'Respeta el turno de palabra en la asamblea.',
        'Sigue el tema en una conversación corta.',
        'Ajusta el volumen de la voz al lugar (clase, patio, biblioteca).',
        'Cuenta algo que le ha pasado a alguien que no estaba.',
      ],
      [
        'Pregunta a los demás por sus gustos o por lo que han hecho.',
        'Entiende bromas sencillas y frases hechas frecuentes.',
        'Arregla la conversación cuando no le entienden: repite, explica o señala.',
        'Cambia su forma de hablar según con quién habla (un peque, un adulto).',
      ],
    ],
  },
];
