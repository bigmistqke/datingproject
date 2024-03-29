const { unflatten } = require('flat');

function DatabaseManager({ _mongo, _redis }) {
  this.init = async () => {
    await _redis.init();
    await _mongo.init();
  }

  // SCRIPT

  this.saveScript = async ({ script_id, script }) =>
    await _mongo.getCollection('scripts').updateDocument({ script_id }, script)

  this.getScript = async (script_id) => _mongo.getCollection('scripts')
    .findDocument({ script_id });

  this.deleteScript = async (script_id) => _mongo.getCollection('scripts')
    .deleteDocument({ script_id });

  this.getAllScripts = async () => _mongo.getCollection('scripts').dump()


  this.testScript = async ({ script_id, script }) => {
    let { room_url, room } = await this.room.create({ script, script_id });
    let roles = {};
    Object.entries(room.roles).map(
      ([player_id, role]) =>
        roles[player_id] = { role_id: role.role_id, instructions: role.instructions }
    );
    return { roles, room_url }
  }

  this.convertAllScripts = async () => {
    let keys = await _redis.getAllKeys();
    //console.log(keys);
    if (!keys) return;
    let script_keys = keys.filter(key => key.indexOf('_temp') != -1);

    let script_ids = [];
    script_keys.forEach(script_key => {
      let id = script_key.split('_')[1];
      if (script_ids.indexOf(id) == -1)
        script_ids.push(id);
    })
    //console.log(script_ids);

    let scripts = {};
    for (let script_id of script_ids) {
      //console.log('find', await _mongo.getCollection('scripts').findDocument({ script_id }))
      if (!await _mongo.getCollection('scripts').findDocument({ script_id })) {
        let blocks = Object.values(unflatten(await _redis.get(`s_${script_id}_temp_blocks`)));
        let instructions = unflatten(await _redis.get(`s_${script_id}_temp_instructions`), true);
        let roles = unflatten(await _redis.get(`s_${script_id}_temp_roles`), true);
        //console.log({ blocks, instructions, roles });
        scripts[script_id] = {
          blocks, instructions, roles, script_id
        }
        await _mongo.getCollection('scripts').insertDocument({ blocks, instructions, roles, script_id })
      }

    }

    //console.log(scripts);

    return scripts;

  }

  // CARD

  this.saveDesign = async ({ design, design_id }) => {

    _mongo.getCollection('cards').updateDocument({ card_id: design_id }, { modified: new Date().getTime(), design });

  }

  this.getDesign = async ({ design_id }) => {
    // TODO: check cache
    console.log('get the deck with card_id ', design_id)
    let data = await _mongo.getCollection('cards').findDocument({ card_id: design_id });
    if (!data) return false;
    return data
  }

  this.getAllDesigns = async () => await _mongo.getCollection('cards')

  this.saveStats = async ({ room_id, role_id, stats }) => {
    try {
      console.log("saveStats", room_id, role_id, stats)
      _mongo.getCollection('stats').pushDocument(
        { room_id },
        { [role_id]: stats }
      );
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }

  }

  this.initStats = async ({ room_id, script_id, role_ids }) => {
    if (!role_ids) {
      console.error('role_ids are undefined while trying to initStats');
      return;
    }
    _mongo.getCollection('stats').updateDocument(
      { room_id },
      {
        room_id,
        script_id,
        ...Object.fromEntries(role_ids.map(id => [id, []]))
      }
    );
  }
}





module.exports = DatabaseManager;