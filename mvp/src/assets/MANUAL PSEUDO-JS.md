
> Dialecto de pseudocódigo inspirado en PSeInt, interpretado en JavaScript.  

---

## Tabla de contenidos

1. [Estructura general](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#1-estructura-general)
2. [Comentarios](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#2-comentarios)
3. [Variables y tipos](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#3-variables-y-tipos)
4. [Operadores](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#4-operadores)
5. [Entrada y salida](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#5-entrada-y-salida)
6. [Estructuras de control](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#6-estructuras-de-control)
    - 6.1 [Condicional Si](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#61-condicional-si)
    - 6.2 [Según (switch)](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#62-seg%C3%BAn-switch)
    - 6.3 [Mientras](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#63-mientras)
    - 6.4 [Para](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#64-para)
    - 6.5 [Repetir...HastaQue](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#65-repetirhastaQue)
7. [Arreglos](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#7-arreglos)
8. [Funciones](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#8-funciones)
9. [Funciones integradas](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#9-funciones-integradas)
10. [Ejemplos completos](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#10-ejemplos-completos)
11. [Errores comunes](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#11-errores-comunes)
12. [Referencia rápida](https://claude.ai/chat/dec1352b-32f8-436d-b94b-121ee0b547a1#12-referencia-r%C3%A1pida)

---

## 1. Estructura general

Todo programa en PseudoJS debe estar encerrado dentro de un bloque `Algoritmo` (o su alias `Proceso`). Las funciones se definen fuera —antes o después— del algoritmo principal.

```
Algoritmo NombreDelPrograma
    // instrucciones
FinAlgoritmo
```

**Alias aceptados:**

|Apertura|Cierre|
|---|---|
|`Algoritmo`|`FinAlgoritmo`|
|`Proceso`|`FinProceso`|

El nombre del algoritmo es opcional pero recomendado.

```
Algoritmo HolaMundo
    Escribir "Hola, mundo!"
FinAlgoritmo
```

---

## 2. Comentarios

Los comentarios son ignorados por el intérprete.

```
// Esto es un comentario de línea

/* Esto es un
   comentario de bloque */
```

---

## 3. Variables y tipos

### 3.1 Declaración implícita

PseudoJS permite usar variables sin declararlas. El tipo se infiere del primer valor asignado.

```
Algoritmo Ejemplo
    x <- 10         // número entero
    nombre <- "Ana" // cadena de texto
    activo <- Verdadero  // lógico
FinAlgoritmo
```

### 3.2 Declaración explícita con `Definir`

```
Definir nombre Como Entero
Definir precio Como Real
Definir letra Como Caracter
Definir bandera Como Logico
```

**Tipos disponibles:**

|Tipo|Descripción|Valor inicial|
|---|---|---|
|`Entero`|Número entero|`0`|
|`Real`|Número con decimales|`0`|
|`Caracter`|Cadena de texto|`""`|
|`Logico`|Verdadero o Falso|`Falso`|

### 3.3 Asignación

PseudoJS acepta tres formas de asignación equivalentes:

```
x <- 42        // flecha (recomendado)
x := 42        // dos puntos igual
x = 42         // igual simple
```

### 3.4 Literales

```
// Números
x <- 42
x <- 3.14
x <- -7

// Cadenas (comillas simples o dobles)
nombre <- "Juan"
nombre <- 'María'

// Lógicos
activo <- Verdadero
activo <- Falso
```

### 3.5 Nombres de variables

- Solo letras, dígitos, `_` y caracteres Unicode (ej. tildes).
- No pueden comenzar con un dígito.
- No distinguen mayúsculas de minúsculas: `Total` y `total` son la misma variable.

```
// Válidos
contador <- 0
_auxiliar <- 1
datoDeEntrada <- "hola"
número <- 5   // con tilde, válido

// Inválido
2dato <- 10   // ✗ empieza con dígito
```

---

## 4. Operadores

### 4.1 Aritméticos

|Operador|Operación|Ejemplo|Resultado|
|---|---|---|---|
|`+`|Suma|`3 + 2`|`5`|
|`-`|Resta|`10 - 4`|`6`|
|`*`|Multiplicación|`3 * 4`|`12`|
|`/`|División|`7 / 2`|`3.5`|
|`%`|Módulo (resto)|`10 % 3`|`1`|
|`mod`|Módulo (alias)|`10 mod 3`|`1`|
|`^`|Potencia|`2 ^ 8`|`256`|
|`**`|Potencia (alias)|`2 ** 8`|`256`|

El operador `+` sobre cadenas realiza concatenación:

```
Escribir "Hola, " + "mundo"   // Hola, mundo
Escribir "Valor: " + 42       // Valor: 42
```

### 4.2 Relacionales

|Operador|Significado|
|---|---|
|`=`|Igual a|
|`==`|Igual a (alias)|
|`<>`|Distinto de|
|`!=`|Distinto de (alias)|
|`<`|Menor que|
|`>`|Mayor que|
|`<=`|Menor o igual|
|`>=`|Mayor o igual|

### 4.3 Lógicos

|Operador|Alias|Descripción|
|---|---|---|
|`Y`|`And`|Conjunción (ambos)|
|`O`|`Or`|Disyunción (alguno)|
|`No`|`Not`|Negación|

```
Si (edad >= 18) Y (tiene_id = Verdadero) Entonces
    Escribir "Acceso permitido"
FinSi
```

### 4.4 Precedencia (de mayor a menor)

1. `No` / `-` (unario)
2. `^` / `**`
3. `*`, `/`, `%`, `mod`
4. `+`, `-`
5. `<`, `>`, `<=`, `>=`, `=`, `==`, `<>`, `!=`
6. `Y` / `And`
7. `O` / `Or`

Usar paréntesis para forzar el orden deseado:

```
resultado <- (a + b) * (c - d)
```

---

## 5. Entrada y salida

### 5.1 Leer

Solicita un valor al usuario y lo almacena en una variable. Acepta múltiples variables separadas por comas.

```
Leer variable
Leer a, b, c
Leer arr[i]   // leer directamente en posición de arreglo
```

Al llamar al intérprete desde JS, los valores de `Leer` se suministran como el array `inputs`:

```js
interpreter.run(codigo, [10, 20, "hola"]);
```

### 5.2 Escribir

Imprime uno o más valores. Los valores se separan con comas y se concatenan en la salida.

```
Escribir "Hola, mundo!"
Escribir "El resultado es: ", resultado
Escribir a, " + ", b, " = ", a + b
```

Cada `Escribir` produce una línea independiente en la salida.

---

## 6. Estructuras de control

### 6.1 Condicional Si

**Forma simple:**

```
Si condicion Entonces
    // instrucciones si verdadero
FinSi
```

**Forma con alternativa:**

```
Si condicion Entonces
    // instrucciones si verdadero
Sino
    // instrucciones si falso
FinSi
```

**Anidamiento:**

```
Si nota >= 9 Entonces
    Escribir "Sobresaliente"
Sino
    Si nota >= 7 Entonces
        Escribir "Aprobado"
    Sino
        Escribir "Reprobado"
    FinSi
FinSi
```

> La palabra `Entonces` es opcional pero recomendada para mayor claridad.

---

### 6.2 Según (switch)

Evalúa una expresión y ejecuta el bloque cuyo valor coincida.

```
Segun expresion Hacer
    Sea valor1:
        // instrucciones
    Sea valor2, valor3:
        // instrucciones para cualquiera de los dos
    De Otro Modo:
        // si ningún caso coincidió
FinSegun
```

**Ejemplo:**

```
Leer dia
Segun dia Hacer
    Sea 1: Escribir "Lunes"
    Sea 2: Escribir "Martes"
    Sea 3: Escribir "Miércoles"
    Sea 4: Escribir "Jueves"
    Sea 5: Escribir "Viernes"
    Sea 6, 7: Escribir "Fin de semana"
    De Otro Modo: Escribir "Día inválido"
FinSegun
```

- `Sea` acepta múltiples valores separados por comas.
- `De Otro Modo` es el caso por defecto (opcional).
- La comparación usa igualdad no estricta (`==`), por lo que `"5"` coincide con `5`.

---

### 6.3 Mientras

Repite un bloque **mientras** la condición sea verdadera. Si la condición es falsa desde el inicio, el bloque no se ejecuta.

```
Mientras condicion Hacer
    // instrucciones
FinMientras
```

**Ejemplo — suma hasta que el usuario ingrese 0:**

```
Algoritmo SumaInteractiva
    Definir suma Como Real
    suma <- 0
    Leer n
    Mientras n <> 0 Hacer
        suma <- suma + n
        Leer n
    FinMientras
    Escribir "Total: ", suma
FinAlgoritmo
```

> El intérprete limita el número de iteraciones a **100 000** para detectar bucles infinitos.

---

### 6.4 Para

Itera una variable contadora desde un valor inicial hasta uno final.

```
Para variable <- inicio Hasta fin Hacer
    // instrucciones
FinPara
```

**Con paso personalizado:**

```
Para variable <- inicio Hasta fin ConPaso paso Hacer
    // instrucciones
FinPara
```

**Ejemplos:**

```
// Contar de 1 a 10
Para i <- 1 Hasta 10 Hacer
    Escribir i
FinPara

// Contar de 10 a 1 (paso negativo automático)
Para i <- 10 Hasta 1 Hacer
    Escribir i
FinPara

// Paso de 2 en 2
Para i <- 0 Hasta 20 ConPaso 2 Hacer
    Escribir i
FinPara

// Paso decimal
Para x <- 0.0 Hasta 1.0 ConPaso 0.25 Hacer
    Escribir x
FinPara
```

> Si no se especifica `ConPaso`, el paso es `+1` cuando `inicio <= fin`, o `-1` cuando `inicio > fin`.

---

### 6.5 Repetir...HastaQue

Ejecuta el bloque **al menos una vez** y repite mientras la condición de parada sea **falsa**. Se detiene cuando la condición es **verdadera**.

```
Repetir
    // instrucciones
HastaQue condicion
```

**Ejemplo — validar entrada:**

```
Algoritmo LeerPositivo
    Repetir
        Leer n
        Si n <= 0 Entonces
            Escribir "Ingresa un número positivo"
        FinSi
    HastaQue n > 0
    Escribir "Ingresaste: ", n
FinAlgoritmo
```

---

## 7. Arreglos

### 7.1 Declaración

```
Definir nombre Como Arreglo De Entero
```

Los arreglos en PseudoJS son dinámicos: no requieren tamaño fijo.

### 7.2 Acceso e índices

Los índices **comienzan en 1** (convención PSeInt).

```
arr[1] <- 10
arr[2] <- 20
Escribir arr[1]   // 10
```

### 7.3 Leer en arreglo

```
Leer arr[i]
```

### 7.4 Ejemplo completo — promedio de N números

```
Algoritmo Promedio
    Definir datos Como Arreglo De Real
    Leer n
    Para i <- 1 Hasta n Hacer
        Leer datos[i]
    FinPara
    suma <- 0
    Para i <- 1 Hasta n Hacer
        suma <- suma + datos[i]
    FinPara
    Escribir "Promedio: ", suma / n
FinAlgoritmo
```

### 7.5 Intercambiar elementos (patrón swap)

```
temp   <- arr[i]
arr[i] <- arr[j]
arr[j] <- temp
```

---

## 8. Funciones

### 8.1 Definición

Las funciones se declaran fuera del `Algoritmo` principal, antes o después.

```
Funcion NombreFuncion(param1, param2)
    // instrucciones
    Retornar valor
FinFuncion
```

- `Retornar` y `Devolver` son alias equivalentes.
- Los parámetros se pasan **por valor** (no modifican las variables del llamador).
- Una función sin `Retornar` devuelve `null`.

### 8.2 Llamada

```
resultado <- NombreFuncion(arg1, arg2)
```

O como sentencia (ignorando el retorno):

```
NombreFuncion(arg1, arg2)
```

### 8.3 Recursión

```
Funcion r <- Factorial(n)
    Si n <= 1 Entonces
        Retornar 1
    FinSi
    Retornar n * Factorial(n - 1)
FinFuncion

Algoritmo TestFactorial
    Leer n
    Escribir n, "! = ", Factorial(n)
FinAlgoritmo
```

> El intérprete limita la profundidad de recursión a **500 llamadas**.

### 8.4 Múltiples funciones

```
Funcion r <- Cuadrado(x)
    Retornar x * x
FinFuncion

Funcion r <- Cubo(x)
    Retornar x * Cuadrado(x)
FinFuncion

Algoritmo Potencias
    Leer n
    Escribir "Cuadrado: ", Cuadrado(n)
    Escribir "Cubo:     ", Cubo(n)
FinAlgoritmo
```

### 8.5 Alcance de variables

Cada función tiene su propio entorno de variables. Las variables definidas dentro de una función no son accesibles desde fuera.

```
Funcion r <- Doble(x)
    resultado <- x * 2    // 'resultado' es local a la función
    Retornar resultado
FinFuncion

Algoritmo Ejemplo
    r <- Doble(5)
    Escribir r          // 10
    // 'resultado' no existe aquí
FinAlgoritmo
```

---

## 9. Funciones integradas

### 9.1 Matemáticas

|Función|Descripción|Ejemplo|
|---|---|---|
|`Abs(x)`|Valor absoluto|`Abs(-5)` → `5`|
|`Raiz(x)` / `Sqrt(x)`|Raíz cuadrada|`Raiz(16)` → `4`|
|`Potencia(b, e)`|Potencia|`Potencia(2, 10)` → `1024`|
|`Piso(x)`|Redondeo hacia abajo|`Piso(3.9)` → `3`|
|`Techo(x)`|Redondeo hacia arriba|`Techo(3.1)` → `4`|
|`Trunc(x)`|Parte entera (sin redondeo)|`Trunc(-3.9)` → `-3`|
|`Redondear(x, d)`|Redondea a `d` decimales|`Redondear(3.14159, 2)` → `3.14`|
|`Max(a, b, ...)`|Máximo de varios valores|`Max(3, 7, 2)` → `7`|
|`Min(a, b, ...)`|Mínimo de varios valores|`Min(3, 7, 2)` → `2`|
|`Ln(x)`|Logaritmo natural|`Ln(2.71828)` ≈ `1`|
|`Log(x)`|Logaritmo base 10|`Log(100)` → `2`|
|`Exp(x)`|e elevado a x|`Exp(1)` ≈ `2.718`|
|`Sen(x)`|Seno (radianes)|`Sen(0)` → `0`|
|`Cos(x)`|Coseno (radianes)|`Cos(0)` → `1`|
|`Tan(x)`|Tangente (radianes)|`Tan(0)` → `0`|
|`ArcSen(x)`|Arcoseno||
|`ArcCos(x)`|Arcocoseno||
|`ArcTan(x)`|Arcotangente||

### 9.2 Aleatorios

|Función|Descripción|Ejemplo|
|---|---|---|
|`Aleatorio(a, b)`|Entero aleatorio entre `a` y `b` (inclusive)|`Aleatorio(1, 6)` → dado|
|`Azar(n)`|Entero aleatorio entre `0` y `n-1`|`Azar(100)` → 0..99|

### 9.3 Cadenas

|Función|Descripción|Ejemplo|
|---|---|---|
|`Longitud(s)` / `Len(s)`|Número de caracteres|`Longitud("Hola")` → `4`|
|`Largo(s)`|Alias de Longitud||
|`SubCadena(s, i, f)`|Extrae caracteres de posición `i` a `f` (base 1)|`SubCadena("Hola", 2, 3)` → `"ol"`|
|`Mayusculas(s)`|Convierte a mayúsculas|`Mayusculas("hola")` → `"HOLA"`|
|`Minusculas(s)`|Convierte a minúsculas|`Minusculas("HOLA")` → `"hola"`|
|`Concatenar(a, b, ...)`|Une varias cadenas|`Concatenar("Ho","la")` → `"Hola"`|

### 9.4 Conversión de tipos

|Función|Descripción|
|---|---|
|`ConvertirANumero(s)`|Convierte cadena a número|
|`ConvertirAString(n)`|Convierte número a cadena|
|`ConvertirATexto(n)`|Alias de ConvertirAString|

### 9.5 Verificación

|Función|Descripción|
|---|---|
|`EsEntero(x)`|`Verdadero` si x es entero|
|`EsReal(x)`|`Verdadero` si x es número|

---

## 10. Ejemplos completos

### 10.1 Números primos

```
Funcion r <- EsPrimo(n)
    Si n < 2 Entonces
        Retornar Falso
    FinSi
    Para i <- 2 Hasta Trunc(Raiz(n)) Hacer
        Si n mod i = 0 Entonces
            Retornar Falso
        FinSi
    FinPara
    Retornar Verdadero
FinFuncion

Algoritmo Primos
    Leer limite
    Escribir "Primos hasta ", limite, ":"
    Para n <- 2 Hasta limite Hacer
        Si EsPrimo(n) Entonces
            Escribir n
        FinSi
    FinPara
FinAlgoritmo
```

---

### 10.2 Ordenamiento burbuja

```
Algoritmo BurbujaSort
    Leer n
    Definir arr Como Arreglo De Entero
    Para i <- 1 Hasta n Hacer
        Leer arr[i]
    FinPara

    Para i <- 1 Hasta n - 1 Hacer
        Para j <- 1 Hasta n - i Hacer
            Si arr[j] > arr[j + 1] Entonces
                temp       <- arr[j]
                arr[j]     <- arr[j + 1]
                arr[j + 1] <- temp
            FinSi
        FinPara
    FinPara

    Para i <- 1 Hasta n Hacer
        Escribir arr[i]
    FinPara
FinAlgoritmo
```

---

### 10.3 Fibonacci iterativo vs recursivo

```
Funcion r <- FibRec(n)
    Si n <= 1 Entonces
        Retornar n
    FinSi
    Retornar FibRec(n - 1) + FibRec(n - 2)
FinFuncion

Funcion r <- FibIter(n)
    Si n <= 1 Entonces
        Retornar n
    FinSi
    a <- 0
    b <- 1
    Para i <- 2 Hasta n Hacer
        c <- a + b
        a <- b
        b <- c
    FinPara
    Retornar b
FinFuncion

Algoritmo TestFib
    Leer n
    Escribir "Recursivo: ", FibRec(n)
    Escribir "Iterativo: ", FibIter(n)
FinAlgoritmo
```

---

### 10.4 Menú interactivo con Repetir

```
Algoritmo Menu
    Repetir
        Escribir "=== Menú ==="
        Escribir "1. Saludar"
        Escribir "2. Despedirse"
        Escribir "3. Salir"
        Leer opcion
        Segun opcion Hacer
            Sea 1: Escribir "Hola!"
            Sea 2: Escribir "Adiós!"
            Sea 3: Escribir "Cerrando..."
            De Otro Modo: Escribir "Opción inválida"
        FinSegun
    HastaQue opcion = 3
FinAlgoritmo
```

---

### 10.5 Calculadora con funciones

```
Funcion r <- Sumar(a, b)
    Retornar a + b
FinFuncion

Funcion r <- Restar(a, b)
    Retornar a - b
FinFuncion

Funcion r <- Multiplicar(a, b)
    Retornar a * b
FinFuncion

Funcion r <- Dividir(a, b)
    Si b = 0 Entonces
        Escribir "Error: división por cero"
        Retornar 0
    FinSi
    Retornar a / b
FinFuncion

Algoritmo Calculadora
    Leer a
    Leer operador
    Leer b
    Segun operador Hacer
        Sea "+": Escribir Sumar(a, b)
        Sea "-": Escribir Restar(a, b)
        Sea "*": Escribir Multiplicar(a, b)
        Sea "/": Escribir Dividir(a, b)
        De Otro Modo: Escribir "Operador no reconocido"
    FinSegun
FinAlgoritmo
```

---

## 11. Errores comunes

### Error léxico

Ocurre cuando el intérprete encuentra un carácter que no puede tokenizar.

```
x <- 10$   // ✗ '$' no es un carácter válido
```

**Mensaje:** `[Léxico] Línea N: Carácter inesperado: '$'`

---

### Error de sintaxis

Ocurre cuando la estructura del código no sigue la gramática del lenguaje.

```
Si x > 0        // ✗ falta FinSi
    Escribir x
```

**Mensaje:** `[Sintaxis] Línea N: Se esperaba FIN_SI, encontré EOF`

---

### Error de runtime

Ocurre durante la ejecución.

```
// División por cero
Escribir 10 / 0        // ✗

// Acceso a arreglo no declarado
Escribir arr[1]        // ✗ arr no es arreglo

// Función desconocida
Escribir MiFuncion()   // ✗ no definida

// Bucle infinito
Mientras Verdadero Hacer
    // sin salida
FinMientras            // ✗ límite de 100 000 iteraciones

// Desbordamiento de pila
Funcion r <- Infinita(n)
    Retornar Infinita(n)   // ✗ límite de 500 llamadas
FinFuncion
```

---

### Entrada insuficiente

Si el programa ejecuta más `Leer` de los que se proporcionan como entrada:

```
Leer a, b, c   // pero solo se proveyeron 2 valores
```

**Mensaje:** `[Runtime] Se necesita más entrada (Leer) sin valores disponibles`

---

## 12. Referencia rápida

### Palabras clave

```
Algoritmo  FinAlgoritmo  Proceso    FinProceso
Funcion    FinFuncion    Retornar   Devolver
Leer       Escribir
Si         Entonces      Sino       FinSi
Mientras   Hacer         FinMientras
Para       Desde         Hasta      ConPaso    FinPara
Repetir    HastaQue
Segun      Sea           DeOtroModo FinSegun
Definir    Como          Arreglo    De
Entero     Real          Caracter   Logico
Verdadero  Falso
Y          O             No
Mod
```

### Plantillas de uso frecuente

```
// ── Intercambio de variables ───────────────────────────────
temp <- a
a <- b
b <- temp

// ── Suma acumulativa ───────────────────────────────────────
suma <- 0
Para i <- 1 Hasta n Hacer
    suma <- suma + arr[i]
FinPara

// ── Buscar el máximo en un arreglo ────────────────────────
maximo <- arr[1]
Para i <- 2 Hasta n Hacer
    Si arr[i] > maximo Entonces
        maximo <- arr[i]
    FinSi
FinPara

// ── Contar elementos que cumplen una condición ────────────
contador <- 0
Para i <- 1 Hasta n Hacer
    Si arr[i] > umbral Entonces
        contador <- contador + 1
    FinSi
FinPara

// ── Validar entrada con Repetir ───────────────────────────
Repetir
    Leer valor
HastaQue valor >= 0 Y valor <= 100

// ── Usar función con resultado ────────────────────────────
Funcion resultado <- NombreFuncion(parametro)
    // cuerpo
    Retornar valor
FinFuncion

resultado <- NombreFuncion(argumento)
```

### Uso desde JavaScript

```js
// Importar (Node.js)
const interpreter = require('./pseudojs');

// Ejecutar con entradas
const resultado = interpreter.run(`
Algoritmo Suma
    Leer a, b
    Escribir a + b
FinAlgoritmo
`, [10, 32]);

console.log(resultado.output);      // ["42"]
console.log(resultado.inputsUsed);  // 2

// Si hay un error
if (resultado.error) {
    console.error(resultado.error);
}
```

**Estructura del objeto devuelto:**

```js
{
    output: string[],   // líneas producidas por Escribir
    inputsUsed: number  // cuántos valores de Leer se consumieron
}

// En caso de error:
{
    error: string,      // mensaje de error
    output: []
}
```

---

_Manual generado para PseudoJS v1.0 — intérprete JS de pseudocódigo estilo PSeInt._