import Emitter from '../helpers/Emitter'

export default function ConnectionManager(blockManager) {
    Emitter.call(this);
    let _updating = {
        block: '',
        role_id: '',
        direction: ''
    }

    this.start = (block, role_id, direction) => {
        _updating = {
            block: block,
            role_id: role_id,
            direction: direction === 'in' ? 'prev' : 'next'
        }
        dispatch('start');
        document.body.addEventListener("pointermove", move);
        document.body.addEventListener("pointerup", end);
    }

    const dispatch = (type, data = null) => {
        let event = new CustomEvent(type, { detail: data });
        this.dispatchEvent(event);
    }

    const dispatchUpdate = (block, direction, data) => {
        dispatch(
            'update',
            {
                block: block,
                role_id: _updating.role_id,
                direction: direction,
                data: data
            }
        );
    }

    const dispatchAdd = (block_id, direction, data) => {
        dispatch(
            'add',
            {
                block_id: block_id,
                role_id: _updating.role_id,
                direction: direction,
                data: data
            }
        );
    }


    const move = (e) => {
        dispatchUpdate(_updating.block, _updating.direction, { x: e.clientX, y: e.clientY });
    }

    const end = async (e) => {

        document.body.removeEventListener("pointermove", move);
        document.body.removeEventListener("pointerup", end);

        dispatch('end');

        if (e.target.classList.contains("block")) {
            let this_id = _updating.block.block_id;
            let connecting_id = e.target.id.replace('block_', '');

            if (this_id !== connecting_id) {
                dispatchUpdate(_updating.block, _updating.direction, connecting_id);
                dispatchAdd(connecting_id, (_updating.direction === 'next' ? 'prev' : 'next'), this_id);
            } else {
                dispatchUpdate(_updating.block, _updating.direction, null);
            }
        } else {
            dispatchUpdate(_updating.block, _updating.direction, null);
        }
    }
}