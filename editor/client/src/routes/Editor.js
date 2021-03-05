import React, { useState, useEffect, useRef, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    atom,
    useRecoilState
} from 'recoil';
// import { useBeforeunload } from 'react-beforeunload';


import copy from 'copy-to-clipboard';

import getData from "../helpers/getData";
import postData from "../helpers/postData";

import Map from '../components/Map';
import ProgressBars from '../components/ProgressBars';

import DataProcessor from '../managers/DataProcessor';
import BlockManager from '../managers/BlockManager';
import InstructionManager from '../managers/InstructionManager';
import VideoUploader from '../managers/VideoUploader';

import Overlays from "../components/Overlays"

const _instructionManager = atom({ key: 'instructionManager', default: '' });
const _blockManager = atom({ key: 'blockManager', default: '' });
const _videoUploader = atom({ key: 'videoUploader', default: false });
const _setRender = atom({ key: 'setRender', default: performance.now() });


// const _overlayManager = atom({ key: 'overlayManager', default: '' });

function decodeSingleQuotes(text) {
    return (text.replace(/&#039;/g, "'"));
}

window.cursorPosition = {};
window.addEventListener('mousemove', e => {
    window.cursorPosition = { x: e.clientX, y: e.clientY };
})



function Editor({ socket, user_id }) {
    const history = useHistory();

    const { script_id } = useParams();



    const [ctrl, setCtrl] = useState(false);
    const [shift, setShift] = useState(false);
    const [roles, setRoles] = useState([]);
    const [connecting, setConnecting] = useState(false);
    const [overlay, setOverlay] = useState(false);

    const [render, setRender] = useRecoilState(_setRender);
    const [instructionManager, setInstructionManager] = useRecoilState(_instructionManager);
    const [blockManager, setBlockManager] = useRecoilState(_blockManager);
    const [videoUploader, setVideoUploader] = useRecoilState(_videoUploader);

    const [blocks, setBlocks] = useState([]);

    const r_blocks = useRef();
    const r_roles = useRef();
    const r_instructions = useRef();
    const r_dataProcessor = useRef();
    const r_errors = useRef({});
    const r_blockManager = useRef();
    const r_cursor = useRef();
    const hasChanges = useRef(false);


    const openOverlay = async function ({ type, data }) {
        return new Promise((_resolve) => {
            const resolve = (data) => {
                _set.overlay(false);
                _resolve(data);
            }
            _set.overlay({ type, data, resolve })
        })
    }

    const getOverlay = (overlay) => {
        // return OverlayManager.get(overlay.type, overlay);
        return Overlays[overlay.type](overlay);
    }
    function throttle(func, timeFrame) {
        var lastTime = 0;
        return function () {
            var now = new Date();
            if (now - lastTime >= timeFrame) {
                func();
                lastTime = now;
            }
        };
    }


    const _get = {
        instructions: () => { return { ...r_instructions.current } },
        blocks: () => [...r_blocks.current],
        roles: () => [...r_roles.current],
        errors: () => [...r_errors.current],
        all: () => {
            return {
                instructions: _get.instructions(),
                blocks: _get.blocks(),
                roles: _get.roles()
            }
        }
    }

    const _set = {
        blocks: (_blocks) => {
            r_blocks.current = _blocks;
            // setBlocks(_blocks);
            throttle(setRender(performance.now()), 10);
            hasChanges.current = true;
        },
        instructions: (_instructions) => {
            r_instructions.current = _instructions;
            throttle(setRender(performance.now()), 10);
            hasChanges.current = true;
        },
        roles: (_roles) => {
            r_roles.current = _roles;
            throttle(setRender(performance.now()), 10);
            hasChanges.current = true;
        },
        errors: (_errors) => {
            r_errors.current = _errors;
            setRender(performance.now());
        },
        connecting: (bool) => setConnecting(bool),
        overlay: (bool) => setOverlay(bool)
    }

    // useBeforeunload((event) => 'ok?');


    useEffect(() => {
        if (!videoUploader) return
        console.log("VIDEO UPLOADER JEEEE!!!");
        console.log(videoUploader, videoUploader.isUploading());

        window.addEventListener('beforeunload', (e) => {
            if (!videoUploader.isUploading() && !hasChanges.current) return
            e.preventDefault();
            // if (!videoUploader.isUploading()) return
            alert('please wait until all videos are uploaded');
        })
    }, [videoUploader])

    const init = () => {

        r_dataProcessor.current = new DataProcessor();

        setBlockManager(new BlockManager({ _get, _set, script_id, visualizeErrors, openOverlay }));
        setInstructionManager(new InstructionManager({ _get, _set, script_id }));
        setVideoUploader(new VideoUploader({ script_id }));
        // updateBlocks([...blocks]);


        document.body.addEventListener('mousemove', (e) => { r_cursor.current = { x: e.clientX, y: e.clientY } });


        getData(`${window._url.fetch}/api/get/${script_id}/temp`)
            .then(res => res.json())
            .then(res => {
                if (!res) return Promise.reject('errrr');
                // clean instructions 
                // (delete all instructions which are not inside a block)
                /* console.log('jajajaja');
                console.log('before clean', Object.keys(res.instructions).length);
                for (let instruction_id in res.instructions) {
                    // console.log(instruction_id, res.instructions[instruction_id].text);
                    let isClean = res.blocks.find(block => block.instructions.indexOf(instruction_id) != -1);
                    // console.log(instruction_id, isClean);
                    if (!!!isClean) {
                        delete res.instructions[instruction_id];
                    }
                }
                console.log('after clean', Object.keys(res.instructions).length); */


                console.log(res);
                _set.instructions(res.instructions);
                _set.blocks(res.blocks);
                _set.roles([{ role_id: 'a' }, { role_id: 'b' }]);
                hasChanges.current = false;
            })
            .catch(err => {
                r_instructions.current = {};
                r_blocks.current = [];
                r_roles.current = [{ role_id: 'a' }, { role_id: 'b' }];
            });
    }

    const initMqtt = () => {
        if (!socket) return
        socket.subscribe(`/usr/${user_id}/connected`, () => {
            socket.subscribe(`/editor/${script_id}/update`, updateData);
        })
        socket.send('/connect', JSON.stringify({ user_id, script_id }));
        window.addEventListener('beforeunload', () => {
            socket.send('/disconnect', JSON.stringify({ user_id, script_id }));
        })
    }

    // placeholder for update over mqtt
    const updateData = (data) => {
        try {
            let data = JSON.parse(data);
            console.log(data);
        } catch (e) {
            console.error(e);
        }
    }

    const visualizeErrors = async () => {
        let check = await r_dataProcessor.current.checkConnections({ ..._get.all() });
        let _errors = {};
        if (!check.success) {
            _errors = check.errors;
        }
        _set.errors(_errors);
    }

    const test = async () => {
        try {
            const processed_data = await r_dataProcessor.current.process({ safe: true, ..._get.all() });
            if (!processed_data.success) return
            const response = await postData(`${window._url.fetch}/api/save/${script_id}/test`, processed_data);

            let room = await postData(`${window._url.fetch}/api/createRoom/${script_id}/test`);
            room = await room.json();
            console.log(room);
            const { role_data, room_id } = room;
            let options = {};
            for (let role_id in role_data) {
                console.log(role_id, role_data[role_id]);
                options[role_id] = ['open link', 'share link'];
            }
            options['combo'] = ['open link']
            console.log('options', options);
            const callback = async (data) => {
                if (!data) {
                    console.log('delete room!');
                    let data = await fetch(`${window._url.fetch}/api/deleteRoom/${room_id}`);
                    setOverlay(false);
                }
                if (data.title === 'combo') {
                    let url = `${window.location.protocol + '//' + window.location.host}/test/${room_id}`;
                    window.open(url)

                } else {
                    const { title: role_id, option } = data;
                    let url = `${window._url.play}/${role_data[role_id]}`;
                    console.log(option);
                    switch (option) {
                        case 'open link':
                            window.open(url)
                            break;
                        case 'share link':
                            copy(url);
                            console.log('copied to clipboard');


                    }
                }

            }
            _set.overlay({
                type: 'option_groups',
                data: { title: 'open/share the test urls', options }
                , resolve: callback
            })




            // console.log(result);


            console.log(room);
        } catch (e) {
            console.error(e);
        }

    }

    const save = async () => {
        let data = await r_dataProcessor.current.process({ safe: false, ..._get.all() });
        if (!data.success) return
        data = await postData(`${window._url.fetch}/api/save/${script_id}/temp`, { ...data });
        hasChanges.current = false;
    }

    const publish = async () => {
        console.log(_get.all());
        let data = await r_dataProcessor.current.process({ safe: true, ..._get.all() });
        console.log(data);
        if (!data.success) return
    }


    const keyUp = (e) => {
        setCtrl(false);
    }
    const keyDown = (e) => {
        if (e.ctrlKey || e.metaKey) {
            setCtrl(true);
        }
        if (e.shiftKey) {
            setShift(true);
        }
    }

    useEffect(() => {
        document.body.addEventListener("keydown", keyDown);
        document.body.addEventListener("keyup", keyUp);
    }, [])


    useEffect(init, [script_id]);

    useEffect(initMqtt, [socket])

    return (
        <div className="App" >
            <header className="row fixed flex">
                <div className="flexing">editor for script {script_id}</div>
                {/* <button onClick={() => visualizeErrors()} className="Instruction-button">debug</button> */}
                <button onClick={() => test()} className="Instruction-button">test</button>
                <button onClick={() => save()} className="Instruction-button">save</button>
                <button onClick={() => publish()} className="Instruction-button">publish</button>
            </header>
            {
                overlay ?
                    <div
                        className="overlay-container"
                        onMouseDown={(e) => { if (Array.from(e.target.classList).indexOf('overlay-container') != -1) overlay.resolve(false) }}
                    >
                        {getOverlay(overlay)}
                    </div> : null
            }

            <Map
                instructions={r_instructions.current}
                blocks={r_blocks.current}
                // blocks={blocks}
                roles={r_roles.current}
                script_id={script_id}
                connecting={connecting}
                errors={r_errors.current}
            ></Map>
            <ProgressBars></ProgressBars>
        </div >
    );
}
export default Editor;