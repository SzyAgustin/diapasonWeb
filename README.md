# Diapasón CAGED

Aplicación web para visualizar las formas del **sistema CAGED** de cualquier
acorde (mayor o menor) sobre el diapasón de una guitarra de 24 trastes en
afinación estándar (E A D G B E).

## Cómo funciona

1. Elegí la **nota** fundamental (A, A#, B, C, …).
2. Elegí el **tipo**: Mayor o Menor.
3. Elegí una **forma CAGED** (C, A, G, E o D) para resaltar esa forma en su
   posición correcta sobre el mástil, o dejá **Todas** para ver todas las notas
   del acorde a lo largo de todo el diapasón.
4. Con el toggle **Etiqueta** elegís ver el nombre de la nota o el intervalo
   (R = fundamental, 3 / ♭3 = tercera, 5 = quinta). La fundamental siempre queda
   resaltada.

Por ejemplo: seleccionando **Am** + forma **C** se resalta la forma de Do (del
sistema CAGED) del acorde de La menor en la posición correcta del mástil.

## El sistema CAGED

CAGED parte de las cinco formas de acordes al aire (C, A, G, E, D). Cada forma
es móvil: trasladándola a lo largo del mástil podés tocar cualquier acorde. Las
cinco formas, en orden ascendente, encajan una con otra cubriendo todo el
diapasón. Las formas menores se obtienen bajando la tercera un semitono
(algunas, como la de C y la de G menor, omiten una cuerda por comodidad).

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción
npm run lint     # linter
```

## Stack

React 19 + TypeScript + Vite.
# diapasonWeb
