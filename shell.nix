{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell { packages = [ pkgs.python3 pkgs.ffmpeg pkgs.yt-dlp ]; shellHook = ''
  test -d .venv || python -m venv .venv
  source .venv/bin/activate
''; }
