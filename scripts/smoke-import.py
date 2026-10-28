"""Imports the inference stack the way api_v2.py does.

    python smoke-import.py <repo-root> <gpt-sovits-dir>
"""
import sys

repo, gpt = sys.argv[1], sys.argv[2]
sys.path[:0] = [repo, gpt]

from GPT_SoVITS.TTS_infer_pack.TTS import TTS, TTS_Config  # noqa: E402

print("import ok")
