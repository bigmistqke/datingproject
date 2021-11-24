import React from 'react';

export function Show(props) {
  return props.when ? props.children : null;
}

export function For(props) {
  return <>{props.each.map((el, index) => props.children(el, index))}</>;
}
