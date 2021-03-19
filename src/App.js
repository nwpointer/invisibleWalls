import "./App.scss";
import React, { Suspense, useRef, useState, useEffect } from "react";
import useKeyPress from "./useKeyPress";
import { ContactShadows, Environment, useGLTF, OrbitControls } from "drei";
import Shoe from "./Shoe";
import Building from "./Building";
import debounce from "lodash.debounce";
import uniq from "lodash.uniq";
import pluck from "lodash.pluck";
import difference from "lodash.difference";

import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Physics, useBox } from "@react-three/cannon";
import { Raycaster, Vector3, DoubleSide } from "three";
import { useCamera, PerspectiveCamera, Line } from "@react-three/drei";
import { Provider, atom, useAtom } from "jotai";

const facingAtom = atom([-5.3861516272095, 0, 5.483227951003158]);

const IP = [214, 214, 214];

function App() {
  return (
    <>
      <Canvas
        concurrent
        pixelRatio={[1, 1.5]}
        colorManagement
        orthographic
        // camera={{ zoom: 10, position: [0, 100, 0] }}
        camera={{ position: [10, 10, 10], fov: 1, zoom: 30 }}
      >
        <Provider>
          <Physics gravity={[0, 0, 0]}>
            <directionalLight intensity={2} position={[0, 0, 4]} />
            <directionalLight intensity={0.5} position={[4, 0, 0]} />
            <directionalLight intensity={4} position={[0, 4, 0]} />
            <ambientLight intensity={0.2} />

            <OrbitControls />

            <Ruler />

            <Me />

            <mesh name="building" position={[1, 1, 1]}>
              <boxBufferGeometry attach="geometry" args={[3, 3, 3, 1]} />
              <meshStandardMaterial
                attach="material"
                renderOrder={-9}
                transparent={true}
                opacity={1}
                side={DoubleSide}
                color="#000000"
              />
            </mesh>

            {/* <Building position={[0, 0, 0]} /> */}
          </Physics>
        </Provider>
      </Canvas>
    </>
  );
}

const Ruler = () => (
  <>
    <Line
      points={[
        [0, 0, 0],
        [0, 0, 10],
      ]}
      color="white"
      position={[0, 0, 0]}
    />
    <Line
      points={[
        [0, 0, 0],
        [0, 10, 0],
      ]}
      color="white"
      position={[0, 0, 0]}
    />
    <Line
      points={[
        [0, 0, 0],
        [10, 0, 0],
      ]}
      color="white"
      position={[0, 0, 0]}
    />
  </>
);

const useBetween = ({ scene, raycaster }) => (p, q) => {
  const pq = new Vector3().copy(p).sub(q).normalize();
  raycaster.set(q, pq);
  return raycaster.intersectObjects(scene.children);
};

function uniqObjects(intersections) {
  return uniq(pluck(intersections, "object"), "id");
}

const setTransparency = (alpha) => (object) =>
  (object.material.opacity = alpha);

const useTransparentOccludes = ({ ref }) => {
  const { camera, scene, raycaster } = useThree();
  const between = useBetween({ scene, raycaster });
  const [occludes, setOccludes] = useState([]);
  useFrame(() => {
    if (raycaster.camera) {
      const p = ref.current.position;
      const q = camera.position;
      let current = uniqObjects(between(q, p));
      // objects no longer occluding should be opaque
      difference(occludes, current).map(setTransparency(1));
      // objects occluding should be transparent
      current.map(setTransparency(0.5));
      setOccludes(current);
    }
  });
};

const useControls = ({ ref, speed = 1, api }) => {
  const up = useKeyPress("w");
  const down = useKeyPress("s");
  const right = useKeyPress("d");
  const left = useKeyPress("a");
  const { camera } = useThree();

  const X = 0;
  const Y = 1;
  const Z = 2;

  let v = [0, 0, 0];

  useFrame(() => {
    if (up) v[Z] = -1;
    if (down) v[Z] = 1;
    if (right) v[X] = 1;
    if (left) v[X] = -1;

    // update the velocity of the object
    ref.current.position.add(
      new Vector3(...v).normalize().multiplyScalar(speed / 10)
    );

    // update the camera to follow and look at object
    if (ref.current) {
      camera.position.copy(ref.current.position).add(new Vector3(...IP));
      camera.lookAt(ref.current.position);
    }
  });
};

function Me() {
  const ref = useRef();
  useTransparentOccludes({ ref });
  useControls({ ref });
  // return null;
  return (
    <mesh ref={ref} name="bob" position={[1, 1, 1]}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        transparent={true}
        color="#000000"
      />
    </mesh>
  );
}

export default App;
