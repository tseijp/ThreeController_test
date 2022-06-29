import * as THREE from "three";
import { makeQueue } from "./helpers";

class ThreeController {
  props = {};
  state = {};
  constructor() {
    let ts = -1,
      id = -1;
    let queue = makeQueue();
    // eslint-disable-next-line
    const caf = () => (void (ts = -1), id > 0 && cancelAnimationFrame(id));
    const raf = (fun = () => {}) => void (id = requestAnimationFrame(fun));
    const loop = () => ts > -1 && void (raf(loop), queue.flush());
    const start = () => ts < 0 && void (raf(loop), ts++);
    this.state = (fun = () => false) => void (queue.add(fun), start());
    this.state.add = (fun = () => false) => void queue.add(fun);
    this.state.delete = (fun = () => false) => void queue.delete(fun);
    this.state.cancel = () => void ((queue = makeQueue()), caf());
  }

  effect() {
    const { state } = this;
    if (state.isInitialized) return;
    state.isInitialized = true;
    this._initialize();
    state(state.render);
  }

  clean() {
    const { state } = this;
    if (!state.isInitialized) return;
    state.isInitialized = false;
    state.gl.dispose();
    state.cancel();
  }

  _initialize() {
    const { props, state } = this;
    const dpr = props.dpr || window?.devicePixelRatio || 0;
    const color = props.color || "#fff";
    const alpha = props.alpha || 1;
    const width = props.width || window?.innerWidth || 0;
    const height = props.height || window?.innerHeight || 0;
    const canvas =
      typeof props.canvas !== "string"
        ? props.canvas.current || props.canvas
        : document.querySelector(props.canvas);
    state.gl = new THREE.WebGLRenderer({ canvas });
    state.gl.setClearColor(color, alpha);
    state.gl.setPixelRatio(dpr);
    state.gl.setSize(width, height);
    state.scene = new THREE.Scene();
    state.camera = new THREE.PerspectiveCamera(75, 0, 0.1, 1000);
    state.camera.position.set(0, 0, 5);
    state.render = () => {
      state.gl.render(state.scene, state.camera);
      return true;
    };
  }
}

// for vanilla
const _fun = (_state = {}) => false;
const _three = new ThreeController();
const _currentMap = new Map();
const _callbackMap = new Map();

function useRaf(id = "", fun = _fun) {
  const { state } = _three;
  if (_currentMap.get(id) !== fun) _currentMap.set(id, fun);
  const callback =
    _callbackMap.get(id) ||
    _callbackMap.set(id, () => _currentMap.get(id)?.(state)).get(id);
  state.add(callback);
  return state;
}

// for vanilla
const useThree = (id = "", fun = _fun) => useRaf(id, (_) => fun(_) && false);
const useFrame = (id = "", fun = _fun) => useRaf(id, (_) => fun(_) || true);
// const useLoader = (id = "", fun = _fun) => useRaf(id, (_) => (_.isLoaded ? fun(_) && false : true));
const useCanvas = (props) => {
  _three.props = props;
  return _three;
};

export { useThree, useFrame, useCanvas };
