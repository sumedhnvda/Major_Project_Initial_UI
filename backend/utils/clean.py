import os
import re
import html
from typing import Tuple

# ---------------- CONFIG ----------------
# Cleaning regexes (from your rules)
KANADA_RE = re.compile(r"[\u0C80-\u0CFF]")
DIGIT_RE = re.compile(r"\d")
NON_KANNADA_RE = re.compile(r"[^\s\u0C80-\u0CFF]")
REF_RE = re.compile(r"<ref\b[^>]*>.*?</ref>", flags=re.DOTALL | re.IGNORECASE)
TAG_RE = re.compile(r"<[^>]+>")
CITATION_RE = re.compile(r"\[\d+\]")
HEADING_RE = re.compile(r"={2,}.*?={2,}")
URL_RE = re.compile(r"https?:\/\/\S+|www\.\S+")
ASCII_LETTERS_RE = re.compile(r"[A-Za-z]")
MULTISPACE_RE = re.compile(r"\s+")

def clean_line(line: str) -> str:
    line = html.unescape(line)
    line = REF_RE.sub(" ", line)
    line = TAG_RE.sub(" ", line)
    line = CITATION_RE.sub(" ", line)
    line = HEADING_RE.sub(" ", line)
    line = URL_RE.sub(" ", line)
    line = URL_RE.sub(" ", line)
    line = ASCII_LETTERS_RE.sub("", line)
    line = DIGIT_RE.sub("", line)
    line = NON_KANNADA_RE.sub("", line)
    line = MULTISPACE_RE.sub(" ", line).strip()
    return line

def clean_text(raw_text: str) -> Tuple[str, int]:
    """
    Clean a string directly. Returns (cleaned_text, kept_lines_count).
    """
    cleaned_lines = []
    kept_lines = 0
    
    for raw in raw_text.splitlines():
        s = raw.strip()
        if not s or s.startswith("<doc") or s.startswith("</doc"):
            continue
        cleaned = clean_line(s)
        if not cleaned:
            continue
        if not KANADA_RE.search(cleaned):
            continue
        cleaned_lines.append(cleaned)
        kept_lines += 1
        
    return "\n".join(cleaned_lines), kept_lines

def clean_file(input_file: str, output_file: str) -> int:
    """
    Clean one file. Returns number of kept lines.
    """
    # os.makedirs(os.path.dirname(output_file), exist_ok=True)
    kept_lines = 0
    with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8") as outfile:
        for raw in infile:
            s = raw.strip()
            if not s or s.startswith("<doc") or s.startswith("</doc"):
                continue
            cleaned = clean_line(s)
            if not cleaned:
                continue
            if not KANADA_RE.search(cleaned):
                continue
            outfile.write(cleaned + "\n")
            kept_lines += 1
    return kept_lines
