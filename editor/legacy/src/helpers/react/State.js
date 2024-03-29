import { useState, useRef, useEffect } from 'react';


const State = function (defaultValue) {
    const [state, setState] = useState(defaultValue);
    const r_state = useRef(defaultValue);
    const [update, setUpdate] = useState(performance.now());

    this.state = state;

    useEffect(() => {
        if (state === r_state.current)
            this.state = state;

    }, [state])

    this.get = () => r_state.current

    this.set = (value) => {
        r_state.current = value;
        setState(value);
        // this.state = r_state.current;
        setUpdate(performance.now());
    }

}

export default State