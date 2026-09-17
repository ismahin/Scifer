export const fieldVertex = /* glsl */`
attribute vec3 aOrigin;
attribute vec4 aSeed;
attribute vec3 aAnchor;
uniform float uTime, uStory, uBlack, uTech, uFuture, uFooter, uReduced, uDpr, uActive;
uniform vec2 uSize, uPointer;
uniform sampler2D uSpring;
uniform sampler2D uTextMask;
uniform vec4 uExclusions[8];
varying vec3 vColor;
varying float vAlpha, vShape, vStretch;
const float PI = 3.14159265;
vec3 curl(vec3 p) {
  // Curl of a smooth trigonometric vector potential: continuous and divergence-free.
  return vec3(cos(p.y*1.7)-sin(p.z*1.3), cos(p.z*1.3)-sin(p.x*1.5), cos(p.x*1.5)-sin(p.y*1.7));
}
void main() {
  float t = uTime*(1.-uReduced*.95);
  vec3 rnd = aSeed.xyz;
  float selection = fract(aSeed.w*.754877666);
  float wide = uSize.x/uSize.y*3.08;
  float burst = smoothstep(3.11,3.53,uStory);
  float wave = smoothstep(3.48,4.,uStory);
  float enter = smoothstep(-.5,.03,uBlack);
  float condense = smoothstep(.69,.98,uBlack);
  vec3 origin = aOrigin;
  vec3 dir = normalize(origin-vec3(wide*.43,0.,0.) + (rnd-.5)*.55);
  vec3 spread = vec3((rnd.x-.5)*wide*2.8,(rnd.y-.5)*9.,(rnd.z-.5)*13.);
  vec3 explosion = mix(origin + dir*(2.+rnd.z*5.), spread, .78);
  explosion += curl(explosion*.6+t*.11)*.55*sin(burst*PI);
  vec3 p = mix(origin*.985,explosion,burst);
  vec3 flow = vec3((rnd.x-.5)*wide*2.6,0.,(rnd.z-.5)*7.);
  flow.y = sin(flow.x*.75+t*.3+rnd.z*3.)*(.8+rnd.y*.7)+sin(flow.x*1.5-t*.17)*.35+(rnd.y-.5)*1.5;
  p = mix(p,flow,wave);
  vec3 atmosphere = vec3((rnd.x-.5)*wide*2.9,(rnd.y-.5)*8.,(rnd.z-.5)*9.);
  atmosphere += curl(atmosphere*.4+t*.045)*.14;
  p = mix(p,atmosphere,enter);
  vec3 center = vec3(uSize.x<700.?0.:wide*.46,uSize.x<700.?-.45:0.,0.);
  float az = rnd.x*PI*2., polar = acos(2.*rnd.y-1.);
  vec3 liquid = center + vec3(cos(az)*sin(polar),sin(az)*sin(polar),cos(polar))*(.4+rnd.z*.72);
  liquid += curl(liquid+t*.13)*.13;
  p = mix(p,liquid,condense);
  float alpha = smoothstep(3.08,3.3,uStory);
  alpha *= mix(1.,step(selection,.06)*.65,enter);
  if(uTech>=0.) {
    float robot = smoothstep(.22,.43,uTech), chain = smoothstep(.57,.79,uTech);
    vec3 mechanical = center+vec3((rnd.x-.5)*1.6,(rnd.y-.5)*3.,(rnd.z-.5)*.85);
    mechanical.x += sin(mechanical.y*1.7)*.55;
    vec3 lattice = center+vec3((floor(rnd.x*8.)-3.5)*.49,(floor(rnd.y*6.)-2.5)*.49,(floor(rnd.z*4.)-1.5)*.55);
    p = mix(liquid,mechanical,robot);
    p = mix(p,lattice,chain);
    p += curl(p*2.+t*.2)*.035;
    float transition = sin(robot*PI)+sin(chain*PI);
    alpha = .4*step(selection,.025)+transition*.75;
    float exit = smoothstep(.94,1.22,uTech);
    p = mix(p,vec3((rnd.x-.5)*wide*2.6,(rnd.y-.5)*8.+exit*4.,(rnd.z-.5)*8.),exit);
    alpha *= 1.-smoothstep(1.03,1.4,uTech);
  }
  if(uFuture>=0.) {
    float assemble = smoothstep(.10,.64,uFuture);
    vec3 chaos = vec3((rnd.x-.5)*wide*2.9,(rnd.y-.5)*8.,(rnd.z-.5)*10.);
    vec3 architecture = vec3((floor(rnd.x*72.)-35.5)/35.5*wide*1.12,(floor(rnd.y*7.)-3.)*.62,(floor(rnd.z*44.)-21.5)*.18);
    architecture.y += architecture.z*.15;
    p = mix(chaos,architecture,assemble);
    float vibration = smoothstep(.77,.94,uFuture);
    p += curl(p*3.+t*.8)*(.015+vibration*.12);
    alpha = smoothstep(0.,.12,uFuture)*(.65+assemble*.22);
    float release = smoothstep(.87,1.32,uFuture);
    vec3 falling = p+vec3(sin(rnd.y*9.+release*4.)*.55,-release*release*(9.+rnd.y*7.),0.);
    p = mix(p,falling,release);
    float settle = smoothstep(-.12,.30,uFooter);
    vec3 anchor = aAnchor;
    anchor.y -= (1.-uFooter)*6.16;
    vec2 uv = (vec2(mod(aSeed.w,64.),floor(aSeed.w/64.))+.5)/64.;
    vec2 spring = texture2D(uSpring,uv).xy;
    anchor.xy += spring*(1.-uReduced);
    anchor.xy += vec2(sin(t*2.+rnd.x*99.),cos(t*1.8+rnd.y*83.))*.012;
    p = mix(p,anchor,settle);
    alpha *= mix(mix(.48,1.,step(selection,.60)),step(selection,.085),settle);
  }
  vec2 pointer = uPointer*vec2(wide,3.08);
  vec2 diff = p.xy-pointer;
  float force = exp(-dot(diff,diff)*2.8)*uActive*(1.-uReduced);
  if(uFooter<.1) p.xy += normalize(diff+vec2(.001))*force*.25;
  // Keep the editorial left column clear, without flattening the full-screen field.
  float textZone = (1.-smoothstep(-wide*.05,wide*.28,p.x))*smoothstep(-2.5,-1.8,p.y)*(1.-smoothstep(1.9,2.8,p.y));
  alpha *= 1.-textZone*.48;
  if(uReduced>.5 && uTech<0. && uFuture<0.) {
    // Reduced motion uses stationary formations with a simple surface dissolve.
    p = uBlack>.7 ? liquid : uBlack>-.4 ? atmosphere : flow;
    alpha *= smoothstep(3.12,3.43,uStory);
  }
  if(uReduced>.5 && uFuture>=0.) {
    p = vec3((floor(rnd.x*72.)-35.5)/35.5*wide*1.12,(floor(rnd.y*7.)-3.)*.62,(floor(rnd.z*44.)-21.5)*.18);
    if(uFooter>0.) { p=aAnchor; p.y-=(1.-uFooter)*6.16; alpha*=step(selection,.12); }
  }
  vec4 mv = modelViewMatrix*vec4(p,1.);
  gl_Position=projectionMatrix*mv;
  vec2 screen=gl_Position.xy/gl_Position.w*.5+.5;
  if(uFooter>0.) for(int i=0;i<8;i++) { vec4 r=uExclusions[i]; alpha*=1.-step(r.x,screen.x)*step(screen.x,r.z)*step(r.y,screen.y)*step(screen.y,r.w); }
  float typeMask=texture2D(uTextMask,gl_Position.xy/gl_Position.w*.5+.5).r;
  alpha*=1.-typeMask*.9*smoothstep(.3,.5,uFuture)*(1.-smoothstep(.9,1.3,uFuture));
  float scale = rnd.z<.7?1.4:rnd.z<.9?2.4:rnd.z<.98?3.8:5.6;
  gl_PointSize=clamp(scale*uDpr*(7./max(1.4,-mv.z))*(1.+smoothstep(-.1,.3,uFooter)*.5),1.,17.);
  vAlpha=alpha*clamp(10./max(3.,-mv.z),.3,1.)*smoothstep(.3,1.5,-mv.z);
  vColor=mix(vec3(.07,.36,.77),vec3(.28,.64,1.),rnd.y);
  vColor=mix(vColor,vec3(.72,.87,1.),enter*.85*(1.-condense)*(1.-step(0.,uFuture)));
  vShape=step(.9,rnd.z);
  vStretch=1.+sin(burst*PI)*(1.-wave)*2.8*(1.-uReduced);
}`

