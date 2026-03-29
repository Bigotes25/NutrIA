# **Documento 1: visión del producto**

## **Nombre provisional**

App web de registro nutricional con IA para control de calorías y pérdida de peso.

## **Objetivo principal**

Construir una **web app mobile-first**, optimizada para iPhone, que permita al usuario registrar lo que come de forma rápida mediante:

* audio,  
* foto,  
* foto \+ audio,  
* o entrada manual,

y que la aplicación:

* estime calorías y macros,  
* reste esas calorías del objetivo diario,  
* muestre el progreso del día,  
* permita seguimiento de peso,  
* y dé feedback útil con tono de **nutricionista coach motivador**.

## **Filosofía del producto**

La prioridad no es la precisión nutricional perfecta, sino:

* rapidez,  
* facilidad de uso,  
* consistencia diaria,  
* experiencia cómoda desde el móvil,  
* y capacidad de corrección manual.

La IA debe hacer una **estimación razonable**, pero el usuario siempre debe **confirmar antes de guardar**.

## **Público inicial**

Inicialmente se usará por el fundador, pero la arquitectura debe quedar preparada desde el día 1 para múltiples usuarios.

## **Tipo de app**

* Web app responsive  
* Mobile-first  
* Optimizada para iPhone  
* Preparada para PWA  
* Multiusuario  
* Con login desde el inicio

---

# **Documento 2: alcance funcional del MVP**

## **1\. Autenticación**

La app debe incluir:

* registro de usuario  
* login  
* logout  
* recuperación de contraseña  
* sesión persistente  
* perfil individual por usuario

## **2\. Onboarding inicial**

Tras registrarse, el usuario debe completar un onboarding con:

* nombre  
* sexo  
* edad  
* altura  
* peso actual  
* peso objetivo  
* nivel de actividad  
* ritmo de pérdida deseado

La app debe calcular automáticamente:

* TMB aproximada  
* gasto energético diario estimado  
* calorías recomendadas para mantenimiento  
* calorías recomendadas para pérdida de peso  
* proteína recomendada diaria aproximada

## **3\. Dashboard diario**

La pantalla principal debe mostrar:

* calorías consumidas hoy  
* calorías restantes respecto al objetivo diario  
* proteínas consumidas  
* carbohidratos consumidos  
* grasas consumidas  
* agua registrada manualmente  
* pasos registrados manualmente  
* ejercicio registrado manualmente  
* lista de comidas del día  
* mensaje/resumen del día con tono coach

## **4\. Registro de comidas**

El usuario debe poder añadir comida de estas formas:

* audio  
* foto  
* foto \+ audio  
* manual

### **Flujo obligatorio**

Cuando el usuario envíe una comida por IA:

1. la IA interpreta la información  
2. genera una propuesta estructurada  
3. muestra alimentos, cantidades, calorías y macros estimados  
4. el usuario revisa  
5. el usuario confirma o edita  
6. solo entonces se guarda

### **Categorías de comida**

* desayuno  
* comida  
* cena  
* snack  
* otro

### **Entrada manual**

Debe permitir:

* escribir nombre de alimento o plato  
* introducir cantidad  
* introducir o editar calorías  
* introducir o editar macros  
* elegir categoría

## **5\. Registro por audio**

Ejemplo de uso:  
 “Hoy he comido tres filetes de lomo de unos 100 gramos cada uno con 150 gramos de arroz.”

La IA debe:

* transcribir el audio  
* detectar alimentos  
* inferir cantidades  
* estimar calorías  
* estimar macros  
* generar una propuesta editable

## **6\. Registro por foto**

La IA debe:

* analizar la imagen  
* detectar la posible comida  
* estimar cantidad de forma razonable  
* inferir calorías y macros  
* devolver propuesta editable

## **7\. Registro por foto \+ audio**

Si el usuario envía ambas cosas, la IA debe:

* usar el audio como fuente principal para cantidades  
* usar la imagen como apoyo contextual  
* combinar ambas entradas para mejorar la propuesta

## **8\. Historial**

Debe existir una pantalla de historial con vistas por:

* día  
* semana  
* mes

Debe permitir:

* ver comidas pasadas  
* editar comidas pasadas  
* borrar comidas pasadas  
* duplicar comidas  
* guardar comidas como favoritas

## **9\. Favoritos**

El usuario podrá:

* guardar una comida frecuente como favorita  
* reutilizarla otro día  
* copiarla fácilmente

## **10\. Peso y progreso**

La app debe permitir:

* registrar peso manualmente  
* hacerlo con frecuencia semanal o cuando el usuario quiera  
* mostrar evolución del peso  
* mostrar tendencia  
* comparar con el objetivo  
* mostrar resúmenes semanales y mensuales

## **11\. Ejercicio**

El ejercicio se registra solo a nivel informativo.  
 No debe restarse automáticamente del objetivo calórico diario.

Campos:

* tipo de ejercicio  
* duración  
* calorías estimadas opcionales  
* fecha

## **12\. Agua y pasos**

Se introducirán manualmente.

## **13\. Notificaciones**

La app debe incluir preferencias para:

* recordatorios de registrar comidas  
* recordatorio de peso semanal  
* mensajes motivacionales  
* resumen semanal con conclusiones

## **14\. Feedback IA**

