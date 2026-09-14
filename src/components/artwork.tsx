export function Artwork({ kind = "flower", className = "" }: { kind?: string; className?: string }) {
  return <svg className={className} viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      {kind === "eye" ? <>
        <path d="M52 220Q200 83 348 220Q200 357 52 220Z"/><path d="M65 220Q200 115 335 220M65 220Q200 325 335 220"/>
        <circle cx="200" cy="220" r="66"/><circle cx="200" cy="220" r="55"/><circle cx="200" cy="220" r="23" fill="currentColor"/><circle cx="211" cy="207" r="7" fill="var(--art-bg, #22221f)" stroke="none"/>
        {Array.from({length:36},(_,i)=><path key={i} d="M200 164L200 185" transform={`rotate(${i*10} 200 220)`}/>)}
        {Array.from({length:13},(_,i)=><path key={i} d="M200 104L200 73" transform={`rotate(${i*15-90} 200 220)`}/>)}
        <path d="M200 323V359M182 341H218M200 365V368M200 62V65"/>
      </> : kind === "star" ? <>
        <path d="M200 62L225 172L334 147L257 226L331 310L222 283L200 392L178 283L69 310L143 226L66 147L175 172Z"/>
        <path d="M200 62V392M66 147L331 310M334 147L69 310M200 62L200 226L225 172M200 226L334 147M200 226L222 283M200 226L69 310M200 226L175 172"/>
        <circle cx="200" cy="226" r="89"/><circle cx="200" cy="226" r="99" strokeDasharray="1 7"/>
        <path d="M92 83V111M78 97H106M308 348V376M294 362H322"/>
      </> : kind === "koi" ? <>
        <path d="M215 84C330 110 326 256 227 313C173 345 113 320 117 258C122 194 210 209 225 159C235 128 217 109 215 84Z"/>
        <path d="M215 84C162 83 120 60 128 99C130 122 155 142 184 145M215 84C253 58 269 34 276 65C283 97 267 116 263 122M227 313C205 347 162 371 142 345M131 302C98 291 75 261 91 236L119 245"/>
        <circle cx="147" cy="274" r="5"/><path d="M121 286Q132 303 150 302M135 293Q93 316 78 306"/>
        {Array.from({length:9},(_,i)=><path key={i} d={`M${226+i*3} ${133+i*16}q26 -14 43 8`}/>)}
        <path d="M89 166Q141 133 158 178M275 330Q319 298 337 318M61 194Q92 157 129 178"/>
      </> : <>
        <path d="M188 374C182 310 228 252 213 179M191 334Q127 300 104 252Q160 254 198 310M199 287Q269 280 290 232Q233 229 205 273M206 246Q169 214 144 213"/>
        {Array.from({length:7},(_,i)=><path key={i} d="M212 165C172 147 156 98 177 83C198 68 222 107 212 165Z" transform={`rotate(${i*51.43} 212 165)`}/>)}
        {Array.from({length:7},(_,i)=><path key={i} d="M212 157C186 129 189 102 193 95" transform={`rotate(${i*51.43} 212 165)`}/>)}
        <circle cx="212" cy="165" r="18"/><circle cx="212" cy="165" r="10" strokeDasharray="1 4"/>
        <path d="M111 258L187 322M283 238L206 277M191 352Q227 345 251 305Q209 314 191 352M125 365V391M112 378H138M309 123V141M300 132H318"/>
      </>}
    </g>
  </svg>;
}
