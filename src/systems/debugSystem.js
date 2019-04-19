const dat = require("dat.gui");

const debug = require("debug")("systems:debug-panels");

/**
 * This adds in some panels for each of the entities that have names.
 * We also add one in for the physics and rendering engines (but these
 * are not comprehensive as some of them require wrapping other objects
 * to work).
 */
export function debugPanelSystem(entityManager, threeScene, cannonWorld) {
  if (!debug.enabled) return;

  const entityPanel = new dat.GUI({ name: "Entities" });
  entityManager.findByComponent("model").forEach(entity => {
    const folder = entityPanel.addFolder(entity.id);
    folder.add(entity, "model");
    folder.add(entity.transform.position, "x");
    folder.add(entity.transform.position, "y");
    folder.add(entity.transform.position, "z");
  });

  // const gameWorldPanel = new dat.GUI({ name: "Game World" });
}
