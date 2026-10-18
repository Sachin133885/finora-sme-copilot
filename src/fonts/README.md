# Finora local typography

Derived from Adobe's official Source Sans 3 variable upright and Source Han Sans SC Regular/Bold releases:
- https://github.com/adobe-fonts/source-sans/tree/release/VF
- https://github.com/adobe-fonts/source-han-sans/tree/release/OTF/SimplifiedChinese

Distributed under the attached SIL OFL licenses. Internal modified font names are Finora UI Latin / Finora UI SC to respect the reserved font name. CSS family aliases identify their Source provenance.

The Latin subset includes Latin letters, digits, punctuation and currency symbols. Source Sans 3 digits are tabular by default; the proportional alternate is retained. The Chinese subsets contain GB2312 characters, UI characters, Chinese punctuation and fullwidth symbols. Rare characters fall back to the operating system's Chinese font. Local WOFF2 files avoid external font requests. Fonts use swap so text remains usable while loading.

Rebuild: download the upstream files named in scripts/subset-fonts.py into a temporary folder, install fonttools and brotli, then run `python scripts/subset-fonts.py /path/to/originals`. Latin layout features are retained; Chinese vertical alternates and hinting are omitted for web size. The offline HTML embeds the same subsets.
