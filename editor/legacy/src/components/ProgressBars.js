import React, { useState, useEffect, useRef, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import {
    atom,
    useRecoilState
} from 'recoil';
// const _videoUploader = atom({ key: 'videoUploader', default: false });


export default function ProgressBars(props) {
    // const [videoUploader] = useRecoilState(_videoUploader);
    const [uploaders, setUploaders] = useState({});
    let r_uploaders = useRef({})
    useEffect(() => {
        if (!props.videoUploader) return
        props.videoUploader.addEventListener('update', ({ detail }) => {
            // setUploaders(detail);
            r_uploaders.current = detail;
            setUploaders(performance.now())
        })
    }, [props.videoUploader])

    return (
        Object.keys(r_uploaders.current).length != 0 ?
            <div className='progressBars'>
                {

                    r_uploaders.current.map(({ instruction_id, uploader }) => {
                        return (
                            <div key={instruction_id} className='progressBar'>
                                <div className="progress" style={{ width: `${uploader.progress.percentage}%` }}>
                                </div>
                                <div className="text">
                                    <span >{instruction_id} is {uploader.status}</span>
                                </div>
                            </div>
                        )
                    })
                }
            </div> : null
    )
}