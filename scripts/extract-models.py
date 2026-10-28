"""Extracts only what the voice needs out of the pretrained archives.

    python extract-models.py <zip> <gpt-root> <venv> models|g2pw|nltk
"""
import os
import sys
import zipfile

zip_path, gpt_root, venv, what = sys.argv[1:5]

if what == "models":
    wanted = (
        "pretrained_models/chinese-hubert-base/",
        "pretrained_models/chinese-roberta-wwm-ext-large/",
        "pretrained_models/fast_langdetect/",
    )
    with zipfile.ZipFile(zip_path) as archive:
        members = [item for item in archive.infolist() if item.filename.startswith(wanted)]
        for item in members:
            archive.extract(item, os.path.join(gpt_root, "GPT_SoVITS"))
        print("models extracted:", len(members), "entries")
elif what == "g2pw":
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(os.path.join(gpt_root, "GPT_SoVITS", "text"))
    print("g2pw extracted")
elif what == "nltk":
    with zipfile.ZipFile(zip_path) as archive:
        archive.extractall(venv)
    print("nltk data extracted")
else:
    raise SystemExit("unknown target " + what)
