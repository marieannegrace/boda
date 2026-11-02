import styles from "./LoveIssue.module.css";

export type BotanicalScene = "welcome" | "cover" | "history" | "photos" | "family" | "moment" | "message" | "closing";

const olive = (
  <svg viewBox="0 0 120 300" fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <path d="M25 295C37 241 76 205 68 144S78 58 99 10M41 249L20 209M61 207L99 172M69 163L35 126M69 118L99 82M77 67L61 33" />
    <path d="M31 232C12 229 7 211 9 195C24 203 32 217 31 232ZM50 230C47 208 62 191 75 188C73 208 64 222 50 230ZM65 201C72 182 91 179 110 182C97 198 79 207 65 201ZM67 180C48 174 39 159 43 143C59 152 67 164 67 180ZM68 153C75 133 92 126 108 129C98 146 84 156 68 153ZM56 149C36 146 24 131 25 113C43 122 54 133 56 149ZM70 115C73 95 92 85 109 88C98 105 85 114 70 115ZM75 91C55 85 49 67 53 51C68 61 75 75 75 91ZM85 48C82 28 93 13 106 5C108 23 99 40 85 48Z" />
    <path d="M12 202L28 225M52 223L70 195M75 198L101 185M48 152L64 174M77 148L101 133M33 123L51 143M79 108L103 92M58 60L71 83M90 39L102 14" strokeWidth="0.5" />
    <path d="M18 275C9 261 10 246 17 234M21 268L11 254M24 258L31 244M92 166L102 151" />
    <ellipse cx="104" cy="148" rx="3" ry="5" transform="rotate(25 104 148)" />
  </svg>
);

const wildflowers = (
  <svg viewBox="0 0 120 300" fill="none" stroke="currentColor" strokeWidth="0.85" strokeLinecap="round" strokeLinejoin="round" focusable="false">
    <path d="M28 298C67 232 46 171 77 91M42 266C25 228 33 177 20 145M50 236C91 214 85 158 101 129M57 183C58 151 45 122 48 73M64 221C77 190 96 186 112 177" />
    <path d="M40 251C18 247 7 228 9 207C28 215 39 233 40 251ZM49 223C64 204 75 200 88 199C81 219 67 229 49 223ZM54 193C33 185 29 168 32 153C48 165 53 180 54 193ZM66 154C72 139 87 132 101 135C91 148 81 156 66 154ZM30 201C13 193 8 179 11 166C26 176 30 187 30 201Z" />
    <path d="M35 241L14 216M57 219L80 204M49 185L36 163M73 149L93 139M25 193L14 174" strokeWidth="0.45" />
    <path d="M76 90C59 94 52 82 66 75C47 69 57 53 72 64C68 42 86 41 85 61C98 45 110 60 94 70C115 72 108 89 91 82C99 100 82 107 79 88Z" />
    <circle cx="80" cy="74" r="5" />
    <path d="M76 71L84 77M77 78L83 70M18 144C5 149 1 138 12 134C-1 127 8 117 18 126C18 110 32 114 27 128C41 119 46 133 32 138C44 150 29 157 24 144Z" />
    <circle cx="22" cy="136" r="3" />
    <path d="M47 72C34 77 29 67 39 61C24 54 35 44 44 53C45 36 59 41 54 55C68 46 73 60 59 65C69 78 54 83 51 71Z" />
    <circle cx="48" cy="63" r="3" />
    <path d="M99 130C88 134 84 124 94 120C82 114 90 104 99 112C100 97 113 101 108 114C122 107 125 120 112 124C121 135 108 141 104 129ZM111 177L108 169M111 177L119 172M111 177L117 183M111 177L105 183" />
    <path d="M5 288C38 276 14 255 3 264C-4 270 3 278 10 273" strokeWidth="0.65" />
  </svg>
);

export function BotanicalAtmosphere({ scene, alternate = false }: { scene: BotanicalScene; alternate?: boolean }) {
  return (
    <div className={styles.botanical} data-botanical={scene} data-alternate={alternate} aria-hidden="true">
      <div className={styles.botanicalOlive} data-botanical-motif>{olive}</div>
      <div className={styles.botanicalFlowers} data-botanical-motif>{wildflowers}</div>
    </div>
  );
}