La IA debe hablar como:

* nutricionista  
* coach amable  
* motivador  
* práctico  
* nada agresivo  
* sin dramatizar

Ejemplos:

* “Hoy vas bastante bien. Aún te quedan calorías disponibles.”  
* “Te falta algo de proteína para cerrar mejor el día.”  
* “Esta semana has sido bastante constante. Buen trabajo.”  
* “Aunque un día se te vaya, lo importante es la media semanal.”

---

# **Documento 3: reglas de negocio**

## **Regla 1**

Cada usuario tiene su propio perfil, objetivo calórico y datos históricos.

## **Regla 2**

Cada comida registrada suma calorías y macros al total del día.

## **Regla 3**

El dashboard diario debe mostrar calorías restantes:  
 **calorías objetivo diarias \- calorías consumidas**

## **Regla 4**

El ejercicio no modifica automáticamente las calorías restantes.

## **Regla 5**

Agua y pasos se registran manualmente.

## **Regla 6**

Toda comida generada por IA debe pasar por una pantalla de revisión antes de guardarse.

## **Regla 7**

La IA debe priorizar:

* rapidez  
* usabilidad  
* estimaciones razonables

No debe bloquear al usuario por dudas o baja confianza.

## **Regla 8**

El usuario puede corregir cualquier comida antes o después de guardarla.

## **Regla 9**

Las comidas favoritas deben poder reutilizarse con un clic.

## **Regla 10**

La app debe soportar resúmenes:

* diarios  
* semanales  
* mensuales

---

# **Documento 4: estructura de pantallas**

## **1\. Landing**

* mensaje breve del producto  
* acceso a login y registro

## **2\. Login / Registro**

* email  
* contraseña  
* acceso sencillo

## **3\. Onboarding**

* formulario de datos personales  
* cálculo automático de objetivos

## **4\. Dashboard**

* resumen diario  
* calorías y macros  
* accesos rápidos  
* lista de comidas del día  
* feedback coach

## **5\. Añadir comida**

Opciones:

* grabar audio  
* subir foto  
* subir foto \+ audio  
* entrada manual

## **6\. Revisión de propuesta IA**

* alimentos detectados  
* cantidades  
* calorías  
* macros  
* categoría  
* editar / confirmar

## **7\. Historial**

* día / semana / mes  
* edición  
* borrado  
* duplicado  
* favorito

## **8\. Progreso**

* peso  
* tendencia  
* adherencia  
* resúmenes

## **9\. Favoritos**

* lista de comidas favoritas  
* reutilizar

## **10\. Perfil y objetivos**

* editar datos personales  
* recalcular objetivos  
* preferencias de notificaciones

---

# **Documento 5: modelo de datos recomendado en Postgres**

## **users**

* id  
* email  
* password\_hash o provider\_id  
* created\_at  
* updated\_at

## **user\_profiles**

* id  
* user\_id  
* name  
* sex  
* age  
* height\_cm  
* current\_weight\_kg  
* goal\_weight\_kg  
* activity\_level  
* target\_loss\_per\_week  
* daily\_calorie\_target  
* daily\_protein\_target  
* daily\_water\_target\_ml  
* daily\_steps\_target  
* created\_at  
* updated\_at

## **weight\_logs**

* id  
* user\_id  
* log\_date  
* weight\_kg  
* notes  
* created\_at

## **meal\_entries**

* id  
* user\_id  
* entry\_date  
* category  
* source\_type  
* title\_summary  
* total\_calories  
* total\_protein  
* total\_carbs  
* total\_fats  
* notes  
* ai\_confidence  
* created\_at  
* updated\_at

## **meal\_items**

* id  
* meal\_entry\_id  
* food\_name  
* quantity\_value  
* quantity\_unit  
* estimated\_grams  
* calories  
* protein  
* carbs  
* fats  
* created\_at  
* updated\_at

## **meal\_media**

* id  
* meal\_entry\_id  
* media\_type  
* file\_url  
* transcription\_text  
* created\_at

## **exercise\_logs**

* id  
* user\_id  
* log\_date  
* exercise\_type  
* duration\_minutes  
* estimated\_calories  
* notes  
* created\_at

## **daily\_metrics**

* id  
* user\_id  
* metric\_date  
* total\_calories\_consumed  
* total\_protein  
* total\_carbs  
* total\_fats  
* water\_ml  
* steps  
* exercise\_calories\_logged  
* created\_at  
* updated\_at

## **favorite\_meals**

* id  
* user\_id  
* name  
* description  
* total\_calories  
* total\_protein  
* total\_carbs  
* total\_fats  
* created\_at

## **favorite\_meal\_items**

* id  
* favorite\_meal\_id  
* food\_name  
* quantity\_value  
* quantity\_unit  
* estimated\_grams  
* calories  
* protein  
* carbs  
* fats

## **weekly\_summaries**

* id  
* user\_id  
* week\_start  
* week\_end  
* summary\_text  
* adherence\_score  
* average\_daily\_calories  
* weight\_change  
* created\_at

## **notification\_preferences**

* id  
* user\_id  
* meal\_reminders\_enabled  
* weekly\_summary\_enabled  
* weigh\_in\_reminder\_enabled  
* motivational\_messages\_enabled  
* created\_at  
* updated\_at

