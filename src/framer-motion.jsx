import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useContext,
  createContext,
  forwardRef,
} from "react";

// Context for AnimatePresence
const PresenceContext = createContext(null);

// Helper to convert Framer-style style objects to CSS style objects
function processMotionStyles(styles) {
  if (!styles || typeof styles !== "object") return {};
  const css = { ...styles };
  const transforms = [];

  if (css.x !== undefined) {
    const val = typeof css.x === "number" ? `${css.x}px` : css.x;
    transforms.push(`translateX(${val})`);
    delete css.x;
  }
  if (css.y !== undefined) {
    const val = typeof css.y === "number" ? `${css.y}px` : css.y;
    transforms.push(`translateY(${val})`);
    delete css.y;
  }
  if (css.scale !== undefined) {
    transforms.push(`scale(${css.scale})`);
    delete css.scale;
  }
  if (css.scaleX !== undefined) {
    transforms.push(`scaleX(${css.scaleX})`);
    delete css.scaleX;
  }
  if (css.scaleY !== undefined) {
    transforms.push(`scaleY(${css.scaleY})`);
    delete css.scaleY;
  }
  if (css.rotate !== undefined) {
    const val =
      typeof css.rotate === "number" ? `${css.rotate}deg` : css.rotate;
    transforms.push(`rotate(${val})`);
    delete css.rotate;
  }

  if (transforms.length > 0) {
    const existing = css.transform ? `${css.transform} ` : "";
    css.transform = `${existing}${transforms.join(" ")}`;
  }

  return css;
}

function buildTransition(transition = {}) {
  const duration =
    transition.duration !== undefined ? transition.duration : 0.35;
  const delay = transition.delay !== undefined ? transition.delay : 0;
  let ease = "cubic-bezier(0.16, 1, 0.3, 1)"; // smooth spring-like curve

  if (transition.ease === "easeInOut") ease = "cubic-bezier(0.4, 0, 0.2, 1)";
  else if (transition.ease === "easeOut") ease = "cubic-bezier(0, 0, 0.2, 1)";
  else if (transition.ease === "easeIn") ease = "cubic-bezier(0.4, 0, 1, 1)";
  else if (transition.ease === "linear") ease = "linear";
  else if (typeof transition.ease === "string") ease = transition.ease;

  if (transition.type === "spring") {
    // Spring approximation via snappy cubic-bezier
    ease = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  }

  return `transform ${duration}s ${ease} ${delay}s, opacity ${duration}s ${ease} ${delay}s, filter ${duration}s ${ease} ${delay}s, background-color ${duration}s ${ease} ${delay}s, border-color ${duration}s ${ease} ${delay}s, box-shadow ${duration}s ${ease} ${delay}s, width ${duration}s ${ease} ${delay}s, height ${duration}s ${ease} ${delay}s`;
}

// Layout store for layoutId sharing
const layoutStore = new Map();

function createMotionComponent(Tag) {
  const MotionComponent = forwardRef(function MotionComponent(
    {
      initial,
      animate,
      exit,
      transition = {},
      whileHover,
      whileTap,
      layoutId,
      layout,
      style = {},
      className = "",
      children,
      onMouseEnter,
      onMouseLeave,
      onMouseDown,
      onMouseUp,
      ...restProps
    },
    ref,
  ) {
    const presence = useContext(PresenceContext);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const internalRef = useRef(null);
    const elementRef = ref || internalRef;

    useEffect(() => {
      // Trigger animation after initial render
      const frame = requestAnimationFrame(() => {
        setMounted(true);
      });
      return () => cancelAnimationFrame(frame);
    }, []);

    // Determine target styles
    const computedStyles = useMemo(() => {
      let target = {};

      if (!mounted && initial !== false && initial !== undefined) {
        target = { ...target, ...initial };
      } else if (presence?.isExiting && exit) {
        target = { ...target, ...exit };
      } else if (animate) {
        target = { ...target, ...animate };
      }

      if (isHovered && whileHover) {
        target = { ...target, ...whileHover };
      }

      if (isPressed && whileTap) {
        target = { ...target, ...whileTap };
      }

      const processed = processMotionStyles(target);
      const userStyle = { ...style };
      const transitionString = buildTransition(transition);

      return {
        ...userStyle,
        ...processed,
        transition: userStyle.transition
          ? `${userStyle.transition}, ${transitionString}`
          : transitionString,
      };
    }, [
      mounted,
      initial,
      animate,
      exit,
      whileHover,
      whileTap,
      isHovered,
      isPressed,
      presence?.isExiting,
      transition,
      style,
    ]);

    const handleMouseEnter = useCallback(
      (e) => {
        if (whileHover) setIsHovered(true);
        if (onMouseEnter) onMouseEnter(e);
      },
      [whileHover, onMouseEnter],
    );

    const handleMouseLeave = useCallback(
      (e) => {
        if (whileHover) setIsHovered(false);
        setIsPressed(false);
        if (onMouseLeave) onMouseLeave(e);
      },
      [whileHover, onMouseLeave],
    );

    const handleMouseDown = useCallback(
      (e) => {
        if (whileTap) setIsPressed(true);
        if (onMouseDown) onMouseDown(e);
      },
      [whileTap, onMouseDown],
    );

    const handleMouseUp = useCallback(
      (e) => {
        if (whileTap) setIsPressed(false);
        if (onMouseUp) onMouseUp(e);
      },
      [whileTap, onMouseUp],
    );

    return (
      <Tag
        ref={elementRef}
        className={className}
        style={computedStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...restProps}
      >
        {children}
      </Tag>
    );
  });

  MotionComponent.displayName = `motion.${Tag}`;
  return MotionComponent;
}

// Proxied motion object
export const motion = new Proxy(
  {},
  {
    get: (target, prop) => {
      if (typeof prop !== "string") return undefined;
      if (!target[prop]) {
        target[prop] = createMotionComponent(prop);
      }
      return target[prop];
    },
  },
);

// AnimatePresence component
export function AnimatePresence({ children, mode = "sync", onExitComplete }) {
  const [currentChild, setCurrentChild] = useState(children);
  const [exitingChild, setExitingChild] = useState(null);
  const prevChildKey = useRef(
    React.isValidElement(children) ? children.key : null,
  );

  useEffect(() => {
    const newKey = React.isValidElement(children) ? children.key : null;

    if (newKey !== prevChildKey.current) {
      if (mode === "wait" && currentChild) {
        setExitingChild(currentChild);
        const timer = setTimeout(() => {
          setExitingChild(null);
          setCurrentChild(children);
          prevChildKey.current = newKey;
          if (onExitComplete) onExitComplete();
        }, 250);
        return () => clearTimeout(timer);
      } else {
        setCurrentChild(children);
        prevChildKey.current = newKey;
      }
    } else {
      setCurrentChild(children);
    }
  }, [children, mode, onExitComplete, currentChild]);

  if (exitingChild && mode === "wait") {
    return (
      <PresenceContext.Provider value={{ isExiting: true }}>
        {exitingChild}
      </PresenceContext.Provider>
    );
  }

  return (
    <PresenceContext.Provider value={{ isExiting: false }}>
      {currentChild}
    </PresenceContext.Provider>
  );
}

export function useAnimation() {
  const [styles, setStyles] = useState({});
  return {
    start: async (target) => setStyles(target),
    set: (target) => setStyles(target),
    styles,
  };
}

export function useSpring(val) {
  return val;
}

export function useMotionValue(val) {
  return { get: () => val, set: () => {}, onChange: () => () => {} };
}

export default {
  motion,
  AnimatePresence,
  useAnimation,
  useSpring,
  useMotionValue,
};
