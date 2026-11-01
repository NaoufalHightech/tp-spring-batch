#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Génère le PPT de la formation Spring Batch, module par module (voir PPT_PLAN.md).

Usage :   python pptx/generate_pptx.py            # Module 1 (par défaut)
          python pptx/generate_pptx.py 1 2        # plusieurs modules, dans l'ordre du plan
Sortie :  pptx/build/Spring_Batch_Module_<ids>.pptx   (dossier ignoré par git)
Besoin :  pip install python-pptx

Choix de conception
- Une fonction par module (`build_module_N`) ; les utilitaires sont communs. Ajouter un module = ajouter
  une fonction et l'enregistrer dans BUILDERS.
- Le PPT d'origine ne contient AUCUNE image : tous ses schémas sont des formes natives. On fait pareil :
  TOUS les schémas (d'origine et S01-S38) sont dessinés en formes natives python-pptx (rectangles arrondis,
  ovales, connecteurs fléchés, tableaux). Pas d'image, pas de Manim ; ASSETS_A_CREER.md liste ceux qui restent à écrire.
- Les diapositives utilisent la disposition « Titre seul » : le titre reste un vrai titre (plan, accessibilité).
- Toute la charte tient dans PAL, FONT et MONO : la changer ne demande aucune modification des diapositives.
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.dml import MSO_LINE
from pptx.enum.shapes import MSO_CONNECTOR, MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, MSO_AUTO_SIZE, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt

# --------------------------------------------------------------------------- charte graphique
# Palette EXACTE du PPT d'origine (thème « SpringBatchCours » relevé dans pptx/Spring_Batch_cours_complet.pptx
# et couleurs du code relevées dans pptx/lib.js). Changer la palette = modifier ce dictionnaire seulement.
PAL = {
    "forest": "1D3B2A",   # dk2     : séparateurs, bordure du code, texte secondaire
    "text": "10211A",     # dk1     : texte et fond des panneaux de code
    "white": "FFFFFF",    # lt1     : fond des diapositives
    "light": "EEF5EF",    # lt2     : fond des cartes, lignes paires des tableaux
    "green": "2E7D4F",    # accent2 : couleur principale (en-têtes de tableaux, boîtes)
    "lime": "6DB33F",     # accent1 : nom de fichier et chaînes dans le code
    "orange": "E9A23B",   # accent3
    "red": "D4503F",      # accent4
    "blue": "3F7CAC",     # accent5
    "purple": "8A63D2",   # accent6
    "code_fg": "E8F0EA", "code_comment": "8FA89A", "code_kw": "C3A6F5", "code_type": "7FC1EE",
}
PAL["bg"], PAL["code_bg"], PAL["muted"] = PAL["white"], PAL["text"], PAL["forest"]
# Polices alignées sur le PPT d'origine (Cambria / Courier New).
FONT, FONT_TITLE, MONO = "Cambria", "Cambria", "Courier New"
SW, SH = 13.333, 7.5            # 16:9, en pouces
MX = 0.6                        # marge horizontale
CW = SW - 2 * MX                # largeur utile
STACK = "Spring Boot 4.1.2 · Spring Batch 6.0.6 · PostgreSQL 16 · Java 25"
OFFICIALS: list[tuple[str, int]] = []           # (titre officiel, n° de diapositive)


def rgb(name: str) -> RGBColor:
    return RGBColor.from_string(PAL.get(name, name))


# --------------------------------------------------------------------------- texte
_MARK = re.compile(r"(\*\*.+?\*\*|`.+?`)")


def _run(p, text, size, color="text", bold=False, italic=False, font=FONT):
    r = p.add_run()
    r.text = text
    f = r.font
    f.name, f.size, f.bold, f.italic = font, Pt(size), bold, italic
    f.color.rgb = rgb(color)
    return r


def rich(p, text, size, color="text", bold=False):
    """Écrit `text` dans le paragraphe `p` ; **gras** et `code` sont interprétés."""
    for part in _MARK.split(text):
        if not part:
            continue
        if part.startswith("**"):
            _run(p, part[2:-2], size, color, True)
        elif part.startswith("`"):
            _run(p, part[1:-1], size * 0.95, "blue" if color in ("text", "muted") else color, bold, font=MONO)
        else:
            _run(p, part, size, color, bold)


def plain(text: str) -> str:
    return text.replace("`", "").replace("**", "")


