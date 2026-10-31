#!/usr/bin/env python3
"""Ajoute au .pptx généré par build.js : transitions de diapositives et animations d'entrée (fondu, balayage),
par clic, avec construction par paragraphes pour les panneaux de code.
usage : python3 animate.py build/raw.pptx build/anim.json sortie.pptx"""
import json, sys, zipfile, re
from lxml import etree

P = 'http://schemas.openxmlformats.org/presentationml/2006/main'
NSMAP = {'p': P}
FX = {'f': ('10', '0', 'fade', 500), 'w': ('22', '8', 'wipe(left)', 500)}   # presetID, sous-type, filtre, durée (ms)
TRANS = {
    'fade': '<p:transition xmlns:p="%s" spd="med"><p:fade/></p:transition>' % P,
    'push': '<p:transition xmlns:p="%s" spd="slow"><p:push dir="l"/></p:transition>' % P,
}

def shape_index(root):
    out = {}
    for c in root.iter('{%s}cNvPr' % P):
        parent = c.getparent().getparent().tag.split('}')[1]    # sp, pic, graphicFrame, cxnSp
        out[c.get('name')] = (c.get('id'), parent)
    return out

def build_timing(anims, idx):
    ids = iter(range(3, 100000))
    groups = {}
    for a in anims:
        groups.setdefault(a['g'], []).append(a)
    clicks, bld = [], {}
    for g in sorted(groups):
        eff = []
        for k, a in enumerate(groups[g]):
            spid, kind = idx[a['name']]
            preset, sub, filt, dur = FX[a['t']]
            node = 'clickEffect' if k == 0 else 'withEffect'
            grp = ' grpId="0"' if kind == 'sp' else ''
            tgt = '<p:spTgt spid="%s">%s</p:spTgt>' % (spid, ('<p:txEl><p:pRg st="%d" end="%d"/></p:txEl>' % tuple(a['pr'])) if a.get('pr') else '')
            i = next(ids); j = next(ids); l = next(ids)
            eff.append(
                '<p:par><p:cTn id="%d" presetID="%s" presetClass="entr" presetSubtype="%s" fill="hold"%s nodeType="%s"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                '<p:set><p:cBhvr><p:cTn id="%d" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn><p:tgtEl>%s</p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to><p:strVal val="visible"/></p:to></p:set>'
                '<p:animEffect transition="in" filter="%s"><p:cBhvr><p:cTn id="%d" dur="%d"/><p:tgtEl>%s</p:tgtEl></p:cBhvr></p:animEffect>'
                '</p:childTnLst></p:cTn></p:par>' % (i, preset, sub, grp, node, j, tgt, filt, l, dur, tgt))
            if kind == 'sp':
                b = bld.setdefault(spid, {'p': False}); b['p'] = b['p'] or bool(a.get('pr'))
        a1 = next(ids); a2 = next(ids)
        clicks.append('<p:par><p:cTn id="%d" fill="hold"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="%d" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>%s</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>' % (a1, a2, ''.join(eff)))
    bl = ''.join('<p:bldP spid="%s" grpId="0"%s/>' % (s, ' build="p"' if v['p'] else ' animBg="1"') for s, v in bld.items())
    xml = ('<p:timing xmlns:p="%s"><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
           '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>%s</p:childTnLst></p:cTn>'
           '<p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
           '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
           '</p:childTnLst></p:cTn></p:par></p:tnLst>%s</p:timing>') % (P, ''.join(clicks), ('<p:bldLst>%s</p:bldLst>' % bl) if bl else '')
    return etree.fromstring(xml)

def process(xml_bytes, spec):
    root = etree.fromstring(xml_bytes)
    # retire d'éventuels restes d'une passe précédente
    for tag in ('transition', 'timing'):
        for e in root.findall('p:' + tag, NSMAP): root.remove(e)
    anchor = root.find('p:clrMapOvr', NSMAP)
    if anchor is None: anchor = root.find('p:cSld', NSMAP)
    pos = list(root).index(anchor) + 1
    if spec.get('trans') in TRANS:
        root.insert(pos, etree.fromstring(TRANS[spec['trans']])); pos += 1
    if spec['anims']:
        idx = shape_index(root)
        missing = [a['name'] for a in spec['anims'] if a['name'] not in idx]
        if missing: raise SystemExit('formes introuvables dans la diapositive %d : %s' % (spec['idx'], missing[:5]))
        root.insert(pos, build_timing(spec['anims'], idx))
    return etree.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)

def main(src, animjson, dst):
    spec = {s['idx']: s for s in json.load(open(animjson, encoding='utf-8'))['slides']}
    zin = zipfile.ZipFile(src); zout = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
    n = 0
    for item in zin.infolist():
        data = zin.read(item.filename)
        m = re.fullmatch(r'ppt/slides/slide(\d+)\.xml', item.filename)
        if m and int(m.group(1)) in spec:
            data = process(data, spec[int(m.group(1))]); n += 1
        zout.writestr(item, data)
    zout.close()
    print('diapositives animées :', n)

if __name__ == '__main__':
    main(*sys.argv[1:4])
