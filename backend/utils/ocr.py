import os
import shutil
import time
import pytesseract
from pdf2image import convert_from_path, pdfinfo_from_path
from concurrent.futures import ProcessPoolExecutor, as_completed
from tqdm import tqdm
from typing import Tuple

# ---------------- CONFIG ----------------
LANG = "kan+eng"            # tesseract languages
DPI = 150                   # lower DPI reduces memory & CPU, but may lower OCR accuracy
POPPLER_PATH = None         # e.g. r"C:\path\to\poppler\bin" on Windows or None
MAX_PAGE_WORKERS = 4
# ----------------------------------------

def ocr_page_worker(args: Tuple[str, int, int, str, str]) -> Tuple[int, bool, str]:
    """
    args = (pdf_path, page_no, dpi, lang, poppler_path)
    returns: (page_no, success(bool), text_or_error_msg)
    """
    pdf_path, page_no, dpi, lang, poppler_path = args
    try:
        # Convert just this page to image
        if poppler_path:
            pages = convert_from_path(pdf_path, dpi=dpi, first_page=page_no, last_page=page_no, poppler_path=poppler_path)
        else:
            pages = convert_from_path(pdf_path, dpi=dpi, first_page=page_no, last_page=page_no)

        if not pages:
            return page_no, False, f"[NO IMAGE for page {page_no}]"

        page_image = pages[0]

        # Run OCR on the page image
        text = pytesseract.image_to_string(page_image, lang=lang)

        # attempt to free memory references quickly
        try:
            del page_image
        except Exception:
            pass

        return page_no, True, text

    except Exception as e:
        return page_no, False, f"[ERROR page {page_no}: {e}]"

def ocr_book_with_parallel_pages(pdf_path: str, dpi: int = DPI,
                                 lang: str = LANG, poppler_path: str = POPPLER_PATH,
                                 max_workers: int = MAX_PAGE_WORKERS) -> Tuple[bool, str]:
    """
    OCR a single PDF book: process pages in parallel (bounded).
    Returns (success, full_text).
    """
    book_name = os.path.basename(pdf_path)
    print(f"\nProcessing book: {book_name}")

    # Get page count
    try:
        info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path) if poppler_path else pdfinfo_from_path(pdf_path)
        total_pages = int(info.get("Pages", 0))
    except Exception as e:
        print(f"  ❌ Could not read PDF info: {e}")
        return False, ""

    if total_pages == 0:
        print("  ⚠️ No pages found. Skipping.")
        return False, ""

    # We'll store results in a dict indexed by page_no
    page_results = {}

    # limit workers to total_pages
    workers = max(1, min(max_workers, total_pages))

    start_time = time.time()
    try:
        # Submit all page jobs but executor will only run worker-count at a time
        with ProcessPoolExecutor(max_workers=workers) as executor:
            future_to_page = {}
            for page_no in range(1, total_pages + 1):
                args = (pdf_path, page_no, dpi, lang, poppler_path)
                future = executor.submit(ocr_page_worker, args)
                future_to_page[future] = page_no

            # Progress bar for pages
            with tqdm(total=total_pages, desc=book_name, unit="pg", ncols=80) as pbar:
                for future in as_completed(future_to_page):
                    page_no = future_to_page[future]
                    try:
                        pno, success, text_or_err = future.result()
                    except Exception as exc:
                        pno = page_no
                        success = False
                        text_or_err = f"[EXCEPTION worker for page {page_no}: {exc}]"

                    # store result (so we can write pages in order later)
                    page_results[pno] = (success, text_or_err)
                    pbar.update(1)

        # Combine results in order
        full_text_parts = []
        for page_no in range(1, total_pages + 1):
            res = page_results.get(page_no)
            if res:
                success, text_or_err = res
                # full_text_parts.append(f"--- Page {page_no} ---") # Optional: keep page markers? User said "clean output", maybe remove markers? 
                # Keeping markers might be useful for context, but let's stick to content. 
                # Actually, clean.py usually strips these. Let's just append the text.
                full_text_parts.append(text_or_err if success else text_or_err + "\n")
                full_text_parts.append("\n\n")

        full_text = "".join(full_text_parts)

        elapsed = time.time() - start_time
        print(f"  ✅ OCR Complete (pages: {total_pages}, elapsed: {elapsed:.1f}s)")
        return True, full_text

    except KeyboardInterrupt:
        print("\n  ⏸ Interrupted by user.")
        return False, ""
    except Exception as e:
        print(f"  ❌ Unexpected error while processing book: {e}")
        return False, ""
