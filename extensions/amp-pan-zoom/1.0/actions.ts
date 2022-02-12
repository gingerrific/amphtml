export const ACTION_TYPES = {
  INITIALIZE_BOUNDS: 'INITIALIZE_BOUNDS',
  SET_DIMENSIONS: 'SET_DIMENSIONS',
  SET_CONTENT_BOX_OFFSETS: 'SET_CONTENT_BOX_OFFSETS',
  CLEAR_DIMENSIONS: 'CLEAR_DIMENSIONS',
  UPDATE_PAN_ZOOM: 'UPDATE_PAN_ZOOM',
  UPDATE_PAN_ZOOM_BOUNDS: 'UPDATE_PAN_ZOOM_BOUNDS',
  SET_ZOOM_BOUNDS: 'SET_ZOOM_BOUNDS',
  UPDATE_CONTENT_DIMENSIONS: 'UPDATE_CONTENT_DIMENSIONS',
  RESET_CONTENT_DIMENSIONS: 'RESET_CONTENT_DIMENSIONS',
  TRANSFORM: 'TRANSFORM',
  SET_IS_PANNING: 'SET_IS_PANNING',
  MOVE: 'MOVE',
  MOVE_RELEASE: 'MOVE_RELEASE',
  ZOOM: 'ZOOM',
} as const;

const initializeBoundaries = ({
  containerBox,
  contentBox,
}: {
  contentBox: DOMRect;
  containerBox: DOMRect;
}) => ({
  type: ACTION_TYPES.INITIALIZE_BOUNDS,
  payload: {
    contentBox,
    containerBox,
  },
});

type PositioningValues = {
  x: number;
  y: number;
  scale: number;
};

const createZoomAction =
  (isZoomed: boolean) =>
  ({scale, x, y}: PositioningValues) => {
    return {
      type: ACTION_TYPES.ZOOM,
      payload: {
        isZoomed,
        x,
        y,
        scale,
      },
    };
  };

const zoomIn = createZoomAction(true);
const zoomOut = createZoomAction(false);

const transformContent = ({scale, x, y}: PositioningValues) => {
  return {
    type: ACTION_TYPES.TRANSFORM,
    payload: {x, y, scale},
  };
};

const panContent = ({deltaX, deltaY}: {deltaX: number; deltaY: number}) => {
  return {
    type: ACTION_TYPES.MOVE,
    payload: {
      deltaX,
      deltaY,
    },
  };
};

const startPanning = ({
  mousePosX,
  mousePosY,
}: {
  mousePosX: number;
  mousePosY: number;
}) => {
  return {
    type: ACTION_TYPES.SET_IS_PANNING,
    payload: {isPannable: true, mousePosX, mousePosY},
  };
};

const stopPanning = () => ({
  type: ACTION_TYPES.SET_IS_PANNING,
  payload: {isPannable: false},
});

export const actions = {
  initializeBoundaries,
  zoomIn,
  zoomOut,
  transformContent,
  panContent,
  startPanning,
  stopPanning,
};

type ActionCreatorTypes = typeof actions;
export type ActionTypes = ReturnType<
  ActionCreatorTypes[keyof ActionCreatorTypes]
>;
