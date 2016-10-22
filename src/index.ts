"use strict";

import 'es6-shim';
import * as Rx from 'rxjs';
import { Renderer, h } from './render';

type Cell = boolean;
type Field = Cell[][];

const range = (n: number) => Array.from(Array(n).keys());

const fieldFactory = (): Field => range(100).map(() => range(100).map(() => Math.random() > 0.75));

const renderer = new Renderer();
renderer.mount(document.getElementById('container'), h('div', [h('button.button', 'start')]));

const button = document.querySelector('button.button');

const render = (field: Field ) => {
  const vnode = h('div', [
    h('button.button', 'start/stop'),
    h('div.field', field.map(row => (
      h('div.row', row.map(cell => h(`div.cell${cell ? '--active' : ''}`, '')))
    )))
  ]);
  renderer.update(vnode);
}

const isAlive = (field: Field, i:number, j:number):Cell => {
  const counter = (f: Field, i:number, j:number) => {
    if (typeof f[i] === 'undefined') return 0;
    return ~~(f[i][j]);
  };
  const count = counter(field, i-1, j-1) +
    counter(field, i-1, j) +
    counter(field, i-1, j+1) +
    counter(field, i, j-1) +
    counter(field, i, j+1) +
    counter(field, i+1, j-1) +
    counter(field, i+1, j) +
    counter(field, i+1, j+1);
  if (count === 3 || (count === 2 && field[i][j])) return true;
  return false
};

const input$ = Rx.Observable
  .fromEvent(button, 'click')
  .scan((started: boolean, event: MouseEvent) => !started, false)
  .distinctUntilChanged()
  .delay(new Date(Date.now() + 1000))

const ticker$ = Rx.Observable.interval(500);

const game = Rx.Observable
  .combineLatest(input$, ticker$, (input$) => input$)
  .filter((started: boolean) => started)
  .scan((field: Field) => (
    field.map((row, i) => row.map((cell, j) => isAlive(field, i , j)))
  ), fieldFactory())
  .subscribe(render);
