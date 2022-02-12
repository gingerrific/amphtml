import {scale as cssScale, setStyles, translate} from '#core/dom/style';

import * as Preact from '#preact';
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
} from '#preact';
import {Children, forwardRef} from '#preact/compat';
import {ContainWrapper} from '#preact/component';
import {logger} from '#preact/logger';

import {ACTION_TYPES, actions} from './actions';
import {useStyles} from './component.jss';
import {initReducer, panZoomReducer} from './reducer';

const DEFAULT_MAX_SCALE = 3;
const DEFAULT_MIN_SCALE = 1;

/**
 * @param {!BentoPanZoom.Props} props
 * @param {{current: ?BentoPanZoom.PanZoomApi}} ref
 * @return {PreactDef.Renderable}
 */
export function BentoPanZoomWithRef(props, ref) {
  const {
    children,
    maxScale = DEFAULT_MAX_SCALE,
    onTransformEnd,
    resetOnResize,
    ...rest
  } = props;
  const styles = useStyles();
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const [state, dispatch] = useReducer(panZoomReducer, props, initReducer);

  useEffect(() => {
    if (childrenArray.length !== 1) {
      // this should also potentially check child types?
      logger.error('BENTO-PAN-ZOOM', 'Component should only have one child');
    }
  }, [childrenArray]);

  useLayoutEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }
    dispatch(
      actions.initializeBoundaries({
        contentBox: containerRef.current./*REVIEW*/ getBoundingClientRect(),
        containerBox: contentRef.current./*REVIEW*/ getBoundingClientRect(),
      })
    );
  }, []);

  useEffect(() => {
    if (!containerRef.current && !contentRef.current) {
      return;
    }

    const element = contentRef.current;
    setStyles(element, {
      transform: translate(state.posX, state.posY) + cssScale(state.scale),
    });
  }, [state.posX, state.posY, state.scale]);

  const handleZoomButtonClick = (e) => {
    if (!state.isZoomed) {
      dispatch(actions.zoomIn({x: 0, y: 0, scale: maxScale}));
    } else {
      dispatch(actions.zoomOut({x: 0, y: 0, scale: DEFAULT_MIN_SCALE}));
    }
  };

  const onMouseMove = useCallback(
    (e) => {
      // Prevent swiping by accident
      e.preventDefault();

      if (!state.isPannable) {
        return;
      }

      const {clientX, clientY} = e;
      const deltaX = clientX - state.mousePosX;
      const deltaY = clientY - state.mousePosY;

      dispatch(
        actions.panContent({
          deltaX,
          deltaY,
        })
      );
    },
    [state.mousePosX, state.mousePosY, state.isPannable]
  );

  const onMouseDown = useCallback(
    (e) => {
      // Return early for right click
      if (e.button == 2 || !state.isZoomed) {
        return;
      }

      e.preventDefault();

      const {clientX, clientY} = e;
      dispatch(
        actions.startPanning({
          isPannable: true,
          mousePosX: clientX,
          mousePosY: clientY,
        })
      );
    },
    [state.isZoomed]
  );

  const onMouseUp = useCallback(
    (e) => {
      if (!state.isPannable) {
        return;
      }
      e.preventDefault();

      dispatch(actions.stopPanning);
    },
    [state.isPannable]
  );

  useImperativeHandle(
    ref,
    () =>
      /** @type {!BentoPanZoom.PanZoomApi} */ ({
        transform: (scale, x, y) => {
          dispatch({
            type: ACTION_TYPES.TRANSFORM,
            payload: {
              scale,
              posX: x,
              posY: y,
            },
          });
        },
      }),
    []
  );

  const showPanCursor = state.isZoomed ? styles.ampPanZoomPannable : '';
  const buttonClass = state.isZoomed
    ? styles.ampPanZoomOutIcon
    : styles.ampPanZoomInIcon;
  return (
    <ContainWrapper
      {...rest}
      ref={containerRef}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      class={styles.ampPanZoom}
      contentClassName={`${styles.ampPanZoomContent} ${showPanCursor}`}
      layout
    >
      <div ref={contentRef} class={`${styles.ampPanZoomChild}`}>
        {children}
      </div>

      <div
        class={`${styles.ampPanZoomButton} ${buttonClass}`}
        onClick={handleZoomButtonClick}
      />
    </ContainWrapper>
  );
}

const BentoPanZoom = forwardRef(BentoPanZoomWithRef);
BentoPanZoom.displayName = 'BentoPanZoom'; // Make findable for tests.
export {BentoPanZoom};
