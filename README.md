<h1 align="center">
  <img src="static/draftone-icon-1024.svg" alt="Draftone icon" width="64" style="vertical-align: middle;" />
  <span style="vertical-align: middle;">Draftone</span>
</h1>

<p align="center">A random ambient music / white noise generator.</p>

> Based on Tone.js, ~~Gemini~~, and my poor music theory...
>
> Developing...

Draftone is a browser-based experiment in generative ambient music.
It combines simple harmony rules, evolving melody logic, selectable instruments, and environmental noise to create an endless soundscape.

## Run

Serve the project over a local HTTP server:

```bash
python -m http.server 8000
```

Then open:

- `http://localhost:8000/`
- `http://localhost:8000/demo.html`
- `http://localhost:8000/demo2_with_chords.html`

Running it directly via `file://` is not recommended.
The app uses a Web Worker (`js/worker.js`) and audio assets such as `res/rain.mp3`, which browsers often restrict outside a local server context.

## Roadmap

See it at [here](./TODO.md).
