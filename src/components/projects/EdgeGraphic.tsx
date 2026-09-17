/** Lightweight spatial project preview; the primary narrative uses real WebGL. */
export function EdgeGraphic() {
  return <g className="edge-graphic">
    <ellipse cx="300" cy="261" rx="145" ry="20" fill="#18324f" opacity=".07" />
    {Array.from({ length: 9 }, (_, i) => {
      const col = i % 3, row = Math.floor(i / 3), x = 300 + (col - row) * 71, y = 78 + (col + row) * 36
      return <g key={i} className="edge-node" style={{ animationDelay: `${i * 140}ms` }}>
        <path d={`M${x} ${y}l45 23v19l-45 23-45-23v-19Z`} fill={i === 4 ? '#4389d2' : '#b8ccdf'} stroke="#7d98b8" />
        <path d={`M${x} ${y}l45 23-45 23-45-23Z`} fill={i === 4 ? '#dfedfb' : '#f8fbff'} stroke="#9bb6d0" />
        <path d={`M${x-22} ${y+23}l22-11 22 11-22 11Z`} fill={i === 4 ? '#1268e8' : '#c3d9ed'} />
        <path d={`M${x} ${y+66}v13m0 0 35 17m-35-17-35 17`} stroke="#6fa7db" strokeWidth=".8" />
        <circle cx={x} cy={y+23} r="3" fill="#1268e8" />
      </g>
    })}
    <text x="65" y="95" fontSize="9" fontFamily="monospace" fill="#5b7fa3">DISTRIBUTED COMPUTE</text>
    <path d="M80 108v29h37M483 198h42v32" stroke="#6a9fd5" strokeWidth=".8" />
    <text x="456" y="247" fontSize="9" fontFamily="monospace" fill="#5b7fa3">EDGE / 05</text>
  </g>
}
