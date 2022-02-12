import {boundValue, distance} from '#core/math';

import {ACTION_TYPES, ActionTypes} from './actions';
const DEFAULT_MAX_SCALE = 3;
const DEFAULT_INITIAL_SCALE = 1;
const MAX_ANIMATION_DURATION = 250;
const DEFAULT_ORIGIN = 0;

const initialRect = new DOMRect(0, 0, 0, 0);

type InitialState = {
  maxX: number;
  minX: number;
  startX: number;
  posX: number;

  maxY: number;
  minY: number;
  startY: number;
  posY: number;

  minScale: number;
  maxScale: number;
  scale: number;

  mousePosX: number;
  mousePosY: number;

  width: number;
  sourceWidth: number;
  height: number;
  sourceHeight: number;
  transform: string;

  contentBox: DOMRect;
  containerBox: DOMRect;

  isPannable: boolean;
  isZoomed: boolean;
};

export type State = InitialState;

const initialState: InitialState = {
  maxX: 0,
  minX: 0,
  startX: 0,
  posX: 0,

  maxY: 0,
  minY: 0,
  startY: 0,
  posY: 0,

  minScale: 1,
  maxScale: DEFAULT_MAX_SCALE,
  scale: 1,

  mousePosX: 0,
  mousePosY: 0,

  width: 0,
  sourceWidth: 0,
  height: 0,
  sourceHeight: 0,
  transform: '',

  contentBox: initialRect,
  containerBox: initialRect,

  isPannable: false,
  isZoomed: false,
};

const updatePanZoomBoundaries = (state: State, newScale: number) => {
  const {containerBox, contentBox} = state;
  const {
    height: contentHeight,
    left: contentXOffset,
    top: contentYOffset,
    width: contentWidth,
  } = contentBox;
  const {height: elementHeight, width: elementWidth} = containerBox;
  const minX = Math.min(
    0,
    elementWidth - (contentXOffset + (contentWidth * (newScale + 1)) / 2)
  );
  const maxX = Math.max(
    0,
    (contentWidth * newScale - contentWidth) / 2 - contentXOffset
  );
  const minY = Math.min(
    0,
    elementHeight - (contentYOffset + (contentHeight * (newScale + 1)) / 2)
  );
  const maxY = Math.max(
    0,
    (contentHeight * newScale - contentHeight) / 2 - contentYOffset
  );
  return {
    maxX,
    minX,
    maxY,
    minY,
  };
};

const boundScale = (state: State, newScale: number, allowExtent: boolean) => {
  const {maxScale, minScale} = state;
  const extent = allowExtent ? 0.25 : 0;
  return boundValue(newScale, minScale, maxScale, extent);
};

const boundX = (state: State, newPosX: number, allowExtent: boolean) => {
  const {containerBox, maxX, minX, scale} = state;
  const maxExtent = containerBox.width * 0.25;
  const extent = allowExtent && scale > 1 ? maxExtent : 0;
  return boundValue(newPosX, minX, maxX, extent);
};

const boundY = (state: State, newPosY: number, allowExtent: boolean) => {
  const {containerBox, maxY, minY, scale} = state;
  const maxExtent = containerBox.height * 0.25;
  const extent = allowExtent && scale > 1 ? maxExtent : 0;
  return boundValue(newPosY, minY, maxY, extent);
};

const transform = (state: State, x: number, y: number, scale: number) => {
  const newX = boundX(state, x, false);
  const newY = boundY(state, y, false);

  return setZoomCoordsAndScale(state, scale, newX, newY, true);
};

const move = (state: State, deltaX: number, deltaY: number) => {
  const newX = boundX(state, deltaX + state.startX, false);
  const newY = boundY(state, deltaY + state.startY, false);
  return setZoomCoordsAndScale(state, state.scale, newX, newY, false);
};

