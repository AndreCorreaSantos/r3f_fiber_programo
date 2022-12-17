import * as THREE from "three";
import React, { useRef, Suspense } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./App.css";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float intensity;
    varying float vWave;

    uniform float uTime;

    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);


    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 3.0;
      float noiseAmp = 0.1;
      vec3 noisePos = vec3(pos.x * noiseFreq + uTime/9.0, pos.y, pos.z);
      intensity = snoise3(noisePos) * noiseAmp;
      pos.z += intensity;
      vWave = pos.z;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;

    varying float intensity;
    varying vec2 vUv;

    void main() {
      gl_FragColor = vec4((intensity*10.0+1.2)*uColor, 1.0); 
    }
  `
);

extend({ WaveShaderMaterial });

const Wave = () => {
  const ref = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  return (
    <mesh
    rotation={[-Math.PI*0.47,0.0,0.0]}
    position={[0.0,0.1,3.0]}
    >
      <planeBufferGeometry args={[1.0, 3.5, 120, 120]} />
      <waveShaderMaterial uColor={"orange"} ref={ref} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ fov: 12, position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <Wave />
      </Suspense>
    </Canvas>
  );
};

const App = () => {
  return (
      <Scene />
  );
};

export default App;
