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
MAX_PAGE_WORKERS = 1
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

def ocr_book_with_parallel_pages(pdf_path: str, out_txt_path: str, dpi: int = DPI,
                                 lang: str = LANG, poppler_path: str = POPPLER_PATH,
                                 max_workers: int = MAX_PAGE_WORKERS) -> bool:
    """
    OCR a single PDF book: process pages in parallel (bounded), write a .tmp then rename.
    Returns True on success, False on failure (partial outputs kept as .tmp if interrupted).
    """
    book_name = os.path.basename(pdf_path)
    print(f"\nProcessing book: {book_name}")

    # Get page count
    try:
        info = pdfinfo_from_path(pdf_path, poppler_path=poppler_path) if poppler_path else pdfinfo_from_path(pdf_path)
        total_pages = int(info.get("Pages", 0))
    except Exception as e:
        print(f"  ❌ Could not read PDF info: {e}")
        return False

    if total_pages == 0:
        print("  ⚠️ No pages found. Skipping.")
        return False

    temp_out = out_txt_path + ".tmp"
    # remove stale temp
    if os.path.exists(temp_out):
        try:
            os.remove(temp_out)
        except Exception:
            pass

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

        # All page jobs completed (maybe with failures). Write the output file in order.
        with open(temp_out, "w", encoding="utf-8") as fout:
            for page_no in range(1, total_pages + 1):
                res = page_results.get(page_no)
                if res is None:
                    fout.write(f"--- Page {page_no} ---\n[NO RESULT]\n\n")
                else:
                    success, text_or_err = res
                    fout.write(f"--- Page {page_no} ---\n")
                    fout.write(text_or_err if success else text_or_err + "\n")
                    fout.write("\n\n")

        # move temp to final
        shutil.move(temp_out, out_txt_path)
        elapsed = time.time() - start_time
        print(f"  ✅ Saved: {out_txt_path}  (pages: {total_pages}, elapsed: {elapsed:.1f}s)")
        return True

    except KeyboardInterrupt:
        print("\n  ⏸ Interrupted by user. Partial results may remain as .tmp")
        # leave temp as-is so user can inspect
        return False
    except Exception as e:
        print(f"  ❌ Unexpected error while processing book: {e}")
        try:
            if os.path.exists(temp_out):
                os.remove(temp_out)
        except Exception:
            pass
        return False
