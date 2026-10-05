<p align="center">
  <h1 align="center">@devlsh/astar-demo</h1>
  <p align="center">Visual demonstration of A* pathfinding with elevation support.</p>
</p>

<br />

The demo shows A* finding a route across a grid with obstacles and elevation. The green circle marks the start, the coral diamond marks the end, and the gold line shows the path.

Painting the grid changes the terrain or moves the endpoints, and the route updates using the selected search options.

## Try It

Open the [interactive demo](https://astar.devlsh.com).

Select a `Paint` tool, then press or drag across the canvas to edit the map.

Use the controls to change the demonstration:

- **Paint:** Select `Obstacle` to block cells, `Erase` to remove obstacles and elevation, or `Elevation` to apply `Paint elevation`, from 0 through 3. Select `Start` or `End` to move the endpoints to distinct, unblocked cells.
- **Search:** Adjust `Diagonal moves` and `Cut corners` to change diagonal movement. Adjust `Max elevation step`, from 0 through 3, to limit the elevation change per move. Select `Diagonal` or `Manhattan` with `Heuristic`.
- **Path:** Shows the move count or `No route` when no path is found.
- **Clear terrain:** Select this button to remove all obstacles and elevation.
- **Reset map:** Select this button to restore the initial terrain and endpoints.

Endpoints cannot be blocked. `No route` clears the previous path. Clearing terrain and resetting the map preserve search options.

---

> [devlsh.com](https://devlsh.com) &nbsp;&middot;&nbsp;
> GitHub: [@devlsh](https://github.com/devlsh) &nbsp;&middot;&nbsp;
> X: [@itsdevlsh](https://x.com/itsdevlsh)
