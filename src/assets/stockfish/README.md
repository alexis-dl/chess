# Stockfish (engine of the Analysis page)

Files `stockfish-18-lite-single.js` and `stockfish-18-lite-single.wasm` come
unmodified from the npm package `stockfish@18.0.5` (Stockfish.js by Nathan
Rugg, https://github.com/nmrugg/stockfish.js), a WebAssembly build of
Stockfish (https://github.com/official-stockfish/Stockfish).

Stockfish is free software under the GNU General Public License v3
(see COPYING.txt). Its source code is available from the links above.

The lite single-threaded build is used because it needs no cross-origin
isolation headers, which GitHub Pages does not send, and it is small (~7 MB).
It runs in a Web Worker started by src/app/analysis/engine.service.ts.
