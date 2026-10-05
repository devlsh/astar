import { GUI } from 'lil-gui';
import { defaults, type Settings } from './config';

interface Actions {
  change: () => void;
  reset: () => void;
  clear: () => void;
}

function elevation(value: number, fallback: number) {
  return Number.isFinite(value) ? Math.round(Math.max(0, Math.min(3, value))) : fallback;
}

/**
 * Shares settings with the map and clamps numeric input before notifying its owner.
 * The owner destroys this GUI before the map. The status display borrows settings.
 */
export function createControls(settings: Settings, actions: Actions) {
  const gui = new GUI({
    title: 'A* Playground',
    width: 264,
  });

  const constrained = window.matchMedia('(width < 720px)');

  gui.add(settings, 'tool', ['Obstacle', 'Erase', 'Elevation', 'Start', 'End']).name('Paint');
  gui.add(settings, 'elevation', 0, 3, 1).name('Paint elevation');

  const search = gui.addFolder('Search');
  search.add(settings, 'diagonal').name('Diagonal moves');
  search.add(settings, 'cutCorners').name('Cut corners');
  search.add(settings, 'stepHeight', 0, 3, 1).name('Max elevation step');
  search
    .add(settings, 'heuristic', {
      Diagonal: 'diagonal',
      Manhattan: 'manhattan',
    })
    .name('Heuristic');

  gui.add(settings, 'status').name('Path').disable().listen();
  gui.add({ reset: actions.reset }, 'reset').name('Reset map');
  gui.add({ clear: actions.clear }, 'clear').name('Clear terrain');

  gui.onChange(() => {
    settings.elevation = elevation(settings.elevation, defaults.elevation);
    settings.stepHeight = elevation(settings.stepHeight, defaults.stepHeight);
    actions.change();

    for (const controller of gui.controllersRecursive()) {
      controller.updateDisplay();
    }
  });

  function collapse() {
    if (constrained.matches) {
      gui.close();
    }
  }

  collapse();
  constrained.addEventListener('change', collapse);

  function destroy() {
    constrained.removeEventListener('change', collapse);
    gui.destroy();
  }

  return { destroy };
}
