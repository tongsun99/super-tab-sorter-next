#!/bin/sh
# Super Tab Sorter Next, tongsun99, 2026-10-21. GPL-3.0.
set -eu
cd "$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
exec python3 scripts/package.py
