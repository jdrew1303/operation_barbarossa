const CANNON = require("cannon");
const THREE = require("three");

const { threeToCannon } = require("three-to-cannon");

const debug = require("debug")("systems:load-models");

export function modelLoadingSystem(entityManager, threeScene, cannonWorld) {
  require("three/examples/js/loaders/OBJLoader");
  require("three/examples/js/loaders/MTLLoader");

  // TODO
  // // monkey patch our world object to be able to find the
  // // objects by entity id. This will allow us to specifically
  // // reference all objects in the system by id and look them
  // // up instead of passing them around. Almost every system
  // // will require access to the entity manager and the rederable
  // // or physical worlds, keeping them as the source of thruths.
  // cannonWorld.__entityById = new WeakMap();
  // cannonWorld.setObjectByEntityId = cannonWorld.__entityById.set;
  // cannonWorld.getObjectByEntityId = entityId =>
  //   cannonWorld.__entityById.get(entityId);

  // threeScene.__entityById = new WeakMap();
  // threeScene.setObjectByEntityId = threeScene.__entityById.set;
  // threeScene.getObjectByEntityId = entityId =>
  //   threeScene.__entityById.get(entityId);

  // now we find all renderable components and
  entityManager.findByComponent("model").forEach(entity => {
    debug("loading model %s for entity id %d", entity.model, entity.id);
    new THREE.MTLLoader()
      .setPath("../src/models/")
      .load(`/${entity.model}.mtl`, materials => {
        materials.preload();
        new THREE.OBJLoader()
          .setMaterials(materials)
          .setPath("../src/models/")
          .load(`/${entity.model}.obj`, mesh => {
            debug(
              "recieved mesh model %s for entity id %d",
              entity.model,
              entity.id
            );
            // creating meshes
            const threeRenderableMesh = mesh;
            const cannonPhysicsMesh = new CANNON.Body({
              shape: threeToCannon(mesh, { type: threeToCannon.Type.HULL }),
              mass: entity.mass || 1
            });

            // add a unique name to tie entity, three and cannon mesh
            // together for lookups. In future it means we can keep our
            // entities as just data. Might be worth storing these in a
            // WeakMap (that way it should clear up after itself once its
            // finished with the model)
            const entityIdentifier = entity.id;
            threeRenderableMesh.name = entityIdentifier;
            cannonPhysicsMesh.name = entityIdentifier;

            // add meshes to their respective worlds
            threeScene.add(threeRenderableMesh);
            cannonWorld.add(cannonPhysicsMesh);
            debug(
              `finished loading mesh of type ${entity.model} for ${entity.id}`
            );
          });
      });
  });
}
