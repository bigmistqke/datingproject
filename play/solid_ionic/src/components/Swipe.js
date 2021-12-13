import Tweener from "../helpers/tweener.js";

import { useStore } from '../store/Store.js';

const Swipe = ({ screen_dimensions, card_dimensions, zIndex, canPlay, canSwipe, onSwipe, triggerSwipe, waitYourTurn, margin, children, flip }) => {
  const [, actions] = useStore();

  const tweener = new Tweener();
  const DRAG_TRESHOLD = 100;
  // TODO : replacement for windows in react-native
  /*     let screen_dimensions = useRef({
          x: Dimensions.get('window').width,
          y: Dimensions.get('window').height
      }).current; */





  /* const pan_ref = useRef(new Animated.ValueXY()).current;
  const translate_ref = useRef(new Animated.ValueXY()).current;

  let translate_start_ref = useRef().current;

  const rotateZ = useRef(new Animated.Value(0)).current;
  const rotateZ_ref = rotateZ.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1deg']
  })




  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      translate_start_ref = {
        x: translate_ref.x._value,
        y: translate_ref.y._value
      }
      pan_ref.setOffset({
        x: pan_ref.x._value,
        y: pan_ref.y._value
      });
    },
    onPanResponderMove: Animated.event([
      null, { dx: pan_ref.x, dy: pan_ref.y }
    ], {
      useNativeDriver: false,
      listener: (event, gestureState) => {
        translate_ref.setValue({
          x: translate_start_ref.x + pan_ref.x._value,
          y: translate_start_ref.y + pan_ref.y._value
        });
        translationToRotation(translate_ref.x._value);
      }
    }),
    onPanResponderRelease: () => {
      pan_ref.flattenOffset();
      if (Math.sqrt(
        Math.pow(translate_ref.x._value, 2) + Math.pow(translate_ref.y._value, 2)
      ) < DRAG_TRESHOLD) {
        snapBack();
      } else {
        swipeAway();
        setTimeout(() => onSwipe(), 0);
      }
    }
  })).current; */

  const translationToRotation = (x) => rotateZ.setValue(x / Dimensions.get('screen').width * 25);


  const swipeAway = () => {
    translate_start_ref = {
      x: translate_ref.x._value,
      y: translate_ref.y._value
    }
    const angle = Math.atan2(translate_start_ref.y, translate_start_ref.x)
    const new_dist = {
      x: Dimensions.get('screen').width * 1.75 * Math.cos(angle),
      y: Dimensions.get('screen').height * 1.25 * Math.sin(angle)
    }
    tweener.tweenTo(0, 1, 125,
      (alpha) => {
        translate_ref.setValue({
          x: translate_start_ref.x * (1 - alpha) + (new_dist.x) * alpha,
          y: translate_start_ref.y * (1 - alpha) + (new_dist.y) * alpha,
        })
        translationToRotation(translate_ref.x._value);
      }
    )
  }

  const snapBack = () => {
    translate_start_ref = {
      x: translate_ref.x._value,
      y: translate_ref.y._value
    }
    tweener.tweenTo(1, 0, 250,
      (alpha) => {
        translate_ref.setValue({
          x: translate_start_ref.x * alpha,
          y: translate_start_ref.y * alpha
        });
        translationToRotation(translate_ref.x._value);
      }
    );
  }



  return (
    <div>
      <Animated.View
        style={{
          left: margin * 10,
          top: margin * 10,
          position: 'absolute',
          elevation: 10,
          height: parseInt(actions.getCardDimensions().height),
          width: parseInt(actions.getCardDimensions().height),
          transform: [
            { translateX: translate_ref.x },
            { translateY: translate_ref.y },
            { rotateZ: rotateZ_ref },
          ],

        }}
        {...panResponder.panHandlers}
      >
        {children}

      </Animated.View>
    </div >
  );
}



export default Swipe;