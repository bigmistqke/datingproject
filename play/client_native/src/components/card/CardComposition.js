import CardElement from './CardElement';
import CardMask from './CardMask';

import React, { useState, useEffect, useMemo } from 'react';
import { Show, For } from '../solid-like-components';
import { useStore } from '../../store/Store';
import { View } from 'react-native';

const CardComposition = props => {
  const [state, { getElements, getSwatches }] = useStore();
  // const [getSwatches, setSwatches] = useState([]);


  const isElementVisible = element => {
    let modes;
    if (element.global) {
      modes = state.design.globals[element.id].modes;
    } else {
      modes = element.modes;
    }
    for (let [mode_type, activated] of Object.entries(props.modes)) {
      if (modes[mode_type] !== 1 && modes[mode_type] !== (activated ? 2 : 0)) {
        return false;
      }
    }
    return true;
  };

  let elements = useMemo(() => getElements(props.instruction.type))
  let swatches = useMemo(() => getSwatches(props.instruction.type, props.masked))

  return (
    <For each={elements}>
      {(element, index) => (
        <Show key={element.id}
          when={isElementVisible(element)}>
          <CardElement
            index={index}
            element={element}
            type={element.type}
            locked={element.locked}
            swatches={swatches}
            {...props}>
          </CardElement>
        </Show>
      )}
    </For>
  );
};

const CardCompositor = props => {
  return (
    <>
      <CardComposition {...props}></CardComposition>

      {/* <Show when={props.modes.timed}>
        <CardMask percentage={state.viewport.timer_percentage}>
          <CardComposition {...props} masked={true}></CardComposition>
        </CardMask>
      </Show> */}
    </>
  );
};

export default CardCompositor;