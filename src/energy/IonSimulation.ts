import * as THREE from 'three'

/** GPU spring integration. RG = offset, BA = velocity; never a per-particle JS loop. */
export class IonSimulation {
  private targets = [0, 1].map(() => new THREE.WebGLRenderTarget(64, 64, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }))
  private index = 0
  private scene = new THREE.Scene()
  private camera = new THREE.Camera()
  private material: THREE.ShaderMaterial
  private geometry = new THREE.PlaneGeometry(2, 2)
  readonly anchors: THREE.DataTexture
  constructor() {
    this.anchors = new THREE.DataTexture(new Float32Array(64 * 64 * 4), 64, 64, THREE.RGBAFormat, THREE.FloatType)
    this.anchors.needsUpdate = true
    this.material = new THREE.ShaderMaterial({
      uniforms: { uPrevious: { value: this.targets[0].texture }, uAnchors: { value: this.anchors }, uPointer: { value: new THREE.Vector2() }, uActive: { value: 0 }, uDt: { value: .016 }, uOffset: { value: 0 }, uRepel: { value: 0 } },
      vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}',
      fragmentShader: `varying vec2 vUv;uniform sampler2D uPrevious,uAnchors;uniform vec2 uPointer;uniform float uActive,uDt,uOffset,uRepel;
      void main(){vec4 old=texture2D(uPrevious,vUv);vec2 anchor=texture2D(uAnchors,vUv).xy+vec2(0.,uOffset);vec2 delta=uPointer-anchor-old.xy;float d=length(delta);float radius=1.6;float local=(1.-smoothstep(.1,radius,d))*uActive;vec2 direction=delta/max(.08,d);vec2 force=direction*min(9.,2.3/(d*d+.24))*local*(1.-uRepel*2.1);force+=vec2(-direction.y,direction.x)*local*1.8;vec2 v=old.zw+(force-old.xy*19.-old.zw*6.4)*uDt;vec2 p=old.xy+v*uDt;gl_FragColor=vec4(clamp(p,vec2(-1.4),vec2(1.4)),v);}`,
    })
    this.scene.add(new THREE.Mesh(this.geometry, this.material))
  }
  get texture() { return this.targets[this.index].texture }
  step(gl: THREE.WebGLRenderer, dt: number, pointer: THREE.Vector2, active: boolean, offset: number, repel: boolean) {
    const u = this.material.uniforms
    u.uPrevious.value = this.texture; u.uDt.value = Math.min(.033, dt); u.uPointer.value.copy(pointer)
    u.uActive.value = active ? 1 : 0; u.uOffset.value = offset; u.uRepel.value = repel ? 1 : 0
    this.index = 1 - this.index
    const previous = gl.getRenderTarget()
    gl.setRenderTarget(this.targets[this.index]); gl.render(this.scene, this.camera); gl.setRenderTarget(previous)
  }
  dispose() { this.targets.forEach(target => target.dispose()); this.material.dispose(); this.geometry.dispose(); this.anchors.dispose() }
}
