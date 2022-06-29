import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import * as THREE from "three";
import { useRef, useEffect } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useFrame, useThree, useCanvas } from "./hooks";

function useBox() {
  const ref = useRef();

  useEffect(() => () => ref.current?.dispose?.(), []);

  useFrame("updateBox", () => {
    if (ref.current)
      ref.current.rotation.x = ref.current.rotation.y = ref.current.rotation.z += 0.01;
  });

  useThree("createBox", ({ scene }) => {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
    const material = new THREE.MeshBasicMaterial({ color: "orange" });
    ref.current = new THREE.Mesh(geometry, material);
    scene.add(ref.current);
  });
}

function useOrbit() {
  const ref = useRef(null);

  useFrame("updateOrbit", () => void ref.current?.update());

  useThree("setupOrbit", ({ camera, gl }) => {
    ref.current = new OrbitControls(camera, gl.domElement);
  });

  useEffect(() => () => ref.current?.dispose?.(), []);
}

function useLight() {
  useThree("setLight", ({ scene }) => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    const spotLight = new THREE.SpotLight(0xffffff, 0.5, 0, 0.1, 1);
    spotLight.position.set(10, 15, 10);
    scene.add(ambientLight, spotLight);
  });
}

function App() {
  useBox();
  useOrbit();
  useLight();
  const canvas = useCanvas({ canvas: "#id", color: 0x212121 });
  useEffect(() => {
    canvas.effect();
    return () => canvas.clean();
  }, [canvas]);

  return <canvas id="id" style={{ top: 0, left: 0, position: "absolute" }} />;
}

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
