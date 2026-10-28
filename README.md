# Claims & evidence

Interactive, source-linked review of the scientific opening of Lex Clips' "Is RFK Jr an antivaxxer?"

Static site in `site/`, with no build step or dependencies. Serve with `python3 -m http.server 8765 --directory site`.

The scientific opening receives 11 detailed assessments; a twelfth item addresses the later thimerosal discussion. Includes primary sources, evidence limitations, a confidence-interval explorer, a hypothetical rare-event demonstration and a searchable machine transcript.

Audio was transcribed through OpenRouter with `google/gemini-2.5-flash`. Timestamps mark minute-long chunk boundaries, not exact sentence times. Transcription and speaker labels can be wrong. The opening's word "averting" was checked in a second audio request. A mixed-speaker chunk is labeled. The final one-second segment was taken from the initial longer-chunk pass because a separate one-second audio request generated an invalid repetitive response. Original responses and downloaded media remain local and ignored by Git.

`transcribe.py` reads `/run/secrets/openrouter-key` at runtime. No credential is stored in the project or needed by the website. The downloaded video is not included in Git or hosted by the website. The site embeds the original YouTube video only when requested.

`build_content.py` produces `site/content.json`. Research date: October 28, 2026. This is a focused, AI-assisted review, not a systematic review or a complete audit of the clip. Most cited evidence predates the interview.
