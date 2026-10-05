import { Application } from 'pixi.js';
import { colors, defaults } from './config';
import { createControls } from './controls';
import { createMap } from './map';
import { createViewport } from './viewport';

/**
 * Owns one application, canvas, GUI, map, and listener set until abort.
 * Retain the AbortController for HMR. An abort during init prevents canvas attachment.
 */
export async function init(host: HTMLElement, signal: AbortSignal) {
  if (signal.aborted) {
    return;
  }

  const app = new Application();

  await app.init({
    resolution: Math.min(window.devicePixelRatio ?? 1, 4),
    backgroundColor: colors.background,
    autoDensity: true,
    roundPixels: true,
    antialias: false,
    autoStart: false,
    resizeTo: window,
  });

  if (signal.aborted) {
    app.destroy({ removeView: true }, { children: true });

    return;
  }

  const settings = { ...defaults };
  let map: ReturnType<typeof createMap> | undefined;
  let viewport: ReturnType<typeof createViewport> | undefined;
  let gui: ReturnType<typeof createControls> | undefined;
  let dirty = true;
  let disposed = false;

  function update() {
    viewport?.fit();

    if (dirty) {
      map?.refresh();
      dirty = false;
    }
  }

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;
    signal.removeEventListener('abort', dispose);
    app.ticker.remove(update);
    viewport?.destroy();
    gui?.destroy();
    map?.destroy();
    app.destroy({ removeView: true }, { children: true });
  }

  try {
    map = createMap(settings);
    app.stage.addChild(map.world);
    host.appendChild(app.canvas);
    viewport = createViewport(map.world, app.screen, app.canvas, (cell) => {
      map?.edit(cell);
      dirty = true;
    });
    gui = createControls(settings, {
      change() {
        dirty = true;
      },
      reset() {
        map?.reset();
        dirty = true;
      },
      clear() {
        map?.clear();
        dirty = true;
      },
    });

    signal.addEventListener('abort', dispose, { once: true });
    update();
    app.ticker.add(update);
    app.start();
  } catch (error) {
    dispose();
    throw new Error('Demo setup failed.', { cause: error });
  }
}