const setZoomCoordsAndScale = (
  state: State,
  newScale: number,
  newPosX: number,
  newPosY: number,
  animate: boolean
) => {
  const {posX, posY, scale} = state;
  const ds = newScale - scale;
  const dist = distance(posX, posY, newPosX, newPosY);
  const dur = animate
    ? Math.min(
        1,
        Math.max(
          dist * 0.01, // Distance
          Math.abs(ds) // Change in scale
        )
      ) * MAX_ANIMATION_DURATION
    : 0;

  // initial porting of animation logic, but this is the wrong place to do it
  // if (dur > 16 && animate && elementRef) {
  //   // should be Animation
  //   const scaleFunc = numeric(scale, newScale);
  //   const xFunc = numeric(posX, newPosX);
  //   const yFunc = numeric(posY, newPosY);
  //   const time = dur;

  //   return {
  //     scale: scaleFunc(time),
  //     posX: xFunc(time),
  //     posY: yFunc(time),
  //   };
  // } else {
  //   return {
  //     scale: newScale,
  //     posX: newPosX,
  //     posY: newPosY,
  //   };
  // }
  return {
    scale: newScale,
    posX: newPosX,
    posY: newPosY,
  };
};

export function initReducer(config) {
  const {initialScale, initialX, initialY, maxScale} = config;
  return {
    ...initialState,
    initialScale: initialScale || DEFAULT_INITIAL_SCALE,
    initialX: initialX || DEFAULT_ORIGIN,
    initialY: initialY || DEFAULT_ORIGIN,
    maxScale: maxScale || DEFAULT_MAX_SCALE,
  };
}

export function panZoomReducer(state: InitialState, action: ActionTypes) {
  switch (action.type) {
    case ACTION_TYPES.INITIALIZE_BOUNDS:
      return {
        ...state,
        contentBox: action.payload.contentBox,
        containerBox: action.payload.containerBox,
      };
    case ACTION_TYPES.SET_IS_PANNING:
      // temp work around for clicking on zoom button triggering move
      if (!state.isZoomed) {
        return state;
      } else {
        return {
          ...state,
          isPannable: action.payload.isPannable,
          startX: state.posX,
          startY: state.posY,
          mousePosX: action.payload?.mousePosX || 0,
          mousePosY: action.payload?.mousePosY || 0,
        };
      }
    case ACTION_TYPES.ZOOM:
      return {
        ...state,
        isZoomed: action.payload.isZoomed,
        ...updatePanZoomBoundaries(state, action.payload.scale),
        ...transform(
          state,
          action.payload.x,
          action.payload.y,
          action.payload.scale
        ),
      };
    case ACTION_TYPES.MOVE:
      return {
        ...state,
        ...move(state, action.payload.deltaX, action.payload.deltaY),
      };
    case ACTION_TYPES.TRANSFORM:
      return {
        ...state,
        ...updatePanZoomBoundaries(state, action.payload.scale),
        ...transform(
          state,
          action.payload.x,
          action.payload.y,
          action.payload.scale
        ),
      };

    // not currently used, but functionality ported over form .1 version
    // case ACTION_TYPES.SET_DIMENSIONS:
    //   return {
    //     ...state,
    //     height: px(state.contentBox?.height),
    //     width: px(state.contentBox?.width),
    //   };
    // case ACTION_TYPES.CLEAR_DIMENSIONS:
    //   return {
    //     ...state,
    //     height: '',
    //     width: '',
    //   };
    // case ACTION_TYPES.UPDATE_PAN_ZOOM:
    //   const transformString = `translate(${state.posX}px ${state.posY}px) scale(${state.scale})`;
    //   return {
    //     ...state,
    //     transform: transformString,
    //   };
    // case ACTION_TYPES.UPDATE_PAN_ZOOM_BOUNDS:
    //   return {
    //     ...state,
    //     ...updatePanZoomBoundaries(state, action.payload.scale),
    //   };
    // case ACTION_TYPES.SET_CONTENT_BOX_OFFSETS:
    //   return {
    //     ...state,
    //     ...setContentBox(action.payload.contentBox, state.containerBox),
    //   };
    // case ACTION_TYPES.UPDATE_CONTENT_DIMENSIONS:
    //   return {
    //     ...state,
    //     ...updatePanZoomBoundaries(state, action.payload.scale),
    //   };
    default:
      return state;
  }
}
