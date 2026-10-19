"""Build local OFL font subsets from official Adobe release files in argv[1].
Requires fonttools + brotli. Retains layout features, including tnum.
"""
import sys,pathlib
from fontTools import subset
source=pathlib.Path(sys.argv[1]);out=pathlib.Path('src/fonts');out.mkdir(exist_ok=True)
common=set(range(0x20,0x180))|set(range(0x2000,0x2070))|{0x20ac,0xffe5,0x2212}
chinese=common|set(range(0x3000,0x3040))|set(range(0xff00,0xfff0))
for a in range(0xa1,0xff):
 for b in range(0xa1,0xff):
  try: chinese.update(map(ord,bytes([a,b]).decode('gb2312')))
  except UnicodeDecodeError: pass
for f in pathlib.Path('src').glob('*'):
 if f.suffix in ('.js','.html'):chinese.update(map(ord,f.read_text()))
for name,target,chars in [('SourceSans3VF-Upright.ttf','source-sans-3-latin.woff2',common),('SourceHanSansSC-Regular.otf','source-han-sans-sc-regular.woff2',chinese),('SourceHanSansSC-Bold.otf','source-han-sans-sc-bold.woff2',chinese)]:
 options=subset.Options();options.flavor='woff2';options.layout_features=['*'] if 'latin' in target else ['locl'];options.hinting=False;options.name_IDs=['*'];options.name_legacy=True
 font=subset.load_font(str(source/name),options);sub=subset.Subsetter(options);sub.populate(unicodes=chars);sub.subset(font)
 family='Finora UI Latin' if 'latin' in target else 'Finora UI SC'
 style='Bold' if 'bold' in target else 'Regular'
 for n in font['name'].names:
  if n.nameID in (1,2,3,4,6,16,17):
   value=style if n.nameID in (2,17) else family if n.nameID in (1,16) else (family+'-'+style).replace(' ','') if n.nameID==6 else family+' '+style
   n.string=value.encode(n.getEncoding(),errors='replace')
 if 'CFF ' in font:
  cff=font['CFF '].cff;cff.fontNames=[(family+'-'+style).replace(' ','')];cff.topDictIndex[0].FamilyName=family;cff.topDictIndex[0].FullName=family+' '+style
 cmap=font.getBestCmap()
 assert len({font['hmtx'][cmap[ord(d)]][0] for d in '0123456789'})==1,'Digits must remain tabular'
 assert all(ord(c) in cmap for c in ('0123456789¥' if 'latin' in target else '融财现金人民币'))
 subset.save_font(font,str(out/target),options)
 print(target,(out/target).stat().st_size)