def add_text(slide, text, x, y, w, h, size=16, color="text", bold=False,
             align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap, tf.vertical_anchor = True, anchor
    tf.margin_left = tf.margin_right = Inches(0.05)
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        rich(p, line, size, color, bold)
    return tb


def add_title(slide, text, dark=False):
    """Titre dans le vrai placeholder de titre ; la taille s'adapte à la longueur."""
    t = slide.shapes.title
    t.left, t.top, t.width, t.height = Inches(MX), Inches(0.3), Inches(CW), Inches(1.0)
    tf = t.text_frame
    tf.word_wrap, tf.vertical_anchor, tf.auto_size = True, MSO_ANCHOR.MIDDLE, MSO_AUTO_SIZE.NONE
    clean = plain(text)
    size = 34 if len(clean) <= 45 else 30 if len(clean) <= 62 else 26
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    _run(p, clean, size, "white" if dark else "text", True, font=FONT_TITLE)


def add_bullets(slide, items, x=MX, y=1.6, w=CW, h=4.8, size=20, numbered=False, color="text"):
    """Liste à puces réelles (balise buChar / buAutoNum), pas de caractère « • » saisi à la main."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(10)
        pPr = p._p.get_or_add_pPr()
        pPr.set("marL", str(Inches(0.4)))
        pPr.set("indent", str(-Inches(0.4)))
        bu = pPr.makeelement(qn("a:buAutoNum" if numbered else "a:buChar"),
                             {"type": "arabicPeriod"} if numbered else {"char": "•"})
        pPr.append(bu)
        rich(p, item, size, color)
    return tb


# --------------------------------------------------------------------------- tableaux
def add_table(slide, headers, rows, x=MX, y=1.55, w=CW, col_w=None, size=None, row_h=None):
    """Tableau à en-tête vert foncé et lignes alternées ; chaque cellule est colorée explicitement."""
    n, cols = len(rows) + 1, len(headers)
    size = size or (16 if len(rows) <= 4 else 14 if len(rows) <= 6 else 12)
    row_h = row_h or max(0.5, size * 2.1 / 72)
    gf = slide.shapes.add_table(n, cols, Inches(x), Inches(y), Inches(w), Inches(row_h * n))
    tbl = gf.table
    col_w = col_w or [w / cols] * cols
    for i, cw in enumerate(col_w):
        tbl.columns[i].width = Inches(cw)
    for r in range(n):
        tbl.rows[r].height = Inches(row_h)
        for c in range(cols):
            cell = tbl.cell(r, c)
            cell.margin_left = cell.margin_right = Inches(0.1)
            cell.vertical_anchor = MSO_ANCHOR.MIDDLE
            cell.fill.solid()
            cell.fill.fore_color.rgb = rgb("green" if r == 0 else "light" if r % 2 else "white")
            tf = cell.text_frame
            tf.word_wrap = True
            text = headers[c] if r == 0 else rows[r - 1][c]
            rich(tf.paragraphs[0], text, size, "white" if r == 0 else "text", r == 0)
    return gf


# --------------------------------------------------------------------------- cartes et légendes
def add_cards(slide, cards, x=MX, y=1.6, w=CW, h=4.6, cols=3, size=15, gap=0.25,
              colors=("green", "blue", "orange", "purple")):
    """Cartes à contour coloré : [(titre, texte), ...] ; texte multi-lignes avec \\n."""
    rows = -(-len(cards) // cols)
    cw, ch = (w - gap * (cols - 1)) / cols, (h - gap * (rows - 1)) / rows
    for i, (title, body) in enumerate(cards):
        cx, cy = x + (i % cols) * (cw + gap), y + (i // cols) * (ch + gap)
        col = colors[i % len(colors)]
        sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(cx), Inches(cy), Inches(cw), Inches(ch))
        sh.adjustments[0] = 0.05
        sh.shadow.inherit = False
        sh.fill.solid(); sh.fill.fore_color.rgb = rgb("light")
        sh.line.color.rgb = rgb(col); sh.line.width = Pt(1.25)
        tf = sh.text_frame
        tf.word_wrap, tf.vertical_anchor = True, MSO_ANCHOR.TOP
        tf.margin_left = tf.margin_right = Inches(0.18); tf.margin_top = Inches(0.12)
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.LEFT
        _run(p, plain(title), size + 3, col, True)
        for line in body.split("\n"):
            q = tf.add_paragraph(); q.alignment = PP_ALIGN.LEFT; q.space_before = Pt(6)
            rich(q, line, size, "text")


def add_callouts(slide, items, x, y, w, size=14):
    """Points numérotés (pastille + texte), empilés ; la hauteur de chaque point est estimée."""
    cpl = max(10, int(w * 72 / (size * 0.52)))            # caractères par ligne (estimation)
    cy = y
    for i, item in enumerate(items, 1):
        lines = max(1, -(-len(plain(item)) // cpl))
        h = max(0.5, lines * size * 1.25 / 72 + 0.12)
        dot = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(cy + 0.04), Inches(0.36), Inches(0.36))
        dot.shadow.inherit = False
        dot.fill.solid(); dot.fill.fore_color.rgb = rgb("green"); dot.line.fill.background()
        tf = dot.text_frame
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER
        _run(p, str(i), 13, "white", True)
        add_text(slide, item, x + 0.45, cy, w - 0.45, h, size)
        cy += h + 0.08


def add_caption(slide, text, y=6.55, x=MX, w=CW, color="muted"):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(0.4))
    tf = tb.text_frame; tf.word_wrap = True
    _run(tf.paragraphs[0], text, 12, color, False, italic=True)


def add_official(slide, title: str, num: int):
    """Légende « schéma officiel à insérer » (les images officielles sont ajoutées à la main)."""
    OFFICIALS.append((title, num))
    add_caption(slide, f"Schéma officiel à insérer : « {title} » (documentation Spring Batch)", y=6.62, color="blue")


# --------------------------------------------------------------------------- code
_KW = (r"\b(?:public|private|protected|class|record|interface|return|new|static|final|void|var|extends|"
       r"implements|throws|switch|case|default|import|package|if|else|for|while|try|catch|null|true|false)\b")
# commentaire | chaîne | annotation | mot-clé | type (identifiant capitalisé) : mêmes catégories que le PPT d'origine
_TOK = re.compile(r"(?P<c>//.*$|--.*$|^\s*#.*$)|(?P<s>\"(?:[^\"\\]|\\.)*\")|(?P<a>@\w+)|(?P<k>" + _KW
                  + r")|(?P<t>\b[A-Z][A-Za-z0-9_]*\b)")
_COL = {"c": PAL["code_comment"], "s": PAL["lime"], "a": PAL["orange"], "k": PAL["code_kw"], "t": PAL["code_type"]}


def _segments(line: str, lang: str):
    """Découpe une ligne en (texte, couleur) ; coloration volontairement simple et robuste."""
    if lang == "xml":
        for part in re.split(r"(<!--.*?-->|</?[\w:.\-]+|/?>)", line):
            if part:
                yield part, PAL["code_comment"] if part.startswith("<!--") else PAL["code_type"] if part[0] in "</" or part == ">" else PAL["code_fg"]
        return
    if lang == "properties":
        m = re.match(r"^(\s*#.*)$|^([\w.\-]+)(=)(.*)$", line)
        if m and m.group(1):
            yield line, PAL["code_comment"]
        elif m:
            yield m.group(2), PAL["code_type"]; yield "=", PAL["code_fg"]; yield m.group(4), PAL["lime"]
        else:
            yield line, PAL["code_fg"]
        return
    pos = 0
    for m in _TOK.finditer(line):
        if m.start() > pos:
            yield line[pos:m.start()], PAL["code_fg"]
        yield m.group(0), _COL[m.lastgroup]
        pos = m.end()
    if pos < len(line):
        yield line[pos:], PAL["code_fg"]


def add_code(slide, code, x=MX, y=1.55, w=7.9, lang="java", size=None, filename=None, h=None):
    """Panneau de code (comme le PPT d'origine) : fond sombre, bordure verte, nom du fichier en vert clair
    en 1re ligne. Taille choisie selon le nombre de lignes ; pas de retour à la ligne automatique."""
    lines = code.strip("\n").split("\n")
    size = size or (16 if len(lines) <= 8 else 14 if len(lines) <= 12 else 12 if len(lines) <= 18 else 11)
    h = h or (len(lines) + (1 if filename else 0)) * size * 1.22 / 72 + 0.4
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = 0.03
    sh.shadow.inherit = False
    sh.fill.solid(); sh.fill.fore_color.rgb = rgb("code_bg")
    sh.line.color.rgb = rgb("forest"); sh.line.width = Pt(1)
    tf = sh.text_frame
    tf.word_wrap, tf.vertical_anchor = False, MSO_ANCHOR.TOP
    tf.margin_left = tf.margin_right = Inches(0.2); tf.margin_top = Inches(0.15)
    first = True
    if filename:
        p = tf.paragraphs[0]; p.alignment = PP_ALIGN.LEFT
        _run(p, filename, 11, "lime", True, font=MONO)
        first = False
    for line in lines:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        if not line:
            _run(p, " ", size, "code_fg", font=MONO)
        for text, col in _segments(line, lang):
            _run(p, text, size, col, font=MONO)
    return sh, y + h


# --------------------------------------------------------------------------- schémas
def spread(n, w, total=CW, x0=MX):
    """Positions x de n boîtes de largeur w, réparties régulièrement."""
    gap = (total - n * w) / (n - 1) if n > 1 else 0
    return [x0 + i * (w + gap) for i in range(n)]


_DARK_TEXT = ("orange", "lime")     # sur ces fonds clairs, le texte est sombre (comme dans le PPT d'origine)


def add_box(slide, x, y, w, h, text, color="green", fill=None, size=15, text_color=None,
            dashed=False, shape=MSO_SHAPE.ROUNDED_RECTANGLE):
    """Boîte pleine, comme le PPT d'origine : fond = couleur, 1re ligne en gras, lignes suivantes plus petites."""
    fill = fill or color
    text_color = text_color or ("text" if fill in _DARK_TEXT else "white")
    sh = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        sh.adjustments[0] = 0.12
    sh.shadow.inherit = False
    sh.fill.solid(); sh.fill.fore_color.rgb = rgb(fill)
    sh.line.color.rgb = rgb("orange" if dashed else color)
    sh.line.width = Pt(2.25 if dashed else 0.75)
    if dashed:
        sh.line.dash_style = MSO_LINE.DASH
    tf = sh.text_frame
    tf.word_wrap, tf.vertical_anchor = True, MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_right = Inches(0.1)
    for i, line in enumerate(text.split("\n")):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.CENTER
        rich(p, line, size if i == 0 else size - 2, text_color, i == 0)
    return sh


def add_arrow(slide, x1, y1, x2, y2, color="forest", width=2.5, dashed=False):
    """Flèche : connecteur droit dont l'extrémité reçoit une pointe (balise a:tailEnd)."""
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(width)
    if dashed:
        c.line.dash_style = MSO_LINE.DASH
    ln = c.line._get_or_add_ln()
    ln.append(ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"}))
    return c


def add_line(slide, x1, y1, x2, y2, color="forest", width=1.5, dashed=False):
    """Trait sans pointe (lignes de vie, axes)."""
    c = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    c.line.color.rgb = rgb(color)
    c.line.width = Pt(width)
    if dashed:
        c.line.dash_style = MSO_LINE.DASH
    return c


def add_schema(slide, boxes, arrows=(), labels=()):
    """Dessine un schéma natif : boîtes (dict pour add_box), flèches (`p` = x1, y1, x2, y2) et étiquettes."""
    for b in boxes:
        add_box(slide, **b)
    for a in arrows:
        add_arrow(slide, *a["p"], **{k: v for k, v in a.items() if k != "p"})
    for lb in labels:
        add_text(slide, lb["t"], lb["x"], lb["y"], lb.get("w", 3), lb.get("h", 0.4), lb.get("size", 14),
                 lb.get("color", "muted"), lb.get("bold", False), lb.get("align", PP_ALIGN.LEFT))


def add_entity(slide, x, y, w, h, name, columns, color="green", highlight=("version",)):
    """Entité d'un schéma entité-relation : bandeau coloré (nom de la table) + corps listant les colonnes.
    Les colonnes dont le texte contient un mot de `highlight` sont écrites en rouge et en gras."""
    head_h = 0.4
    add_box(slide, x, y, w, head_h, name, color, size=14)
    body = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(x), Inches(y + head_h), Inches(w), Inches(h - head_h))
    body.shadow.inherit = False
    body.fill.solid(); body.fill.fore_color.rgb = rgb("light")
    body.line.color.rgb = rgb(color); body.line.width = Pt(1.25)
    tf = body.text_frame
    tf.word_wrap, tf.vertical_anchor = True, MSO_ANCHOR.TOP
    tf.margin_left = Inches(0.12); tf.margin_top = Inches(0.06)
    for i, col in enumerate(columns):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        hot = any(k in col for k in highlight)
        _run(p, col, 11, "red" if hot else "text", hot, font=MONO)


def add_sequence(slide, lifelines, messages, top=1.55, bottom=6.2, box_w=2.6):
    """Diagramme de séquence : un bandeau par participant, une ligne de vie en pointillés, des messages fléchés.
    lifelines : [dict(x=centre, text=nom, color=couleur)] ; messages : [dict(a=i, b=j, y=hauteur, text=libellé,
    color=couleur, dashed=bool)] où a et b sont des indices de participants."""
    for ll in lifelines:
        add_box(slide, ll["x"] - box_w / 2, top, box_w, 0.7, ll["text"], ll.get("color", "green"), size=15)
        add_line(slide, ll["x"], top + 0.7, ll["x"], bottom, "forest", 1.5, dashed=True)
    for m in messages:
        x1, x2 = lifelines[m["a"]]["x"], lifelines[m["b"]]["x"]
        add_arrow(slide, x1, m["y"], x2, m["y"], m.get("color", "forest"), 2.5, m.get("dashed", False))
        add_text(slide, m["text"], min(x1, x2) + 0.1, m["y"] - 0.4, abs(x2 - x1) - 0.2, 0.38, m.get("size", 13),
                 m.get("color", "text") if m.get("color") in ("red", "green") else "text", False, PP_ALIGN.CENTER)


# --------------------------------------------------------------------------- squelette d'une diapositive
def add_footer(slide, module: str, num: int, dark=False):
    col = "white" if dark else "muted"
    add_text(slide, STACK, MX, 7.05, 8.5, 0.3, 10, col)
    add_text(slide, f"Module {module} · {num}", SW - MX - 3.0, 7.05, 3.0, 0.3, 10, col, False, PP_ALIGN.RIGHT)


class Deck:
    """Porte la présentation, le module courant et la numérotation globale du plan (PPT_PLAN.md)."""

    def __init__(self):
        self.prs = Presentation()
        self.prs.slide_width, self.prs.slide_height = Inches(SW), Inches(SH)
        self.module, self.n, self.cur = "", 1, 0

    def start(self, module: str, first_number: int):
        self.module, self.n = module, first_number

    def slide(self, title, notes="", dark=False):
        s = self.prs.slides.add_slide(self.prs.slide_layouts[5])        # « Titre seul »
        s.background.fill.solid()
        s.background.fill.fore_color.rgb = rgb("forest" if dark else "bg")
        add_title(s, title, dark)
        add_footer(s, self.module, self.n, dark)
        if notes:
            s.notes_slide.notes_text_frame.text = notes
        self.cur = self.n                                                # n° du plan, lu par add_official et les notes
        self.n += 1
        return s

    def section(self, title, subtitle, badge, minutes, subvideos, notes=""):
        """Séparateur de module : fond vert foncé, badge de parcours, liste des sous-vidéos."""
        s = self.slide(title, notes, dark=True)
        add_text(s, subtitle, MX, 1.5, CW, 0.6, 22, "white")
        opt = badge.startswith("Optionnel")
        add_box(s, MX, 2.35, 3.4 if opt else 2.4, 0.55, badge.upper(), "orange" if opt else "green", size=14)
        add_text(s, f"Durée visée : {minutes} min", MX + (3.6 if opt else 2.6), 2.4, 3.5, 0.5, 16, "white")
        add_bullets(s, subvideos, MX, 3.3, CW, 3.4, 18, color="white")
        return s


# =========================================================================== MODULE 1
def build_module_1(d: Deck):
    d.start("1", 4)                                         # le plan numérote le Module 1 de 4 à 34
    first = d.n

    # ---- séparateur ------------------------------------------------------------------------
    d.section("Module 1 · Fondations et environnement de production",
              "Un batch exploitable : traces, verrous, reprise, sur PostgreSQL",
              "Essentiel", 46,
              ["1.1 Pourquoi un batch de production ?", "1.2 Le vocabulaire en un schéma",
               "1.3 Le projet : Boot 4, Batch 6, PostgreSQL", "1.4 Votre premier job et son lancement",
               "1.5 Sous le capot : tables, versions, isolation", "1.6 Top 10 des pièges"],
              "Premier module : on pose le vocabulaire et l'environnement de production. Pile : Java 25, "
              "Spring Boot 4.1.2, Spring Batch 6.0.6, PostgreSQL 16.")

    # ---- 1.1 Pourquoi un batch de production ? ----------------------------------------------
    s = d.slide("Le batch : lire, traiter, écrire",
                "Source : M1 §1.1, PPT n°4. Un batch répète un traitement sur de grands ensembles de données, "
                "sans intervention humaine.")
    xs = spread(5, 2.1)
    labels = [("Sources", "fichier CSV · base\nfile d'attente", "blue"), ("READER", "lit un élément", "green"),
              ("PROCESSOR", "transforme", "orange"), ("WRITER", "écrit", "purple"),
              ("Destinations", "base · fichiers", "blue")]
    boxes = [dict(x=xs[i], y=2.4, w=2.1, h=1.5, text=f"{t}\n{sub}", color=c) for i, (t, sub, c) in enumerate(labels)]
    arrows = [dict(p=(xs[i] + 2.1, 3.15, xs[i + 1], 3.15)) for i in range(4)]
    add_schema(s, boxes, arrows)
    add_text(s, "**Batch processing** = répétition de traitements sur de grands ensembles de données, "
                "sans intervention humaine.", MX, 4.5, CW, 0.6, 20)
    add_text(s, "Données accumulées pendant une période : une semaine, un mois, une année.",
             MX, 5.2, CW, 0.5, 18, "muted")

    s = d.slide("Les besoins techniques d'un traitement de masse",
                "Source : M1 §1.1, PPT n°5. Six besoins ; le dernier rappelle qu'un batch n'est pas un planificateur.")
    add_table(s, ["Besoin", "Ce que cela veut dire"], [
        ["**Sans intervention humaine**", "pas d'IHM : tout est automatique, l'humain déclenche au plus"],
        ["**Efficacité**", "traitements lourds et longs (minutes, heures) : à optimiser"],
        ["**Supervision**", "savoir ce qui est fait, ce qui reste, et si tout s'est bien passé"],
        ["**Fiabilité**", "reprendre un lot en échec : une transaction par lot"],
        ["**Pas un scheduler**", "un planificateur (Quartz, cron, Kubernetes) peut le lancer"],
        ["**Parallélisme**", "beaucoup de jobs en parallèle pour de gros volumes"]],
        col_w=[3.6, CW - 3.6], size=17)

    s = d.slide("Cas d'usage métier", "Source : M1 §1.1, PPT n°6. Banques, assurances, télécoms, commerce.")
    add_table(s, ["Cas", "Exemple"], [
        ["**Salaires**", "fin de mois : calculer et virer les salaires des employés"],
        ["**Factures**", "un opérateur télécom en génère des millions, en PDF"],
        ["**Bulletins de paie**", "traitement de masse à chaque fin de mois"],
        ["**E-mails**", "envois automatiques à partir de fichiers de données"],
        ["**Rapports**", "quotidiens, hebdomadaires, mensuels"],
        ["**Workflows**", "exécution automatique sans intervention humaine"]],
        col_w=[3.6, CW - 3.6], size=17)

    s = d.slide("Cas d'usage techniques", "Source : M1 §1.1, PPT n°7. Très demandé en entretien d'embauche.")
    add_table(s, ["Cas", "Exemple"], [
        ["**Tests planifiés**", "exécuter les tests unitaires à intervalle régulier"],
        ["**Base de données**", "mises à jour automatiques à heure fixe (par exemple 2 h du matin)"],
        ["**Files d'attente**", "consommer les messages d'un broker puis les traiter"],
        ["**Intégrité**", "contrôler l'intégrité d'un serveur d'applications"],
        ["**Données factices**", "remplir une base pour un test de charge"]],
        col_w=[3.6, CW - 3.6], size=17)
    add_caption(s, "Même les équipes qui n'utilisent pas Spring finissent par l'utiliser pour le batch.", y=5.9)

    s = d.slide("Principes d'un bon batch",
                "Source : M1 §1.1, PPT n°8 (documentation officielle Spring Batch). Chaque principe évite un "
                "défaut précis ; ils alimentent les Top 10.")
    add_table(s, ["Principe", "Pourquoi", "Ce que ça évite"], [
        ["**Minimiser les E/S**", "premier coût d'un batch", "relire à chaque transaction, scans inutiles"],
        ["**Ne pas faire deux fois**", "un total recalculé relit tout", "un second passage complet"],
        ["**Supposer le pire**", "données non contrôlées = suspectes", "un fichier tronqué accepté comme complet"],
        ["**Tester la charge tôt**", "un batch grossit avec le temps", "découvrir la limite en production"],
        ["**Sauvegarder aussi les fichiers**", "les fichiers plats sont oubliés", "un batch qui dépend de fichiers perdus"],
        ["**Rester simple**", "complexité = risque", "des batchs monolithiques ingérables"]],
        col_w=[3.8, 3.9, CW - 7.7], size=15)

    s = d.slide("Stratégies de traitement : du plus simple au plus complexe",
                "Source : M1 §1.1, PPT n°9. Cinq stratégies, de la plus simple à la plus complexe ; même dans "
                "le cas simple, prévoir des points de validation et la reprise.")
    steps = [("1 · Traitement normal", "dans une fenêtre batch", "green"),
             ("2 · Batch concurrent", "avec l'en ligne", "blue"),
             ("3 · Jobs en parallèle", "plusieurs jobs à la fois", "orange"),
             ("4 · Partitionnement", "même job, plusieurs instances", "purple"),
             ("5 · Combinaison", "des précédentes", "red")]
    xs = spread(5, 2.2)
    boxes = [dict(x=xs[i], y=5.0 - i * 0.7, w=2.2, h=1.15, text=f"{t}\n{sub}", color=c, size=14)
             for i, (t, sub, c) in enumerate(steps)]
    arrows = [dict(p=(xs[i] + 2.2, 5.0 - i * 0.7 + 0.57, xs[i + 1], 5.0 - (i + 1) * 0.7 + 0.57)) for i in range(4)]
    add_schema(s, boxes, arrows)
    add_text(s, "Même dans le cas simple : prévoir des **points de validation** et la **reprise**.",
             MX, 1.6, 6.5, 0.8, 18)

    s = d.slide("Trois questions de production : trace, verrou, reprise",
                "Source : M1 §1.1. Trois questions décident de la tenue en production ; les trois réponses "
                "reposent sur une base durable et partagée.")
    add_table(s, ["Question", "Ce qui répond"], [
        ["Que s'est-il passé cette nuit, et où le job s'est-il arrêté ?", "les **métadonnées** stockées par le `JobRepository`"],
        ["Deux serveurs peuvent-ils lancer le même job en même temps ?", "le **verrouillage** fondé sur ces mêmes métadonnées"],
        ["Peut-on reprendre sans tout rejouer ni doubler les données ?", "l'**état** de chaque step (`ExecutionContext`)"]],
        col_w=[7.0, CW - 7.0], size=17)
    add_text(s, "Les trois réponses reposent sur une base **durable et partagée** : PostgreSQL. "
                "Une base en mémoire (H2) convient aux tests, jamais à la production.", MX, 4.9, CW, 1.2, 20)

    s = d.slide("La nuit interrompue : crash à 3 h 12, reprise au matin",
                "Source : M1 §4.1, schéma S04 (réalisé nativement). Sans JobRepository persistant, on rejoue 10 Go "
                "depuis le début en espérant ne rien écrire deux fois.")
    xs = spread(4, 2.6)
    ev = [("2 h 00", "le job de rapprochement démarre", "green"),
          ("3 h 12", "mise à jour du système : le serveur redémarre", "red"),
          ("Au matin", "exécution restée STARTED, processus disparu", "orange"),
          ("Relance", "reprise à la dernière position confirmée", "green")]
    boxes = [dict(x=xs[i], y=2.6, w=2.6, h=1.7, text=f"{t}\n{sub}", color=c) for i, (t, sub, c) in enumerate(ev)]
    arrows = [dict(p=(xs[i] + 2.6, 3.45, xs[i + 1], 3.45)) for i in range(3)]
    add_schema(s, boxes, arrows)
    add_text(s, "On déclare l'exécution orpheline (`abandon` / `recover`), puis on relance : le step reprend "
                "à la **position sauvegardée** au lieu de repartir de zéro.", MX, 4.9, CW, 1.0, 20)

    # ---- 1.2 Le vocabulaire en un schéma ---------------------------------------------------
    s = d.slide("Job, JobInstance, JobExecution",
                "Source : M1 §1.2, PPT n°14. Le Job est la recette ; la JobInstance applique la recette à des "
                "paramètres identifiants ; la JobExecution est une tentative.")
    bx = [dict(x=0.6, y=3.0, w=3.0, h=1.4, text="Job\nEndOfDay : le type de tâche", color="blue"),
          dict(x=5.2, y=3.0, w=3.0, h=1.4, text="JobInstance\nEndOfDay du 2007/05/05", color="green"),
          dict(x=9.7, y=3.0, w=3.0, h=1.4, text="JobExecution\n1re tentative du 2007/05/05", color="orange"),
          dict(x=5.2, y=1.55, w=3.0, h=0.95, text="JobParameters\nschedule.date = 2007/05/05", color="purple", size=14)]
    ar = [dict(p=(3.6, 3.7, 5.2, 3.7)), dict(p=(8.2, 3.7, 9.7, 3.7)), dict(p=(6.7, 2.5, 6.7, 3.0))]
    lb = [dict(t="1 … *", x=3.8, y=3.25, w=1.2, align=PP_ALIGN.CENTER),
          dict(t="1 … *", x=8.3, y=3.25, w=1.2, align=PP_ALIGN.CENTER)]
    add_schema(s, bx, ar, lb)
    add_bullets(s, ["**Job** : définit ce qu'est la tâche et comment l'exécuter.",
                    "**JobInstance** : un job + ses paramètres identifiants, une exécution logique.",
                    "**JobExecution** : une tentative réelle, réussie ou échouée."],
                MX, 4.8, CW, 1.7, 17)
    add_official(s, "Job Hierarchy With Steps", d.cur)

    s = d.slide("JobInstance = Job + paramètres identifiants",
                "Source : M1 §1.2, PPT n°15. Mêmes paramètres identifiants, même instance : la relance après "
                "un échec est une reprise. Instance réussie : elle est fermée.")
    add_table(s, ["JOB_EXEC_ID", "JOB_INST_ID", "paramètre schedule.date", "STATUS"], [
        ["1", "1", "2017-01-01", "FAILED"],
        ["2", "1", "2017-01-01 (relance)", "COMPLETED : l'instance 1 est fermée"],
        ["3", "2", "2017-01-02", "COMPLETED : une AUTRE instance"]],
        col_w=[2.2, 2.2, 3.3, CW - 7.7], size=16)
    add_cards(s, [("Mêmes paramètres", "Même instance, nouvelle exécution : c'est la **reprise**."),
                  ("Instance réussie", "Fermée : un nouveau lancement identique est **refusé**."),
                  ("Instance en cours", "`JobExecutionAlreadyRunningException` si on la relance.")],
              y=4.2, h=2.2, cols=3, size=15)
    add_official(s, "Job Parameters", d.cur)

    s = d.slide("Step et StepExecution",
                "Source : M1 §1.2, PPT n°16. Chaque tentative de step laisse une StepExecution avec ses compteurs.")
    add_table(s, ["Propriété", "Rôle"], [
        ["`status` / `exitStatus`", "état technique / code de sortie"],
        ["`readCount` / `writeCount`", "éléments lus / écrits"],
        ["`commitCount` / `rollbackCount`", "transactions validées / annulées"],
        ["`filterCount`", "éléments filtrés par le processor"],
        ["`readSkipCount` / `processSkipCount` / `writeSkipCount`", "éléments ignorés (skip)"],
        ["`executionContext`", "données persistées pour la reprise"]],
        col_w=[6.0, CW - 6.0], size=16)
    add_caption(s, "Si un step échoue parce que le précédent a échoué, aucune StepExecution n'est créée.", y=5.9)

    s = d.slide("ExecutionContext et JobRepository",
                "Source : M1 §1.2, PPT n°17 (mise à jour). Le contexte du step est sauvegardé à chaque commit ; "
                "le JobRepository est en PostgreSQL, jamais en mémoire en production.")
    add_cards(s, [("Contexte du step", "Sauvegardé à **chaque commit** : position de lecture, compteurs, vos données."),
                  ("Contexte du job", "Sauvegardé **entre deux steps**. Ce ne sont **pas** les mêmes objets."),
                  ("Entrées sérialisables", "Sans cela, la reprise du job est impossible.")],
              x=MX, y=1.6, w=6.2, h=4.8, cols=1, size=15)
    add_table(s, ["STEP_EXEC_ID", "SHORT_CONTEXT"], [["1", "`{\"bankCsvReader.read.count\": 3400}`"]],
              x=7.1, y=1.7, w=5.6, col_w=[2.0, 3.6], size=14)
    add_text(s, "`BATCH_STEP_EXECUTION_CONTEXT` : le step a lu 3 400 éléments avant l'échec ; "
                "la reprise repart de l'élément suivant.", 7.1, 3.0, 5.6, 1.2, 16)
    add_text(s, "**JobRepository** : persiste les métadonnées dans **PostgreSQL**. "
                "Colonne `version` : verrouillage optimiste (voir 1.5).", 7.1, 4.4, 5.6, 1.4, 16)

    s = d.slide("Architecture en trois couches",
                "Source : M1 §1.3, PPT n°12. Application, cœur, infrastructure : le code d'infrastructure sert "
                "à l'application ET au cœur.")
    ly = [("Application", "vos jobs, steps, readers, processors", "green"),
          ("Batch Core", "Job, Step, JobOperator, JobRepository", "blue"),
          ("Batch Infrastructure", "ItemReader, ItemWriter, retry…", "purple")]
    boxes = [dict(x=0.8, y=1.8 + i * 1.5, w=6.4, h=1.25, text=f"{t}\n{sub}", color=c, size=18) for i, (t, sub, c) in enumerate(ly)]
    add_schema(s, boxes)
    add_text(s, "**Le code que vous écrivez** : les traitements par lots et le code personnalisé.", 7.6, 1.95, 5.2, 0.9, 16)
    add_text(s, "**Le noyau** : classes d'exécution pour lancer et contrôler un job.", 7.6, 3.45, 5.2, 0.9, 16)
    add_text(s, "**Base commune** : readers, writers et services courants, utilisés par l'application ET par le cœur.",
             7.6, 4.95, 5.2, 1.1, 16)
    add_official(s, "Spring Batch Layered Architecture", d.cur)

    s = d.slide("Le schéma de référence : JobOperator, Job, Step, JobRepository",
                "Source : M1 §1.3, PPT n°13 (mise à jour). JobOperator est le lanceur principal ; il étend "
                "JobLauncher. JobRepository étend JobExplorer.")
    bx = [dict(x=0.6, y=1.8, w=3.2, h=1.2, text="JobOperator\n(étend JobLauncher)", color="blue"),
          dict(x=5.0, y=1.8, w=3.0, h=1.2, text="Job", color="green"),
          dict(x=9.2, y=1.8, w=3.0, h=1.2, text="Step", color="orange"),
          dict(x=7.0, y=4.1, w=2.6, h=1.1, text="ItemReader", color="purple"),
          dict(x=10.0, y=4.1, w=2.6, h=1.1, text="ItemWriter", color="purple"),
          dict(x=0.6, y=4.1, w=5.4, h=1.1, text="JobRepository\ninstances, exécutions, compteurs (BATCH_*)", color="red", size=14)]
    ar = [dict(p=(3.8, 2.4, 5.0, 2.4)), dict(p=(8.0, 2.4, 9.2, 2.4)),
          dict(p=(10.2, 3.0, 8.3, 4.1)), dict(p=(11.2, 3.0, 11.3, 4.1)),
          dict(p=(5.8, 3.0, 4.2, 4.1), dashed=True, color="red")]
    lb = [dict(t="1", x=8.1, y=1.95, w=0.5), dict(t="*", x=8.75, y=1.95, w=0.5)]
    add_schema(s, bx, ar, lb)
    add_text(s, "Un step a exactement **un reader**, **un writer**, et un **processor facultatif**.",
             MX, 5.7, CW, 0.6, 18)

    s = d.slide("Historique des versions : de 1.x à 6.x",
                "Source : M1 §1.2, PPT n°18 (mise à jour). Spring Batch N accompagne Spring Framework N−1. "
                "Depuis la 5, le JobRepository exige une base de données.")
    add_table(s, ["Version", "Période", "Apport"], [
        ["**1.x**", "2008", "configuration XML"],
        ["**2.x**", "2009-2010", "NoSQL, configuration Java"],
        ["**3.x**", "Spring 4", "Java 8, JSR-352"],
        ["**4.x**", "Spring 5", "alignement sur Spring 5"],
        ["**5.x**", "Spring 6", "Java 17 minimum, Jakarta EE"],
        ["**6.x**", "Spring 7, Boot 4", "`JobOperator`, `ChunkOrientedStep`, retry de Spring Framework 7"]],
        col_w=[1.8, 2.8, CW - 4.6], size=17)
    add_caption(s, "Spring Batch N pour Spring Framework N−1. Depuis la v5 : le JobRepository exige une base "
                   "de données (PostgreSQL en production).", y=5.9)

    s = d.slide("Ce qui change dans Spring Batch 6",
                "Source : M1 §1.4. Tout import copié d'un tutoriel Spring Batch 4 ou 5 est faux : les paquets ont bougé.")
    add_table(s, ["Nouveauté (6.0.6)", "Conséquence"], [
        ["Boot 4.1.2 embarque Spring Batch 6.0.6", "`spring-boot-starter-batch-jdbc`"],
        ["Paquets déplacés", "`core.job.Job`, `core.job.parameters.JobParameters`, `core.step.Step`, `infrastructure.item.*`"],
        ["`JobOperator` étend `JobLauncher`", "`start`, `restart`, `stop`, `abandon`, `recover`"],
        ["`JobRepository` étend `JobExplorer`", "une seule interface pour lire et écrire les métadonnées"],
        ["`@EnableJdbcJobRepository`", "déclare le dépôt JDBC : `dataSourceRef`, `tablePrefix`, `isolationLevelForCreate`…"]],
        col_w=[4.6, CW - 4.6], size=15)

    # ---- 1.3 Le projet ---------------------------------------------------------------------
    s = d.slide("Dépendances Maven : Boot 4.1.2, Spring Batch 6.0.6, PostgreSQL",
                "Source : M1 §2.1 (remplace PPT n°20). Le parent Boot fixe les versions : aucune version de "
                "Spring Batch à écrire à la main.")
    pom = """<parent>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>4.1.2</version>
</parent>
<properties><java.version>25</java.version></properties>
<dependencies>
  <dependency>
    <artifactId>spring-boot-starter-batch-jdbc</artifactId>
  </dependency>
  <dependency>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
  </dependency>
  <dependency>
    <artifactId>spring-boot-starter-batch-jdbc-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>"""
    add_code(s, pom, lang="xml", filename="pom.xml (extrait ; groupId omis)")
    add_callouts(s, ["Le **parent Boot** fixe toutes les versions compatibles.",
                     "Compile en **Java 25**.",
                     "Le starter apporte Spring Batch **et** le support JDBC des métadonnées.",
                     "Pilote PostgreSQL, uniquement à l'exécution.",
                     "Outils de test, **jamais** dans l'application livrée."], 8.8, 1.85, 4.0, 14)

    s = d.slide("application.properties : base, lancement automatique, schéma",
                "Source : M1 §2.2 (remplace PPT n°21). L'URL vient de l'environnement ; jamais de mot de passe "
                "par défaut ; le schéma est créé par Flyway, pas par l'application.")
    props = """spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/batchdb}
spring.datasource.username=${DB_USER:batch}
spring.datasource.password=${DB_PASSWORD}
spring.batch.job.enabled=false
spring.batch.jdbc.initialize-schema=never"""
    add_code(s, props, lang="properties", size=13, w=8.4, filename="application.properties")
    add_callouts(s, ["`${VARIABLE:défaut}` : l'URL vient de l'**environnement**, pas du dépôt.",
                     "Un compte **dédié** au batch, sans droits d'administration.",
                     "**Aucun défaut** pour le mot de passe.",
                     "Pas de lancement de tous les jobs au démarrage.",
                     "`never` en production : le schéma vient de **Flyway** ; `always` en développement seulement."],
                 9.3, 1.85, 3.6, 13)

    s = d.slide("@EnableJdbcJobRepository ligne par ligne",
                "Source : M1 §2.3 (remplace PPT n°21). Isolation de création : on ne la change pas ; SERIALIZABLE "
                "par défaut protège contre deux lancements simultanés.")
    cfg = """@Configuration
@EnableJdbcJobRepository(
    dataSourceRef = "dataSource",
    transactionManagerRef = "transactionManager",
    tablePrefix = "BATCH_")
public class BatchInfraConfig { }"""
    add_code(s, cfg, filename="BatchInfraConfig.java")
    add_callouts(s, ["Classe de configuration Spring.",
                     "Déclare un `JobRepository` **JDBC**.",
                     "Le `DataSource` PostgreSQL de Boot.",
                     "Le gestionnaire de transactions des métadonnées.",
                     "Préfixe des tables : plusieurs applications dans un même schéma."], 8.8, 1.85, 4.0, 14)
    add_cards(s, [("Ne changez pas l'isolation de création",
                   "`isolationLevelForCreate` vaut **SERIALIZABLE par défaut**. L'abaisser supprime la protection "
                   "contre deux lancements simultanés.")], x=MX, y=4.9, w=CW, h=1.5, cols=1, size=15, colors=("orange",))

    # ---- 1.4 Premier job -------------------------------------------------------------------
    s = d.slide("Un premier job : tasklet, step, job",
                "Source : M1 §2.4. Tasklet = une action ; elle s'exécute dans une transaction. Le nom du job "
                "est celui stocké dans batch_job_instance.")
    job = """@Configuration
public class FirstJobConfig {

  @Bean
  Tasklet firstTasklet() {
    return (contribution, chunkContext) -> {
      log.info("Bonjour depuis {}",
          contribution.getStepExecution().getStepName());
      return RepeatStatus.FINISHED;
    };
  }

  @Bean
  Step firstStep(JobRepository repo, PlatformTransactionManager tx,
                 Tasklet firstTasklet) {
    return new StepBuilder("firstStep", repo)
        .tasklet(firstTasklet, tx).build();
  }

  @Bean
  Job firstJob(JobRepository repo, Step firstStep) {
    return new JobBuilder("firstJob", repo).start(firstStep).build();
  }
}"""
    add_code(s, job, w=8.6, size=11, filename="FirstJobConfig.java")
    add_callouts(s, ["`Tasklet` : interface fonctionnelle, **une** méthode `execute`.",
                     "`FINISHED` : le step est terminé (`CONTINUABLE` rappellerait la tasklet).",
                     "`StepBuilder(nom, repo)` : le nom est la **clé** des exécutions du step.",
                     "`JobBuilder(nom, repo)` : le nom identifie la recette dans `batch_job_instance`."],
                 9.5, 1.85, 3.4, 13)

    s = d.slide("Lancer le job par une API : record et switch",
                "Source : M1 §2.5. POST et non GET : lancer un job modifie l'état. start() est synchrone ici ; "
                "le lancement asynchrone est au Module 2 (§2.4).")
    api = """public record RunRequest(String runDate) { }

public record RunResult(long executionId, String status) {
  static RunResult of(JobExecution ex) {
    return new RunResult(ex.getId(), switch (ex.getStatus()) {
      case COMPLETED -> "TERMINÉ";
      case FAILED, STOPPED -> "À REPRENDRE";
      default -> ex.getStatus().name();
    });
  }
}

@PostMapping("/jobs/first")
RunResult run(@RequestBody RunRequest req) throws Exception {
  var params = new JobParametersBuilder()
      .addString("runDate", req.runDate())
      .toJobParameters();
  return RunResult.of(jobOperator.start(firstJob, params));
}"""
    add_code(s, api, w=8.4, size=12, filename="FirstJobController.java (extrait)")
    add_callouts(s, ["`record` : données **immuables**, sans code répétitif.",
                     "`switch` en **expression** sur `BatchStatus`.",
                     "**POST**, jamais GET : un robot ne doit pas relancer le job.",
                     "`runDate` est **identifiant** : il définit la `JobInstance`.",
                     "`JobOperator.start` lance et **attend** la fin."], 9.3, 1.85, 3.6, 13)

    # ---- 1.5 Sous le capot -----------------------------------------------------------------
    s = d.slide("Ce que le JobRepository écrit : 6 tables, 3 séquences",
                "Source : M1 §3.1, schéma S01. Chaque transition est écrite en base immédiatement : si le serveur "
                "est coupé, la base connaît le dernier point confirmé. Les colonnes version (en rouge) portent le "
                "verrouillage optimiste.")
    xs, y1, y2, ew, eh = [0.6, 4.87, 9.13], 1.55, 3.95, 3.6, 1.95
    # ligne du haut : côté job ; ligne du bas : contextes et côté step
    add_entity(s, xs[0], y1, ew, eh, "batch_job_instance",
               ["job_instance_id         PK", "job_name", "job_key (hachage des paramètres)"], "blue")
    add_entity(s, xs[1], y1, ew, eh, "batch_job_execution",
               ["job_execution_id        PK", "job_instance_id         FK", "status · exit_code",
                "start_time · end_time", "version"], "green")
    add_entity(s, xs[2], y1, ew, eh, "batch_job_execution_params",
               ["job_execution_id        FK", "parameter_name · type", "parameter_value", "identifying"], "green")
    add_entity(s, xs[0], y2, ew, eh, "batch_step_execution_context",
               ["step_execution_id       FK", "short_context (position lue)"], "purple")
    add_entity(s, xs[1], y2, ew, eh, "batch_step_execution",
               ["step_execution_id       PK", "job_execution_id        FK", "step_name · status",
                "read · write · filter · rollback", "version"], "purple")
    add_entity(s, xs[2], y2, ew, eh, "batch_job_execution_context",
               ["job_execution_id        FK", "short_context (état du job)"], "green")
    mid1, mid2 = y1 + 0.95, y2 + 0.95
    add_arrow(s, xs[0] + ew, mid1, xs[1], mid1)                       # instance 1 → * exécution
    add_arrow(s, xs[1] + ew, mid1, xs[2], mid1)                       # exécution 1 → * paramètres
    add_arrow(s, xs[1] + ew / 2, y1 + eh, xs[1] + ew / 2, y2)         # exécution 1 → * step
    add_arrow(s, xs[1] + ew, y1 + eh - 0.2, xs[2], y2 + 0.4)          # exécution 1 → 1 contexte du job
    add_arrow(s, xs[1], mid2, xs[0] + ew, mid2)                       # step 1 → 1 contexte du step
    for t, x, y in [("1", xs[0] + ew + 0.04, mid1 - 0.32), ("*", xs[1] - 0.3, mid1 - 0.32),
                    ("1", xs[1] + ew + 0.04, mid1 - 0.32), ("*", xs[2] - 0.3, mid1 - 0.32),
                    ("1", xs[1] + ew / 2 + 0.08, y1 + eh - 0.02), ("*", xs[1] + ew / 2 + 0.08, y2 - 0.3),
                    ("1", xs[1] + ew + 0.04, y1 + eh - 0.5), ("1", xs[2] - 0.3, y2 - 0.02),
                    ("1", xs[1] - 0.3, mid2 - 0.32), ("1", xs[0] + ew + 0.04, mid2 - 0.32)]:
        add_text(s, t, x, y, 0.3, 0.3, 13, "text", True, PP_ALIGN.CENTER)
    add_text(s, "3 séquences : `batch_job_instance_seq`, `batch_job_execution_seq`, `batch_step_execution_seq`."
                " Colonnes `version` en rouge : verrouillage optimiste.", MX, 6.1, CW, 0.7, 14, "muted")

    s = d.slide("Comment un lancement est vérifié",
                "Source : M1 §3.2. Ces lectures puis la création ne sont pas atomiques par nature : l'isolation "
                "SERIALIZABLE fait échouer l'une de deux transactions concurrentes.")
    xs = spread(4, 2.8)
    st = [("1 · Chercher la JobInstance", "nom du job + paramètres identifiants", "blue"),
          ("2 · Exécution en cours ?", "JobExecutionAlreadyRunningException", "red"),
          ("3 · Instance déjà COMPLETED ?", "JobInstanceAlreadyCompleteException", "red"),
          ("4 · Sinon : nouvelle JobExecution", "créée sous isolation SERIALIZABLE", "green")]
    boxes = [dict(x=xs[i], y=2.4, w=2.8, h=2.0, text=f"{t}\n{sub}", color=c, size=15) for i, (t, sub, c) in enumerate(st)]
    arrows = [dict(p=(xs[i] + 2.8, 3.4, xs[i + 1], 3.4)) for i in range(3)]
    add_schema(s, boxes, arrows)
    add_text(s, "Le perdant d'une course reçoit une exception : le lancement doit être **retenté** ou **abandonné**.",
             MX, 5.0, CW, 0.8, 20)

    s = d.slide("Le verrouillage optimiste, pas à pas",
                "Source : M1 §3.3, schéma S03. Deux serveurs lisent la version 3 ; le premier écrit la version 4 ; "
                "le second écrit avec la version 3 : 0 ligne modifiée, exception.")
    life = [dict(x=2.2, text="Serveur A", color="blue"), dict(x=6.67, text="PostgreSQL", color="green"),
            dict(x=11.13, text="Serveur B", color="purple")]
    msgs = [dict(a=0, b=1, y=2.95, text="lit l'exécution 42 : version = 3"),
            dict(a=2, b=1, y=3.5, text="lit l'exécution 42 : version = 3"),
            dict(a=0, b=1, y=4.1, text="UPDATE … WHERE id = 42 AND version = 3"),
            dict(a=1, b=0, y=4.65, text="1 ligne modifiée : version = 4", color="green", dashed=True),
            dict(a=2, b=1, y=5.25, text="UPDATE … WHERE id = 42 AND version = 3"),
            dict(a=1, b=2, y=5.8, text="0 ligne : OptimisticLockingFailureException", color="red", dashed=True)]
    add_sequence(s, life, msgs, top=1.55, bottom=6.1)
    add_text(s, "Le second serveur écrit avec une **version périmée** : aucune ligne ne correspond, l'écriture est refusée.",
             MX, 6.3, CW, 0.5, 16, "text", False, PP_ALIGN.CENTER)

    s = d.slide("Ce qu'il faut savoir sur le verrouillage optimiste",
                "Source : M1 §3.4. Ne pas s'attendre à une exception à chaque fois : la synchronisation du "
                "statut atténue le contrôle sur la JobExecution.")
    add_cards(s, [("Le mécanisme", "Colonne `version` sur chaque ligne.\n`UPDATE … WHERE id = ? AND version = ?`\n"
                                   "Aucune ligne touchée : `OptimisticLockingFailureException`."),
                  ("Le piège", "En théorie, une copie périmée lève l'exception.\nEn pratique, `JdbcJobExecutionDao` "
                               "**resynchronise la version** avant l'écriture pour ne pas écraser un ordre d'arrêt.\n"
                               "Le verrouillage existe, mais il est **atténué**."),
                  ("À retenir", "Ne vous attendez pas à une exception à chaque fois.\nDeux lancements simultanés : "
                                "exécutions en cours + SERIALIZABLE.\nArrêt depuis l'extérieur : `JobOperator.stop(...)`.")],
              y=1.6, h=4.8, cols=3, size=14)

    s = d.slide("Pourquoi le JobRepository est un singleton sans danger",
                "Source : M1 §3.5. Annonce du Module 4 : un singleton sans état est sûr ; un singleton qui garde "
                "un total en mémoire ne l'est pas.")
    add_cards(s, [("Singleton sans état : sûr", "Le `JobRepository` ne conserve **rien** entre deux appels : "
                                               "tout l'état vit **en base**."),
                  ("Singleton avec état : piège", "Un total ou un compteur en mémoire se partage entre **tous** les "
                                                 "lancements : c'est le **double comptage** du Module 4.")],
              y=1.8, h=3.4, cols=2, size=18, colors=("green", "red"))
    add_text(s, "Une seule instance pour toute l'application : sans danger quand elle ne retient rien.",
             MX, 5.6, CW, 0.7, 19, "muted")

    s = d.slide("Deux serveurs, un seul traitement ; l'audit",
                "Source : M1 §4.2-4.3. Le JobRepository arbitre ; l'audit est une requête SQL sur "
                "batch_step_execution, sans rien ajouter à l'application.")
    add_table(s, ["Cas", "Ce qui répond"], [
        ["Deux serveurs lancent le **même job** à 2 h 00", "une exécution démarre ; l'autre échoue proprement (`JobExecutionAlreadyRunningException`)"],
        ["« Quel a été le résultat du job d'hier ? »", "une requête SQL, sans rien ajouter à l'application"]],
        col_w=[5.2, CW - 5.2], size=16, y=1.6)
    sql = """SELECT step_name, status, read_count, write_count,
       filter_count, skip_count
  FROM batch_step_execution
 WHERE job_execution_id = ?;"""
    add_code(s, sql, lang="sql", w=CW, size=16, y=4.3, filename="Audit : compteurs d'un step")

    # ---- 1.6 Top 10 ------------------------------------------------------------------------
    top = [
        ("1", "`initialize-schema=always` en production", "l'application crée des tables au démarrage ; droits excessifs", "`never` + Flyway / Liquibase"),
        ("2", "`JobRepository` en mémoire (H2) en production", "aucune reprise après redémarrage, aucune trace", "PostgreSQL persistant"),
        ("3", "`isolationLevelForCreate` abaissé", "deux lancements concurrents possibles", "garder SERIALIZABLE, **gérer** l'erreur"),
        ("4", "Relancer avec les mêmes paramètres", "`JobInstanceAlreadyCompleteException`", "un paramètre identifiant qui change, ou `startNextInstance`"),
        ("5", "Horodatage en paramètre identifiant", "chaque relance est une nouvelle instance : plus de reprise", "paramètre métier stable (`runDate`)"),
        ("6", "`spring.batch.job.enabled` laissé à `true`", "tous les jobs partent au démarrage", "`false` + lancement explicite"),
        ("7", "Exécution restée `STARTED` après un crash", "le job refuse de repartir", "`abandon` / `recover` après vérification"),
        ("8", "Tables `BATCH_*` jamais purgées", "tables énormes, requêtes lentes", "purge planifiée"),
        ("9", "Imports de Spring Batch 4/5", "erreurs de compilation", "utiliser les paquets 6.x"),
        ("10", "Job long dans la requête HTTP", "requête bloquée, délai dépassé", "lancement asynchrone (Module 2)"),
    ]
    for half, (a, b) in enumerate([(0, 5), (5, 10)], 1):
        s = d.slide(f"Top 10 des pièges ({half}/2)",
                    "Source : M1 §5. Les pièges 6 et 10 sont repris au Module 2 ; le piège 7 est approfondi au Module 6.")
        add_table(s, ["#", "Piège", "Ce qui se passe", "Parade"], [list(r) for r in top[a:b]],
                  col_w=[0.6, 3.7, 4.2, CW - 8.5], size=14, row_h=0.8)

    s = d.slide("Exercices du Module 1", "Source : M1 §7.")
    add_bullets(s, [
        "**Même paramètre.** Vous lancez deux fois `firstJob` avec `runDate=2026-11-01`. Que se passe-t-il au "
        "second lancement si le premier est `COMPLETED` ? Et s'il est encore en cours ? Citez les deux exceptions.",
        "**Paramètre de relance.** Relancer le job du jour autant de fois que nécessaire après un échec, sans jamais "
        "rejouer un job réussi : quel paramètre est identifiant, lequel est non identifiant ? Justifiez.",
        "**Isolation.** Un collègue propose `READ_COMMITTED` pour « supprimer les erreurs de sérialisation ». "
        "Quel risque cela crée-t-il, et que lui répondez-vous ?"], y=1.7, h=4.8, size=19, numbered=True)

    total = d.n - first
    assert total == 31, f"Module 1 : {total} diapositives générées, 31 attendues par PPT_PLAN.md"


# =========================================================================== point d'entrée
BUILDERS = {"1": build_module_1}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modules", nargs="*", default=["1"], help="modules à générer, dans l'ordre (défaut : 1)")
    args = ap.parse_args()
    unknown = [m for m in args.modules if m not in BUILDERS]
    if unknown:
        raise SystemExit(f"Module(s) pas encore écrit(s) : {', '.join(unknown)} (disponibles : {', '.join(BUILDERS)})")

    deck = Deck()
    for m in args.modules:
        BUILDERS[m](deck)

    out = Path(__file__).resolve().parent / "build"
    out.mkdir(exist_ok=True)
    target = out / f"Spring_Batch_Module_{'_'.join(args.modules)}.pptx"
    deck.prs.save(target)

    print(f"{len(deck.prs.slides)} diapositives -> {target}")
    for title, num in OFFICIALS:
        print(f"  schéma officiel à insérer (diapositive n°{num}) : « {title} »")


if __name__ == "__main__":
    main()
