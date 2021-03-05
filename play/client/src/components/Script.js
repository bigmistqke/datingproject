import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useHistory } from "react-router-dom";

import { NormalCard, CardMasks } from "./CardTemplates";
import getData from '../helpers/getData';

import isMobile from "is-mobile";

var uniqid = require('uniqid');
let not_subscribed = true;


function Script({ socket, user_id }) {
    const history = useHistory();
    let { role_url, unsafe } = useParams();

    let [instructions, setInstructions] = useState();
    let r_instructions = useRef();
    let r_room_id = useRef('');
    let r_role_id = useRef('');

    let r_overlay = useRef();
    let r_isMobile = useRef(-1);

    let [fullscreen, setFullscreen] = useState(false);

    let r_videos = useRef({});

    let [progress, setProgress] = useState(0);
    let [render, setRender] = useState(performance.now());

    let r_receivedSwipes = useRef([]);
    let r_unconfirmedUpdates = useRef([]);

    const preloadVideos = async (instructions) => {
        let promises = [];
        let progresses = {};

        const updateProgress = () => {
            let total_progress = Object.values(progresses).reduce((a, b) => a + b, 0) / Object.values(progresses).length;
            setProgress(parseInt(total_progress));
        }
        console.log(instructions);
        for (let instruction of instructions) {
            console.log('check: ', instruction.type);

            if (instruction.type === 'video') {
                console.log('preload: ', instruction);

                let _p = new Promise((resolve) => {
                    /* let video = document.createElement('video');
                    video.src = `${window._url.fetch}${instruction.text}`;
                    r_videos.current[instruction.instruction_id] = video;
                    resolve() */
                    var xhrReq = new XMLHttpRequest();
                    xhrReq.open('GET', `${window._url.fetch}${instruction.text}`, true);
                    xhrReq.responseType = 'blob';
                    xhrReq.onload = function () {
                        if (this.status === 200) {
                            let video = document.createElement('video');
                            video.src = URL.createObjectURL(this.response);
                            r_videos.current[instruction.instruction_id] = video;
                            resolve();
                        }
                    }
                    xhrReq.onerror = function () {
                        console.log('err', arguments);
                    }
                    xhrReq.onprogress = function (e) {
                        if (e.lengthComputable) {
                            const percentComplete = ((e.loaded / e.total) * 100 | 0) + '%';
                            progresses[instruction.instruction_id] = parseInt(percentComplete);
                            updateProgress();
                        }
                    }
                    xhrReq.send();
                })
                promises.push(_p)
            }
        }
        return Promise.all(promises);

    }

    let initAlarm = () => {
        let alarm = document.createElement('audio');
        alarm.src = `${window._url.fetch}/api/system/ping.mp3`;
        alarm.addEventListener('loadeddata', () => {
            window.alarm = alarm;
        })
        // alarm.play();
    }

    let init = async () => {
        // initAlarm();
        window.isUnsafe = unsafe ? true : false;
        r_isMobile.current = isMobile();
        if (r_isMobile.current) document.getElementsByTagName('html')[0].classList.add('isMobile');
        if (!socket) return
        // get data via express
        const result = await fetch(`${window._url.fetch}/api/joinRoom/${role_url}`);
        if (!result) {
            console.error('could not fetch instructions: double check the url');
            return false;
        }

        const { instructions, room_id, role_id } = await result.json();

        await preloadVideos(instructions)

        r_instructions.current = instructions;

        setInstructions(performance.now());

        r_room_id.current = room_id;
        r_role_id.current = role_id;

        socket.subscribe(`/${room_id}/${role_id}/swipe`, receiveSwipedCard);
        socket.subscribe(`/${room_id}/${role_id}/confirmation`, receiveConfirmation);

        socket.send('/connect', role_id);

        window.addEventListener('beforeunload', () => {
            socket.send('/disconnect', JSON.stringify({ user_id, room_id }));
        })
    }

    useEffect(() => {
        init();
    }, [socket])

    let removeInstruction = (instruction_id) => {
        let _instructions = [...r_instructions.current];
        _instructions = _instructions.filter(v => v.instruction_id !== instruction_id);
        r_instructions.current = _instructions;
        setRender(performance.now());
    }

    let sendSwipedCardToNextRoleIds = (instruction_id, next_role_ids) => {
        next_role_ids.forEach(next_role_id => {
            socket.send(`/${r_room_id.current}/${next_role_id}/swipe`, JSON.stringify({ role_id: r_role_id.current, instruction_id }));
            r_unconfirmedUpdates.current[`${next_role_id}_${instruction_id}`] = setInterval(() => {
                console.error(`extra update sent to ${next_role_id} for instruction ${instruction_id} from ${r_role_id.current}`)
                socket.send(`/${r_room_id.current}/${next_role_id}/swipe`, JSON.stringify({ role_id: r_role_id.current, instruction_id }));
            });
        })


    }

    let receiveConfirmation = (json) => {
        try {
            let { instruction_id, role_id } = JSON.parse(json);
            clearInterval(r_unconfirmedUpdates.current[`${role_id}_${instruction_id}`]);
            delete r_unconfirmedUpdates.current[`${role_id}_${instruction_id}`];
        } catch (e) {
            console.error(e);
        }
    }

    let receiveSwipedCard = (json) => {
        try {
            let { instruction_id, role_id } = JSON.parse(json);
            socket.send(`/${r_room_id.current}/${role_id}/confirmation`, JSON.stringify({ instruction_id, role_id: r_role_id.current }));

            if (r_receivedSwipes.current.indexOf(instruction_id) == -1) {

                r_receivedSwipes.current.push(instruction_id);

                let _instructions = [...r_instructions.current];
                let _instruction = false;
                for (let v of _instructions) {
                    if (v.prev_instruction_ids.indexOf(instruction_id) !== -1) {
                        _instruction = v;
                        break;
                    }
                }


                if (!_instruction) console.error('could not find card', instruction_id);

                if (!!_instruction) {
                    if (typeof prev_instruction_ids === 'object') {
                        _instruction.prev_instruction_ids.splice(
                            _instruction.prev_instruction_ids.indexOf(instruction_id), 1);
                    }
                    _instruction.prev_instruction_ids.splice(
                        _instruction.prev_instruction_ids.indexOf(instruction_id), 1);
                }

                r_instructions.current = _instructions;
                setInstructions(performance.now());
            } else {
                console.log('already received swipe!!!!', instruction_id);
            }
        } catch (e) {
            console.error(e)
        }
    }

    const waitYourTurn = (reason) => {
        if (!reason) {
            r_overlay.current.classList.add('hidden')
            return;
        }
        window.navigator.vibrate(200);
        r_overlay.current.children[0].innerHTML = reason;
        r_overlay.current.classList.remove('hidden');
    }

    const hideOverlay = useCallback(() => {
        r_overlay.current.classList.add('hidden');
    }, [])

    const enterGame = () => {
        setFullscreen(true);
        var elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
    }

    const Intro = () => {
        return <button className='centered intro-button' onClick={enterGame}><span>Click Here To Start Your Date</span></button>
    }

    const Game = () => {
        return (
            <div>

                <div ref={r_overlay} onClick={hideOverlay} className='overlay hidden'><span>Wait Your Turn</span></div>
                <div className="Cards">
                    {
                        r_instructions.current ? [...r_instructions.current].map(
                            (instruction, i) => {
                                if (i > 5) return

                                let zIndex = r_instructions.current.length - i;
                                let margin = Math.max(0, i);
                                return (
                                    <div key={instruction.instruction_id}
                                        className='card-offset'
                                        style={{ marginLeft: margin * 20, marginTop: margin * 20 }}>
                                        <NormalCard
                                            offset={i}
                                            zIndex={zIndex}
                                            instruction_id={instruction.instruction_id}
                                            dataurl={instruction.type === 'video' ? r_videos.current[instruction.instruction_id] : ''}
                                            text={instruction.text}
                                            type={instruction.type}
                                            timespan={instruction.timespan ? instruction.timespan : 0}
                                            flip={instruction.prev_instruction_ids.length == 0}
                                            waitYourTurn={waitYourTurn}
                                            swipeAction={() => {
                                                sendSwipedCardToNextRoleIds(instruction.instruction_id, instruction.next_role_ids);
                                                setTimeout(() => {
                                                    removeInstruction(instruction.instruction_id);
                                                    // addToSwipes(instruction.instruction_id)
                                                }, 250)
                                            }}
                                        ></NormalCard>
                                    </div>

                                )
                            }
                        ) : <span className='centered'>{progress}%</span>
                    }
                </div>
            </div>
        )
    }

    return r_isMobile.current === -1 ?
        null :
        fullscreen || !r_isMobile.current ?
            Game() :
            Intro()
}

export default Script