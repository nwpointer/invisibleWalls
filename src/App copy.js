import "./App.scss";
import React, { Suspense, useRef, useState, useEffect } from "react";
import useKeyPress from "./useKeyPress";
import { ContactShadows, Environment, useGLTF, OrbitControls } from "drei";
import Shoe from "./Shoe";
import Building from "./Building";
import debounce from "lodash.debounce";

import { Canvas, useFrame, useThree } from "react-three-fiber";
import { Physics, useBox } from "@react-three/cannon";
import { Raycaster, Vector3 } from "three";
import { useCamera, PerspectiveCamera } from "@react-three/drei";
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
        camera={{ position: IP, fov: 1, zoom: 30 }}
      >
        <Provider>
          <Physics gravity={[0, 0, 0]}>
            <directionalLight intensity={2} position={[0, 0, 4]} />
            <directionalLight intensity={0.5} position={[4, 0, 0]} />
            <directionalLight intensity={4} position={[0, 4, 0]} />
            <ambientLight intensity={0.2} />

            <Suspense fallback={null}>
              <Building position={[1, 0, 1]} />
            </Suspense>

            <OrbitControls />

            {/* <Indicator /> */}

            {/* <PerspectiveCamera makeDefault /> */}

            {/* <Wall /> */}

            <Box speed={10} />

            {/* <mesh position={[0, 0, 0]}>
              <boxBufferGeometry attach="geometry" args={[1, 1, 1, 1]} />
              <meshStandardMaterial attach="material" color="#000000" />
            </mesh> */}
          </Physics>
        </Provider>
      </Canvas>
    </>
  );
}

const Indicator = () => {
  const { camera } = useThree();
  const [facing, setFacing] = useAtom(facingAtom);
  const [ref, api] = useBox(() => ({
    position: facing,
    args: [1, 1, 1],
  }));

  var vec = new Vector3(); // create once and reuse
  var pos = new Vector3(); // create once and reuse

  const handleClick = (event) => {
    vec.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1,
      0.5
    );

    vec.unproject(camera);

    console.log(vec);

    // vec.sub(camera.position).normalize();

    const targetZ = 0;
    var distance = (targetZ - camera.position.y) / vec.y;

    pos.copy(camera.position).add(vec.multiplyScalar(distance));

    setFacing(pos.toArray());
    console.log(facing);
  };

  useFrame(() => {
    ref.current.position.set(...facing);
  });

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  });
  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach="geometry" args={[1, 1, 1]} />
      <meshStandardMaterial attach="material" color="#fff000" />
    </mesh>
  );
};

const Wall = () => {
  const [ref, api] = useBox(() => ({
    mass: 10,
    position: [4, 0, 1],
    args: [0.4, 1.1, 10.1, 1.1],
    angularDamping: 1,
    // type: "Static",
    // collisionResponse: 0,
  }));

  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach="geometry" args={[0.3, 1, 10, 1]} />
      <meshStandardMaterial attach="material" color="#000000" />
    </mesh>
  );
};

// const Demo2 = () => (
//   <Canvas concurrent pixelRatio={[1, 1.5]} camera={{ position: [0, 0, 2.75] }}>
//     <ambientLight intensity={0.3} />
//     <spotLight
//       intensity={0.3}
//       angle={0.1}
//       penumbra={1}
//       position={[5, 25, 20]}
//     />
//     <OrbitControls
//       minPolarAngle={Math.PI / 2}
//       maxPolarAngle={Math.PI / 2}
//       enableZoom={true}
//       enablePan={false}
//     />
//     <Suspense fallback={null}>
//       <Shoe />
//       <Environment files="royal_esplanade_1k.hdr" />
//       <ContactShadows
//         rotation-x={Math.PI / 2}
//         position={[0, -0.8, 0]}
//         opacity={0.25}
//         width={10}
//         height={10}
//         blur={2}
//         far={1}
//       />
//     </Suspense>
//   </Canvas>
// );

// const Demo1 = () => (
//   <Physics gravity={[0, 0, 0]}>
//     <ambientLight intensity={0.3} />
//     <directionalLight intensity={1} />
//     <Box x={0} y={0} />
//   </Physics>
// );

const X = 0;
const Y = 1;
const Z = 2;

const useControls = ({ ref, speed = 1, api }) => {
  const up = useKeyPress("w");
  const down = useKeyPress("s");
  const right = useKeyPress("d");
  const left = useKeyPress("a");
  const { camera, scene, raycaster } = useThree();
  const pq = new Vector3(0, 0, 0);

  let v = [0, 0, 0];

  // update camera postilion
  useFrame(() => {
    if (up) v[Z] = -1;
    if (down) v[Z] = 1;
    if (right) v[X] = 1;
    if (left) v[X] = -1;

    let vel = new Vector3(...v).normalize().multiplyScalar(speed).toArray();

    api.velocity.set(...vel);

    if (ref.current) {
      let z = new Vector3(...ref.current.position.toArray())
        .add(new Vector3(...IP))
        .toArray();
      camera.position.set(...z);
      camera.lookAt(ref.current.position);
    }
    // camera.position.set(...p);
  });
};

function Box({ speed }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 0, 0],
    onCollide: debounce(() => console.log("welcome to the shop"), 10),
    angularDamping: 1,
  }));
  useControls({ speed, ref, api });

  return (
    <mesh ref={ref}>
      <boxBufferGeometry attach="geometry" args={[1, 2, 1, 1]} />
      <meshStandardMaterial attach="material" color="blue " />
    </mesh>
  );
}

export default App;
