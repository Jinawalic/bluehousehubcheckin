export function HubScene() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 560 390"
      fill="none"
      className="hub-scene-float h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hub-ground" x1="112" y1="287" x2="430" y2="345" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D9ECFF" />
          <stop offset="1" stopColor="#9FC4F5" />
        </linearGradient>
        <linearGradient id="hub-front" x1="252" y1="141" x2="252" y2="288" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F8FBFF" />
          <stop offset="1" stopColor="#DCEAFF" />
        </linearGradient>
        <linearGradient id="hub-side" x1="346" y1="165" x2="346" y2="284" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B9D5F7" />
          <stop offset="1" stopColor="#85AFE5" />
        </linearGradient>
        <filter id="hub-shadow" x="54" y="37" width="444" height="348" filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      <ellipse cx="281" cy="319" rx="188" ry="31" fill="#071A45" fillOpacity=".3" filter="url(#hub-shadow)" />
      <path d="m83 278 178-91 220 92-180 94-218-95Z" fill="url(#hub-ground)" />
      <path d="m83 278 218 95v14L83 292v-14Z" fill="#7EA9DF" />
      <path d="m301 373 180-94v14l-180 94v-14Z" fill="#5C88C2" />

      <path d="m176 155 105-55 132 57-107 57-130-59Z" fill="#91B5E5" />
      <path d="m176 155 130 59v128l-130-59V155Z" fill="url(#hub-front)" />
      <path d="m306 214 107-57v128l-107 57V214Z" fill="url(#hub-side)" />
      <path d="m162 151 119-64 145 63-119 65-145-64Z" fill="#F7FBFF" />
      <path d="m162 151 145 64v18l-145-65v-17Z" fill="#BDD6F4" />
      <path d="m307 215 119-65v18l-119 65v-18Z" fill="#8DB3E3" />

      <path d="m190 170 31 14v31l-31-14v-31Z" fill="#7CC7E9" />
      <path d="m234 189 31 14v31l-31-14v-31Z" fill="#7CC7E9" />
      <path d="m190 222 31 14v31l-31-14v-31Z" fill="#7CC7E9" />
      <path d="m234 241 31 14v31l-31-14v-31Z" fill="#7CC7E9" />
      <path d="m282 193 12 5v36l-12-5v-36Z" fill="#B8D1F0" />

      <path d="m323 226 28-15v30l-28 15v-30Z" fill="#4E77AF" />
      <path d="m366 203 28-15v30l-28 15v-30Z" fill="#4E77AF" />
      <path d="m323 269 28-15v16l-28 15v-16Z" fill="#4E77AF" />
      <path d="m366 246 28-15v16l-28 15v-16Z" fill="#4E77AF" />

      <path d="m269 278 37 17 36-19-37-18-36 20Z" fill="#FFFFFF" />
      <path d="m269 278 36 17v57l-36-17v-57Z" fill="#17376F" />
      <path d="m305 295 37-19v57l-37 19v-57Z" fill="#315B98" />
      <path d="m259 272 47 22 48-25-47-22-48 25Z" fill="#FFFFFF" />
      <path d="m247 282 59 27 59-31-59-27-59 31Z" fill="#B3CEF0" fillOpacity=".9" />

      <path d="m132 271 14-7 14 7v35l-14 8-14-8v-35Z" fill="#277B69" />
      <path d="m146 279 14-8v35l-14 8v-35Z" fill="#1C5F55" />
      <path d="M145 274c-19-13-12-33 1-41 11 13 12 29-1 41Z" fill="#58B99A" />
      <path d="M147 274c3-19 17-24 28-19-2 17-12 24-28 19Z" fill="#7DD2AC" />
      <path d="M144 276c-15-16-28-12-34-1 11 12 23 13 34 1Z" fill="#48A987" />

      <path d="m421 279 12-6 12 6v28l-12 7-12-7v-28Z" fill="#277B69" />
      <path d="m433 286 12-7v28l-12 7v-28Z" fill="#1C5F55" />
      <path d="M432 282c-15-11-9-26 1-33 9 10 9 23-1 33Z" fill="#58B99A" />
      <path d="M434 282c3-15 14-19 23-15-2 13-10 19-23 15Z" fill="#7DD2AC" />

      <g className="hub-scene-pin">
        <circle cx="347" cy="87" r="34" fill="#BCEBFF" fillOpacity=".16" />
        <path d="M347 46c-17 0-30 13-30 29 0 22 30 47 30 47s30-25 30-47c0-16-13-29-30-29Z" fill="#57D3BE" />
        <circle cx="347" cy="75" r="11" fill="#F6FFFE" />
        <path d="m345 75 2 2 5-5" stroke="#138D7D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="m357 127 13 7-13 7-13-7 13-7Z" fill="#BCEBFF" fillOpacity=".65" />
      <path d="m112 224 7 4-7 4-7-4 7-4Z" fill="#D2F1FF" />
      <path d="m448 127 6 3-6 4-6-4 6-3Z" fill="#D2F1FF" />
    </svg>
  )
}