export const fieldFragment = /* glsl */`
varying vec3 vColor;
varying float vAlpha,vShape,vStretch;
void main(){
  vec2 q=gl_PointCoord-.5;
  q.x*=vStretch;
  float dotMask=1.-smoothstep(.18,.5,length(q));
  float boxMask=(1.-smoothstep(.19,.29,abs(q.x)))*(1.-smoothstep(.3,.48,abs(q.y)));
  float a=mix(dotMask,boxMask,vShape)*vAlpha;
  if(a<.015) discard;
  gl_FragColor=vec4(vColor,a);
}`

export const apertureVertex = `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,0.999,1.);}`
export const apertureFragment = /* glsl */`
varying vec2 vUv;
uniform float uEntry,uExit,uAspect,uTime,uReduced;
void main(){
  vec2 p=(vUv-.5)*vec2(uAspect,1.);
  float angle=atan(p.y,p.x);
  float edge=length(p)+sin(angle*5.+uTime*.13)*.018+sin(angle*9.-uTime*.07)*.008;
  float radius=uEntry*length(vec2(uAspect,1.))*.66;
  float black=1.-smoothstep(radius-.025,radius+.025,edge);
  vec2 c=(vUv-vec2(uAspect<.9?.5:.73,uAspect<.9?.36:.5))*vec2(uAspect,1.);
  float liquidEdge=length(c)+sin(atan(c.y,c.x)*6.+uTime*.2)*.03;
  float white=1.-smoothstep(uExit*length(vec2(uAspect,1.))*1.15-.035,uExit*length(vec2(uAspect,1.))*1.15+.035,liquidEdge);
  white*=step(.001,uExit);
  if(uReduced>.5) { black=uEntry; white=uExit; }
  vec3 matte=mix(vec3(.0196,.0235,.0314),vec3(.028,.061,.10),exp(-dot(p,p)*3.)*.4);
  float rim=exp(-abs(edge-radius)*160.)*.055*(1.-uReduced);
  matte+=vec3(.02,.15,.4)*rim;
  gl_FragColor=vec4(matte,black*(1.-white));
}`
