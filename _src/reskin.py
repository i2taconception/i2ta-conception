#!/usr/bin/env python3
"""Aligne les pages de service et les pages annexes sur la charte de la refonte (noir chaud, cuivre, Unbounded).

Pages de service : remplacement des jetons de couleur et de la police de titre dans leur CSS en ligne.
Usage : python3 _src/reskin.py  (depuis la racine du dépôt). Idempotent.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SERVICE = ["conception-mecanique-solidworks/index.html", "retro-ingenierie-stl-step/index.html"]
SMALL = ["mentions-legales/index.html", "en/legal-notice/index.html", "404.html"]

COLORS = [
    ("#0a0a0c", "#080808"), ("#0f1014", "#0e0d0c"), ("#13151a", "#121110"), ("#1a1d24", "#191714"),
    ("#20232b", "#25221f"), ("#181a20", "#1a1816"), ("#9aa0ad", "#aaa298"), ("#8b92a0", "#8d867d"),
    ("#5b8def", "#e39a5f"), ("#8ab4ff", "#f2b98a"), ("#3a5fc4", "#b4703f"), ("#6b7280", "#7a7066"),
    ("#07080a", "#060505"), ("#f3f4f6", "#f3efe9"),
    ("rgba(91,141,239", "rgba(227,154,95"), ("rgba(138,180,255", "rgba(242,185,138"),
    ("rgba(10,10,12", "rgba(8,8,8"), ("rgba(8,8,10", "rgba(8,8,8"),
]
UNBOUNDED = '@font-face{font-family:"Unbounded";font-style:normal;font-weight:200 900;font-display:swap;src:url("/fonts/unbounded-latin-wght-normal.woff2") format("woff2-variations")}\n'


def reskin_service(path):
    s = path.read_text(encoding="utf-8")
    for a, b in COLORS:
        s = s.replace(a, b).replace(a.upper(), b)
    s = s.replace('--display: "Space Grotesk", sans-serif;', '--display: "Unbounded", sans-serif;')
    if 'font-family:"Unbounded"' not in s:
        s = s.replace("<style>@font-face", "<style>" + UNBOUNDED + "@font-face", 1)
    path.write_text(s, encoding="utf-8")


def reskin_small(path):
    """Pages courtes (mentions légales, 404) : mêmes jetons, titres en Unbounded."""
    s = path.read_text(encoding="utf-8")
    for a, b in COLORS:
        s = s.replace(a, b)
    s = s.replace('"Space Grotesk",sans-serif', '"Unbounded",sans-serif')
    if 'font-family:"Unbounded";font-style' not in s:
        s = s.replace("<style>", "<style>" + UNBOUNDED, 1)
    path.write_text(s, encoding="utf-8")


if __name__ == "__main__":
    for f in SERVICE:
        reskin_service(ROOT / f)
    for f in SMALL:
        reskin_small(ROOT / f)
    print("pages de service et pages annexes recolorées")
