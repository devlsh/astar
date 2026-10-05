import { type Container, type Rectangle } from 'pixi.js';
import { type Vector } from '../../src';
import { board } from './config';

/**
 * Fits the fixed grid independently of renderer size and maps client input through that fit.
 * Call fit each frame. Destroy listeners before removing the canvas or world.
 */
export function createViewport(
  world: Container,
  screen: Rectangle,
  canvas: HTMLCanvasElement,
  edit: (cell: Vector) => void,
) {
  let width = 0;
  let height = 0;
  let painting = false;
  let previous: string | undefined;

  function fit() {
    if (width === screen.width && height === screen.height) {
      return;
    }

    width = screen.width;
    height = screen.height;

    // Reserve the floating GUI beside the grid, or its collapsed header above it.
    const right = width >= 720 ? 296 : 24;
    const top = width >= 720 ? 24 : 60;
    const availableWidth = Math.max(1, width - 24 - right);
    const availableHeight = Math.max(1, height - top - 24);
    const scale = Math.min(availableWidth / board.columns, availableHeight / board.rows);

    world.scale.set(scale);
    world.position.set(
      24 + (availableWidth - board.columns * scale) / 2,
      top + (availableHeight - board.rows * scale) / 2,
    );
  }

  function paint(event: PointerEvent) {
    fit();

    const bounds = canvas.getBoundingClientRect();

    if (bounds.width <= 0 || bounds.height <= 0) {
      return;
    }

    const x = Math.floor((((event.clientX - bounds.left) * screen.width) / bounds.width - world.x) / world.scale.x);
    const y = Math.floor((((event.clientY - bounds.top) * screen.height) / bounds.height - world.y) / world.scale.y);

    if (x < 0 || y < 0 || x >= board.columns || y >= board.rows) {
      previous = undefined;

      return;
    }

    const cell = `${x},${y}`;

    if (cell !== previous) {
      previous = cell;
      edit([x, y]);
    }
  }

  function stop() {
    painting = false;
    previous = undefined;
  }

  function start(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) {
      return;
    }

    painting = true;
    previous = undefined;
    paint(event);
  }

  function move(event: PointerEvent) {
    if (painting && event.isPrimary && (event.buttons & 1) !== 0) {
      paint(event);
    } else {
      stop();
    }
  }

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointerleave', stop);
  canvas.addEventListener('pointercancel', stop);
  window.addEventListener('blur', stop);

  function destroy() {
    canvas.removeEventListener('pointerdown', start);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', stop);
    canvas.removeEventListener('pointerleave', stop);
    canvas.removeEventListener('pointercancel', stop);
    window.removeEventListener('blur', stop);
    stop();
  }

  return {
    fit,
    destroy,
  };
}
