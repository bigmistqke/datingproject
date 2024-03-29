import React, { memo, useEffect, useCallback, useState, useRef } from 'react';


import uniqid from "uniqid"



const CardElement = ({ id, element, viewport, guides, card_dim, shouldSnap, shiftPressed, altPressed, typeInFocus, loremIpsum, children }) => {

    let r_viewport = useRef();
    let r_element = useRef();

    function isDataURL(s) {
        return !!s.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i);
    }

    useEffect(() => {
        r_viewport.current = viewport;
    }, [viewport])
    useEffect(() => {
        r_element.current = element;
    }, [element])


    // cursor event listener move
    const moveStart = useCallback(e => {
        if (element.locked) return;

        viewport.focus(id);
        // element.focused = true;

        e.preventDefault();
        e.stopPropagation();



        let cursorStart = {
            x: (e.clientX - card_dim.left) / card_dim.width * 100,
            y: (e.clientY - card_dim.top) / card_dim.height * 100
        };
        let originStart = {
            x: element.origin.x,
            y: element.origin.y
        }

        function update(e) {
            let cursorNow = {
                x: (e.clientX - card_dim.left) / card_dim.width * 100,
                y: (e.clientY - card_dim.top) / card_dim.height * 100
            };
            let delta = {
                x: cursorStart.x - cursorNow.x,
                y: cursorStart.y - cursorNow.y
            };

            element.origin = {
                x: originStart.x - delta.x,
                y: originStart.y - delta.y
            }

            // TODO : filter only the guides that are intersecting with the object (in a more efficient way)
            if (shouldSnap) {
                // check for horizontal guides
                for (let i = 0; i < 3; i++) {

                    let snap_guide = Object.values(guides.state).find(
                        (guide) => guide.direction === 'horizontal' &&
                            Math.abs(element.origin.y + i * (element.dim.height / 2) - guide.position) < 2);
                    if (snap_guide) {
                        console.log('snaaaaaaaap');
                        element.origin.y = snap_guide.position - i * (element.dim.height / 2);
                        break;
                    }
                }
                // check for vertical guides
                for (let i = 0; i < 3; i++) {
                    let snap_guide = Object.values(guides.state).find((guide) => guide.direction === 'vertical' &&
                        Math.abs(element.origin.x + i * (element.dim.width / 2) - guide.position) < 2);
                    if (snap_guide) {
                        element.origin.x = snap_guide.position - i * (element.dim.width / 2);
                        break;
                    }
                }

            }

            viewport.update(id, element);
        }

        const finish = e => {
            window.removeEventListener('mousemove', update, true);
            window.removeEventListener('mouseup', finish, true);
        }

        setTimeout(() => {
            window.addEventListener('mousemove', update, true);
            window.addEventListener('mouseup', finish, true);
        }, 50)


    }, [element, card_dim, shiftPressed, guides, viewport])

    const focusElement = useCallback(e => {
        e.preventDefault();
        if (!element.focused) {
            // viewport.focus(id);
        }
    }, [element, viewport])

    const openContext = useCallback(e => {
        e.preventDefault();

    }, [element, viewport])

    useEffect(() => {
        console.log(element.dim);
    }, [element])


    const Type = ({ element }) => {
        switch (element.type) {
            case 'image':
                return <img src={isDataURL(element.src) ? element.src : `${window._url.fetch}/api/${element.src}`}></img>;
            case 'text_type':
                return <span>{typeInFocus}</span>;
            case 'text_instruction':
                return <span>{loremIpsum}</span>;
            case 'text_custom':
                return <span>{ }</span>;
            default:
                return null;
        }
    }

    return (
        <div
            className={`element ${id === viewport.elementInFocus.state ? 'focus' : 'blur'}`}
            id={id}
            onMouseDown={moveStart}
            onClick={focusElement}
            onContextMenu={openContext}
            style={{
                width: element.dim.width + '%',
                height: element.dim.height + '%',
                top: element.origin.y + '%',
                left: element.origin.x + '%',
                pointerEvents: element.isDrawing || element.locked ? 'none' : 'all',
                zIndex: element.z,
                textAlign: element.options ? element.options.alignmentHorizontal : null,
                alignItems: element.options ? element.options.alignmentVertical : null,
                fontSize: element.options ? `${element.options.size}pt` : null,
                fontFamily: element.options ? element.options.family : null,
                letterSpacing: element.options ? element.options.spacing : null,
                lineHeight: element.options ? `${element.options.lineHeight}pt` : null,
                color: element.options ? element.options.color : null,
                textShadow: element.options ? `${element.options.shadowLeft}px ${element.options.shadowTop}px ${element.options.shadowBlur}px ${element.options.shadowColor}` : null
            }}
        >
            <Type element={element}></Type>
            {children}

        </div>
    )
}

export default CardElement;
