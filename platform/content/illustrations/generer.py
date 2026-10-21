#!/usr/bin/env python3
"""Génère les illustrations des cours.

    python content/illustrations/generer.py [nom-de-figure ...]

Chaque figure est écrite en SVG (dossier svg/), puis convertie en PNG (deux fois la taille
d'affichage, pour les écrans haute densité) dans le dossier images/ du cours concerné, avec un
navigateur Chromium sans interface (Edge ou Chrome ; variable NAVIGATEUR pour en imposer un).

Les données sont calculées ici, pas dessinées à la main : empreintes SHA-256, points de la
courbe, probabilités, fréquences des lettres des cours, et chiffrement AES réel (OpenSSL) pour
la figure ECB. Bibliothèque standard Python uniquement.
"""
import hashlib
import math
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import unicodedata
import zlib
from base64 import b64encode
from pathlib import Path
from xml.sax.saxutils import escape

ICI = Path(__file__).resolve().parent
COURS = ICI.parent / "cours"

# Palette du thème sombre du site (fond des cartes, bordures, vert primaire…)
FOND, CADRE, PANNEAU, VIDE = "#121816", "#2a3431", "#1b2320", "#232d29"
TEXTE, DISCRET = "#e8eeeb", "#9fa9a4"
VERT, AMBRE, CIEL, ROSE, VIOLET = "#34d399", "#fbbf24", "#60a5fa", "#f87171", "#a78bfa"
COULEURS = [TEXTE, DISCRET, VERT, AMBRE, CIEL, ROSE, VIOLET]
POLICE = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
MONO = "Consolas, 'Cascadia Mono', 'DejaVu Sans Mono', monospace"

FIGURES = {}


def figure(cours, largeur, hauteur, fichier=None):
    """Enregistre une figure : fonction sans argument qui renvoie le contenu SVG.

    Le fichier porte le nom de la figure (PNG : aplats nets), sauf si `fichier` est donné ; les
    couvertures sont en WebP (« couverture.webp »), bien plus légères avec leurs dégradés.
    """
    def enregistrer(fonction):
        nom = fonction.__name__.replace("_", "-")
        FIGURES[nom] = (cours, largeur, hauteur, fonction, fichier or f"{nom}.png")
        return fonction
    return enregistrer


# ------------------------------------------------------------------ primitives SVG

def t(x, y, texte, taille=15, couleur=TEXTE, ancre="middle", graisse=400, mono=False, italique=False, extra=""):
    police = f' font-family="{MONO}"' if mono else ""
    style = ' font-style="italic"' if italique else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-size="{taille}" fill="{couleur}" text-anchor="{ancre}" '
            f'font-weight="{graisse}"{police}{style}{extra}>{escape(str(texte))}</text>')


def lignes(x, y, textes, taille=14, couleur=DISCRET, interligne=1.45, **options):
    return "".join(t(x, y + i * taille * interligne, texte, taille, couleur, **options) for i, texte in enumerate(textes))


def rect(x, y, l, h, remplissage=PANNEAU, contour=CADRE, rx=10, extra=""):
    trait = f' stroke="{contour}"' if contour else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{l:.1f}" height="{h:.1f}" rx="{rx}" fill="{remplissage}"{trait}{extra}/>'


def trait(x1, y1, x2, y2, couleur=DISCRET, epaisseur=1.6, pointille=None, fleche=False, double=False):
    tirets = f' stroke-dasharray="{pointille}"' if pointille else ""
    fin = f' marker-end="url(#f{couleur[1:]})"' if fleche else ""
    debut = f' marker-start="url(#f{couleur[1:]})"' if double else ""
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{couleur}" '
            f'stroke-width="{epaisseur}"{tirets}{fin}{debut}/>')


def boite(x, y, l, h, titre, sous_titre=None, couleur=TEXTE, remplissage=PANNEAU, contour=CADRE, taille=15, mono=False):
    milieu = y + h / 2 + (taille * 0.35 if sous_titre is None else -2)
    contenu = t(x + l / 2, milieu, titre, taille, couleur, graisse=600, mono=mono)
    if sous_titre:
        contenu += t(x + l / 2, milieu + 18, sous_titre, 12, DISCRET)
    return rect(x, y, l, h, remplissage, contour) + contenu


def svg(largeur, hauteur, corps, titre):
    marqueurs = "".join(
        f'<marker id="f{c[1:]}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
        f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>' for c in COULEURS)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{largeur}" height="{hauteur}" '
            f'viewBox="0 0 {largeur} {hauteur}" font-family="{POLICE}"><defs>{marqueurs}</defs>'
            f'{rect(0.5, 0.5, largeur - 1, hauteur - 1, FOND, CADRE, 16)}'
            f'{t(28, 40, titre, 19, TEXTE, "start", 600)}{corps}</svg>')


def octets(n):
    return f"{n:,}".replace(",", "\u00a0") + "\u00a0o"


# ------------------------------------------------------------------ Fonctions de hachage

@figure("01-hachage", 960, 430)
def avalanche():
    def bits(message):
        return [(octet >> (7 - i)) & 1 for octet in hashlib.sha256(message).digest() for i in range(8)]
    a, b = bits(b"bonjour"), bits(b"Bonjour")
    difference = [x != y for x, y in zip(a, b)]
    n = sum(difference)
    case, cote = 14, 16 * 14
    marge = (960 - 3 * cote) / 4
    corps = []
    grilles = [('SHA-256("bonjour")', a, VERT), ('SHA-256("Bonjour")', b, VERT), (f"Différences : {n} bits sur 256", difference, AMBRE)]
    for i, (titre, valeurs, couleur) in enumerate(grilles):
        x0, y0 = marge + i * (cote + marge), 108
        corps.append(t(x0 + cote / 2, y0 - 16, titre, 15, couleur if i == 2 else TEXTE, mono=i < 2, graisse=600))
        for k, bit in enumerate(valeurs):
            ligne, colonne = divmod(k, 16)
            corps.append(rect(x0 + colonne * case + 1, y0 + ligne * case + 1, case - 2, case - 2, couleur if bit else VIDE, None, 2))
    for i, symbole in enumerate(["⊕", "="]):
        corps.append(t(marge + (i + 1) * (cote + marge) - marge / 2, 108 + cote / 2 + 10, symbole, 30, DISCRET))
    corps.append(lignes(480, 372, [
        "Chaque case est un bit de l'empreinte, de gauche à droite puis de haut en bas (case pleine = 1).",
        f"Une seule lettre changée ( b → B ) fait basculer {n} bits sur 256, soit {100 * n / 256:.0f} % : c'est l'effet avalanche.",
    ]))
    return svg(960, 430, "".join(corps), "Effet avalanche : une majuscule change la moitié de l'empreinte")


@figure("01-hachage", 960, 480)
def anniversaires():
    def p(n):
        produit = 1.0
        for i in range(n):
            produit *= (365 - i) / 365
        return 1 - produit
    gauche, droite, haut, bas, maximum = 90, 920, 80, 360, 80
    x = lambda n: gauche + (droite - gauche) * n / maximum
    y = lambda v: bas - (bas - haut) * v
    corps = []
    for v in (0, 0.25, 0.5, 0.75, 1):
        corps.append(trait(gauche, y(v), droite, y(v), CADRE, 1))
        corps.append(t(gauche - 12, y(v) + 5, f"{int(v * 100)} %", 13, DISCRET, "end"))
    for n in range(0, maximum + 1, 10):
        corps.append(t(x(n), bas + 22, n, 13, DISCRET))
    corps.append(t((gauche + droite) / 2, bas + 46, "nombre de personnes", 13, DISCRET))
    points = " ".join(f"{x(n):.1f},{y(p(n)):.1f}" for n in range(0, maximum + 1))
    corps.append(f'<polyline points="{points}" fill="none" stroke="{VERT}" stroke-width="3"/>')
    for n, couleur, decalage in ((23, AMBRE, 14), (57, CIEL, 14)):
        valeur = p(n)
        corps.append(trait(x(n), bas, x(n), y(valeur), couleur, 1.4, "5 4"))
        corps.append(trait(gauche, y(valeur), x(n), y(valeur), couleur, 1.4, "5 4"))
        corps.append(f'<circle cx="{x(n):.1f}" cy="{y(valeur):.1f}" r="6" fill="{couleur}"/>')
        corps.append(t(x(n) + decalage, y(valeur) + 22, f"{n} personnes : {100 * valeur:.1f} %".replace(".", ","), 14, couleur, "start", 600))
    corps.append(lignes(480, 434, [
        "Probabilité qu'au moins deux personnes d'un groupe partagent leur anniversaire (365 jours possibles).",
        "Pour une empreinte de n bits, même effet : une collision devient probable vers 2^(n/2) essais.",
    ], 13.5))
    return svg(960, 480, "".join(corps), "Le paradoxe des anniversaires")


@figure("01-hachage", 960, 460)
def merkle_damgard():
    corps = []
    y_bloc, y_f, h = 96, 214, 56
    corps.append(boite(30, y_f, 90, h, "IV", "constante"))
    centres = [230, 420, 700]
    blocs = ["M₁", "M₂", "Mₙ + remplissage"]
    for i, (cx, bloc) in enumerate(zip(centres, blocs)):
        largeur_bloc = 190 if i == 2 else 110
        corps.append(boite(cx - largeur_bloc / 2, y_bloc, largeur_bloc, 48, bloc, couleur=CIEL, taille=16))
        corps.append(trait(cx, y_bloc + 48, cx, y_f - 4, CIEL, fleche=True))
        corps.append(boite(cx - 45, y_f, 90, h, "f", "compression", VERT))
    corps.append(t(565, y_f + h / 2 + 6, "…", 26, DISCRET))
    for x1, x2, etiquette in ((120, 185, "h₀"), (275, 375, "h₁"), (465, 540, "h₂"), (590, 655, "hₙ₋₁")):
        corps.append(trait(x1, y_f + h / 2, x2, y_f + h / 2, TEXTE, fleche=True))
        corps.append(t((x1 + x2) / 2, y_f + h / 2 - 8, etiquette, 13, DISCRET))
    corps.append(trait(745, y_f + h / 2, 800, y_f + h / 2, TEXTE, fleche=True))
    corps.append(boite(800, y_f, 130, h, "H(M) = hₙ", "empreinte", AMBRE))
    # Extension de longueur
    corps.append(trait(865, y_f + h, 865, 346, ROSE, fleche=True, pointille="5 4"))
    corps.append(boite(820, 346, 90, h, "f", "attaquant", ROSE, contour=ROSE))
    corps.append(boite(640, 350, 120, 48, "M′ choisi", couleur=ROSE, contour=ROSE))
    corps.append(trait(760, 374, 816, 374, ROSE, fleche=True))
    corps.append(lignes(40, 358, [
        "Extension de longueur : l'empreinte finale est l'état interne complet.",
        "Sans connaître le début secret du message, un attaquant reprend le calcul",
        "à partir de H(M) et obtient H(M ∥ remplissage ∥ M′).",
    ], 14, ancre="start"))
    corps.append(t(480, 80, "Le message, complété, est découpé en blocs de 512 bits", 13, DISCRET))
    return svg(960, 460, "".join(corps), "SHA-256 : la construction de Merkle–Damgård")


@figure("01-hachage", 960, 460)
def eponge():
    corps = []
    y_r, y_c, haut, bas = 190, 280, 150, 320
    corps.append(t(340, 80, "Absorption", 16, CIEL, graisse=600))
    corps.append(t(790, 80, "Essorage", 16, AMBRE, graisse=600))
    corps.append(trait(612, 64, 612, 350, CADRE, 1.2, "6 5"))
    corps.append(t(60, y_r + 5, "r", 16, CIEL, graisse=700))
    corps.append(t(60, y_c + 5, "c", 16, VIOLET, graisse=700))
    corps.append(t(78, y_r + 5, "0", 15, DISCRET, "start", mono=True))
    corps.append(t(78, y_c + 5, "0", 15, DISCRET, "start", mono=True))
    x, entrees = 100, ["P₀", "P₁", "P₂"]
    for entree in entrees:
        corps.append(trait(x, y_r, x + 40, y_r, TEXTE))
        corps.append(trait(x, y_c, x + 90, y_c, TEXTE, fleche=True))
        corps.append(f'<circle cx="{x + 55}" cy="{y_r}" r="14" fill="{PANNEAU}" stroke="{CIEL}" stroke-width="1.6"/>')
        corps.append(t(x + 55, y_r + 6, "⊕", 20, CIEL))
        corps.append(t(x + 55, 118, entree, 16, CIEL, graisse=600))
        corps.append(trait(x + 55, 126, x + 55, y_r - 16, CIEL, fleche=True))
        corps.append(trait(x + 69, y_r, x + 88, y_r, TEXTE, fleche=True))
        corps.append(boite(x + 90, haut, 56, bas - haut, "f", couleur=VERT))
        x += 146
    for sortie in ["Z₀", "Z₁"]:
        corps.append(trait(x, y_r, x + 88, y_r, TEXTE, fleche=True))
        corps.append(trait(x, y_c, x + 88, y_c, TEXTE, fleche=True))
        corps.append(trait(x + 40, y_r, x + 40, 128, AMBRE, fleche=True))
        corps.append(t(x + 40, 118, sortie, 16, AMBRE, graisse=600))
        corps.append(boite(x + 90, haut, 56, bas - haut, "f", couleur=VERT))
        x += 146
    corps.append(t(x + 22, y_r + 6, "…", 22, DISCRET))
    corps.append(lignes(40, 380, [
        "L'état de 1600 bits est coupé en deux : le débit r reçoit le message et fournit la sortie ; la capacité c n'est jamais",
        "lue ni écrite directement, c'est elle qui fixe la sécurité (c/2 bits). SHA3-256 : r = 1088, c = 512 ; f = Keccak-f[1600], 24 tours.",
    ], 14, ancre="start"))
    return svg(960, 460, "".join(corps), "SHA-3 : la construction éponge")


@figure("01-hachage", 960, 350)
def hmac():
    corps = []
    for rangee, (cle, donnee, sortie, couleur) in enumerate([
            ("K′ ⊕ ipad", "message m", "empreinte interne", CIEL),
            ("K′ ⊕ opad", "empreinte interne", "tag HMAC", AMBRE)]):
        y = 80 + rangee * 120
        corps.append(boite(40, y, 170, 52, cle, couleur=VIOLET, mono=True))
        corps.append(t(225, y + 32, "∥", 20, DISCRET))
        corps.append(boite(240, y, 200, 52, donnee, couleur=CIEL if rangee == 0 else TEXTE))
        corps.append(trait(440, y + 26, 520, y + 26, TEXTE, fleche=True))
        corps.append(boite(520, y, 110, 52, "SHA-256", couleur=VERT))
        corps.append(trait(630, y + 26, 700, y + 26, TEXTE, fleche=True))
        corps.append(boite(700, y, 220, 52, sortie, couleur=couleur))
    corps.append(f'<path d="M810,132 L810,166 L340,166 L340,196" fill="none" stroke="{CIEL}" stroke-width="1.6" '
                 f'stroke-dasharray="5 4" marker-end="url(#f{CIEL[1:]})"/>')
    corps.append(lignes(40, 300, [
        "K′ : la clé complétée par des zéros jusqu'à 64 octets (un bloc de SHA-256). ipad = 0x36 répété, opad = 0x5c répété.",
        "Le second hachage, qui enveloppe le premier, neutralise l'extension de longueur.",
    ], 14, ancre="start"))
    return svg(960, 350, "".join(corps), "La construction HMAC")


# ------------------------------------------------------------------ Courbes elliptiques

def courbe_jouet():
    p, a = 17, 2

    def add(P, Q):
        if P is None:
            return Q
        if Q is None:
            return P
        (x1, y1), (x2, y2) = P, Q
        if x1 == x2 and (y1 + y2) % p == 0:
            return None
        if P == Q:
            lam = (3 * x1 * x1 + a) * pow(2 * y1, -1, p) % p
        else:
            lam = (y2 - y1) * pow(x2 - x1, -1, p) % p
        x3 = (lam * lam - x1 - x2) % p
        return x3, (lam * (x1 - x3) - y1) % p

    multiples, R = {}, None
    for k in range(1, 19):
        R = add(R, (5, 1))
        multiples[R] = k
    return multiples


@figure("02-courbes-elliptiques", 960, 580)
def courbe_reels():
    gauche, droite, haut, bas = 70, 900, 70, 530
    xmin, xmax, ymin, ymax = -2.0, 2.6, -3.3, 3.3
    X = lambda v: gauche + (droite - gauche) * (v - xmin) / (xmax - xmin)
    Y = lambda v: bas - (bas - haut) * (v - ymin) / (ymax - ymin)
    f = lambda x: x ** 3 - x + 1
    racine = -1.324717957244746
    corps = [f'<clipPath id="zone"><rect x="{gauche}" y="{haut}" width="{droite - gauche}" height="{bas - haut}"/></clipPath>']
    for v in range(-2, 3):
        corps.append(trait(X(v), haut, X(v), bas, CADRE, 1))
        corps.append(t(X(v), Y(0) + 20, v, 12, DISCRET) if v else "")
    for v in range(-3, 4):
        corps.append(trait(gauche, Y(v), droite, Y(v), CADRE, 1))
        corps.append(t(X(0) - 10, Y(v) + 4, v, 12, DISCRET, "end") if v else "")
    corps.append(trait(gauche, Y(0), droite, Y(0), DISCRET, 1.4))
    corps.append(trait(X(0), haut, X(0), bas, DISCRET, 1.4))
    abscisses = [racine + (xmax - racine) * (i / 400) ** 2 for i in range(401)]
    haut_courbe = [(X(x), Y(math.sqrt(max(f(x), 0)))) for x in abscisses]
    bas_courbe = [(X(x), Y(-math.sqrt(max(f(x), 0)))) for x in abscisses]
    chemin = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in list(reversed(haut_courbe)) + bas_courbe)
    corps.append(f'<path d="{chemin}" fill="none" stroke="{VERT}" stroke-width="3" clip-path="url(#zone)"/>')
    P = (-1.0, 1.0)
    Q = (1.5, math.sqrt(f(1.5)))
    lam = (Q[1] - P[1]) / (Q[0] - P[0])
    x3 = lam * lam - P[0] - Q[0]
    y3 = lam * (P[0] - x3) - P[1]
    moinsR, R = (x3, -y3), (x3, y3)
    droite_pq = lambda x: P[1] + lam * (x - P[0])
    corps.append(f'<g clip-path="url(#zone)">{trait(X(xmin), Y(droite_pq(xmin)), X(xmax), Y(droite_pq(xmax)), CIEL, 2)}</g>')
    corps.append(trait(X(moinsR[0]), Y(moinsR[1]), X(R[0]), Y(R[1]) - 8, AMBRE, 1.8, "6 5", fleche=True))
    for (px, py), nom, couleur, dx, dy in ((P, "P", CIEL, -22, -12), (Q, "Q", CIEL, 12, -14), (moinsR, "−(P + Q)", DISCRET, -12, -14), (R, "P + Q", AMBRE, 14, 20)):
        corps.append(f'<circle cx="{X(px):.1f}" cy="{Y(py):.1f}" r="7" fill="{couleur}" stroke="{FOND}" stroke-width="2"/>')
        corps.append(t(X(px) + dx, Y(py) + dy, nom, 16, couleur, "start" if dx > 0 else "end", 700))
    corps.append(rect(84, 90, 290, 96, FOND, CADRE, 8))
    corps.append(lignes(98, 114, [
        "1. La droite (PQ) recoupe la courbe",
        "    en un troisième point.",
        "2. Son symétrique par rapport à l'axe",
        "    des abscisses est P + Q.",
    ], 14, TEXTE, 1.4, ancre="start"))
    corps.append(t(84, 512, "Courbe y² = x³ − x + 1 sur les nombres réels", 13, DISCRET, "start"))
    return svg(960, 580, "".join(corps), "Additionner deux points : la règle de la corde")


@figure("02-courbes-elliptiques", 960, 600)
def points_f17():
    multiples = courbe_jouet()
    cellule, x0, y0 = 28, 95, 540
    X = lambda v: x0 + v * cellule
    Y = lambda v: y0 - v * cellule
    corps = []
    for v in range(17):
        corps.append(trait(X(v), Y(0), X(v), Y(16), CADRE, 1))
        corps.append(trait(X(0), Y(v), X(16), Y(v), CADRE, 1))
        if v % 4 == 0 or v == 16:
            corps.append(t(X(v), y0 + 24, v, 12, DISCRET))
            corps.append(t(x0 - 14, Y(v) + 4, v, 12, DISCRET, "end"))
    corps.append(t(X(8), y0 + 46, "x", 14, DISCRET, graisse=600))
    corps.append(t(x0 - 44, Y(8), "y", 14, DISCRET, graisse=600))
    corps.append(trait(X(0) - 6, Y(8.5), X(16) + 6, Y(8.5), AMBRE, 1.3, "6 5"))
    for (px, py), k in multiples.items():
        couleur = VERT if k == 1 else CIEL
        corps.append(f'<circle cx="{X(px):.1f}" cy="{Y(py):.1f}" r="12.5" fill="{couleur}" fill-opacity="{1 if k == 1 else 0.9}"/>')
        corps.append(t(X(px), Y(py) + 4.5, k, 12, FOND, graisse=700))
    corps.append(lignes(610, 110, [
        "y² = x³ + 2x + 2 sur F₁₇",
    ], 17, TEXTE, graisse=600, ancre="start"))
    corps.append(lignes(610, 146, [
        "18 points (x, y) et le point à l'infini 𝒪 :",
        "19 points en tout.",
        "",
        "Le nombre inscrit dans chaque point est k",
        "tel que ce point vaut kG, avec G = (5, 1)",
        "(en vert). Exemple : 13G = (16, 4).",
        "",
        "Deux points symétriques par rapport à la",
        "ligne pointillée sont opposés : k + k′ = 19.",
        "",
        "Retrouver k à partir du point, c'est le",
        "logarithme discret. Ici on lit la réponse ;",
        "avec 2²⁵⁶ points, c'est impossible.",
    ], 14, ancre="start"))
    return svg(960, 600, "".join(corps), "Les points de la courbe jouet")


@figure("02-courbes-elliptiques", 960, 420)
def ecdh():
    corps = []
    for x, nom, secret, public, partage in (
            (40, "Alice", "a = 3", "A = aG = (10, 6)", "S = aB = 27G = (13, 7)"),
            (660, "Bob", "b = 9", "B = bG = (7, 6)", "S = bA = 27G = (13, 7)")):
        corps.append(rect(x, 70, 260, 230, PANNEAU, CADRE))
        corps.append(t(x + 130, 102, nom, 18, TEXTE, graisse=700))
        corps.append(t(x + 20, 140, "secret :", 13, DISCRET, "start"))
        corps.append(t(x + 20, 162, secret, 16, ROSE, "start", 600, mono=True))
        corps.append(t(x + 20, 198, "public :", 13, DISCRET, "start"))
        corps.append(t(x + 20, 220, public, 16, CIEL, "start", 600, mono=True))
        corps.append(t(x + 20, 256, "secret partagé :", 13, DISCRET, "start"))
        corps.append(t(x + 20, 278, partage, 15, VERT, "start", 700, mono=True))
    corps.append(t(480, 100, "Canal public", 15, DISCRET, graisse=600))
    corps.append(trait(305, 160, 652, 160, CIEL, 2, fleche=True))
    corps.append(t(480, 150, "A = (10, 6)", 15, CIEL, mono=True, graisse=600))
    corps.append(trait(655, 216, 308, 216, CIEL, 2, fleche=True))
    corps.append(t(480, 206, "B = (7, 6)", 15, CIEL, mono=True, graisse=600))
    corps.append(rect(330, 250, 300, 70, "#2a1d1f", ROSE))
    corps.append(t(480, 278, "Ève, l'espionne, voit G, A et B", 14, ROSE, graisse=600))
    corps.append(t(480, 300, "Calculer S exige a ou b : logarithme discret", 13, DISCRET))
    corps.append(lignes(480, 356, [
        "Courbe jouet y² = x³ + 2x + 2 sur F₁₇, point de base G = (5, 1) d'ordre 19 : 27G = 8G = (13, 7).",
        "En pratique (X25519), a et b font 32 octets et S passe ensuite dans une fonction de dérivation (HKDF).",
    ], 14))
    return svg(960, 420, "".join(corps), "L'échange de clés ECDH, calculé sur la courbe jouet")


# ------------------------------------------------------------------ PKI

def carte(x, y, titre, lignes_carte, couleur_titre=TEXTE, largeur=244, hauteur=240):
    contenu = [rect(x, y, largeur, hauteur, PANNEAU, CADRE), t(x + largeur / 2, y + 30, titre, 16, couleur_titre, graisse=700),
               trait(x + 16, y + 44, x + largeur - 16, y + 44, CADRE, 1)]
    yy = y + 68
    for etiquette, valeur, couleur in lignes_carte:
        contenu.append(t(x + 16, yy, etiquette, 12, DISCRET, "start"))
        contenu.append(t(x + 16, yy + 18, valeur, 14, couleur, "start", 600))
        yy += 44
    return "".join(contenu)


@figure("03-pki", 960, 470)
def chaine_confiance():
    corps = [rect(24, 64, 290, 330, "#16201c", VERT, 14, ' stroke-dasharray="6 5"'),
             t(169, 88, "Magasin de confiance (système, navigateur)", 12, VERT, graisse=600)]
    corps.append(carte(47, 110, "AC racine", [
        ("Sujet", "CN=Racine Exemple", VERT), ("Émetteur", "CN=Racine Exemple", VERT),
        ("Contraintes", "CA:TRUE (auto-signée)", TEXTE), ("Clé privée", "hors ligne, dans un HSM", DISCRET)]))
    corps.append(carte(378, 110, "AC intermédiaire", [
        ("Sujet", "CN=Intermédiaire Exemple", AMBRE), ("Émetteur", "CN=Racine Exemple", VERT),
        ("Contraintes", "CA:TRUE, pathlen:0", TEXTE), ("Usage", "signe au quotidien", DISCRET)]))
    corps.append(carte(690, 110, "Certificat du site", [
        ("Sujet (SAN)", "www.exemple.sn", CIEL), ("Émetteur", "CN=Intermédiaire Exemple", AMBRE),
        ("Contraintes", "CA:FALSE, serverAuth", TEXTE), ("Validité", "au plus 200 jours", DISCRET)]))
    for x1, x2 in ((316, 374), (624, 686)):
        corps.append(trait(x1, 230, x2, 230, TEXTE, 2, fleche=True))
        corps.append(t((x1 + x2) / 2, 220, "signe", 13, TEXTE, graisse=600))
    corps.append(lignes(480, 424, [
        "Le serveur envoie son certificat et l'intermédiaire ; le client vérifie chaque signature en remontant",
        "jusqu'à une racine qu'il possède déjà. Même couleur : l'émetteur d'un certificat est le sujet du suivant.",
    ], 14))
    return svg(960, 470, "".join(corps), "La chaîne de confiance")


@figure("03-pki", 960, 470)
def emission_certificat():
    corps = []
    for x, nom, couleur in ((30, "Serveur", CIEL), (640, "Autorité de certification", AMBRE)):
        corps.append(rect(x, 64, 290, 40, PANNEAU, couleur))
        corps.append(t(x + 145, 90, nom, 15, couleur, graisse=700))
        corps.append(trait(x + 145, 104, x + 145, 380, CADRE, 1.4, "5 5"))
    etapes = [
        (135, "serveur", "1. Génère sa paire de clés (site.key)", "la clé privée ne quitte jamais le serveur"),
        (270, "ac", "3. Vérifie la CSR et le contrôle du domaine", "puis signe avec sa clé privée (ac.key)"),
    ]
    for y, cote, titre, detail in etapes:
        x = 30 if cote == "serveur" else 640
        corps.append(rect(x, y - 24, 290, 56, "#16201c" if cote == "serveur" else "#221e14", CIEL if cote == "serveur" else AMBRE))
        corps.append(t(x + 145, y - 2, titre, 13, TEXTE, graisse=600))
        corps.append(t(x + 145, y + 18, detail, 11.5, DISCRET))
    corps.append(trait(320, 205, 636, 205, CIEL, 2, fleche=True))
    corps.append(t(480, 185, "2. Demande de certificat (CSR, PKCS #10)", 14, CIEL, graisse=600))
    corps.append(t(480, 226, "clé publique + nom demandé, signée par site.key", 12, DISCRET))
    corps.append(trait(636, 330, 324, 330, AMBRE, 2, fleche=True))
    corps.append(t(480, 320, "4. Certificat signé (site.pem)", 14, AMBRE, graisse=600))
    corps.append(rect(250, 380, 460, 60, PANNEAU, VERT))
    corps.append(t(480, 405, "5. Le client vérifie site.pem avec ac.pem", 14, VERT, graisse=600))
    corps.append(t(480, 426, "certificat de l'AC présent dans son magasin de confiance", 12, DISCRET))
    return svg(960, 470, "".join(corps), "Émettre un certificat : du serveur à l'autorité, et retour")


@figure("03-pki", 960, 470)
def duree_certificats():
    donnees = [
        ("juillet 2012", "60 mois", 1826, DISCRET), ("avril 2015", "39 mois", 1187, DISCRET),
        ("mars 2018", "825 jours", 825, DISCRET), ("septembre 2020", "398 jours", 398, DISCRET),
        ("mars 2026", "200 jours", 200, VERT), ("mars 2027", "100 jours", 100, AMBRE), ("mars 2029", "47 jours", 47, AMBRE)]
    gauche, largeur_max, y = 200, 560, 82
    corps = []
    for date, valeur, jours, couleur in donnees:
        largeur = max(largeur_max * jours / 1826, 4)
        futur = couleur == AMBRE
        corps.append(t(gauche - 16, y + 21, date, 14, TEXTE if not futur else AMBRE, "end", 600))
        extra = f' fill-opacity="0.35" stroke-dasharray="5 4"' if futur else ""
        corps.append(rect(gauche, y + 4, largeur, 26, couleur, couleur if futur else None, 5, extra))
        corps.append(t(gauche + largeur + 12, y + 22, valeur, 14, couleur, "start", 600))
        if couleur == VERT:
            corps.append(t(gauche + largeur + 100, y + 22, "← en vigueur", 13, VERT, "start"))
        y += 42
    corps.append(lignes(480, 400, [
        "Exigences du CA/Browser Forum et des navigateurs. Les trois dernières étapes découlent du vote SC-081 (2025).",
        "Conséquence : le renouvellement des certificats doit être entièrement automatisé (protocole ACME).",
    ], 14))
    return svg(960, 470, "".join(corps), "Durée de vie maximale des certificats TLS publics")


# ------------------------------------------------------------------ TLS

@figure("04-tls", 960, 300)
def visibilite_tls():
    segments = [
        ("En-tête IP", "adresses source et destination", 206, DISCRET, "visible"),
        ("En-tête TCP", "ports (443)", 124, DISCRET, "visible"),
        ("En-tête TLS", "type et longueur", 136, DISCRET, "visible"),
        ("Données chiffrées", "requête HTTP, adresse de la page, cookies, mots de passe, contenu", 414, VERT, "chiffré et authentifié")]
    corps, x = [], 40
    for titre, detail, largeur, couleur, statut in segments:
        chiffre = couleur == VERT
        corps.append(rect(x, 90, largeur - 6, 92, "#15271f" if chiffre else PANNEAU, couleur))
        corps.append(t(x + (largeur - 6) / 2, 124, titre, 15, couleur if chiffre else TEXTE, graisse=700))
        corps.append(t(x + (largeur - 6) / 2, 146, detail, 11.5 if chiffre else 12, DISCRET))
        corps.append(t(x + (largeur - 6) / 2, 168, statut, 12, couleur, graisse=600))
        x += largeur
    corps.append(lignes(40, 230, [
        "Reste aussi observable : la taille et le rythme des paquets, et pendant la poignée de main, le nom du site demandé",
        "(extension SNI du ClientHello), sauf avec Encrypted Client Hello. Avec TLS 1.3, le certificat du serveur est chiffré.",
    ], 14, ancre="start"))
    return svg(960, 300, "".join(corps), "Ce qu'un observateur du réseau voit d'une connexion TLS")


@figure("04-tls", 960, 680)
def handshake_tls13():
    client, serveur = 190, 770
    corps = []
    for x, nom in ((client, "Client"), (serveur, "Serveur")):
        corps.append(boite(x - 80, 62, 160, 42, nom))
        corps.append(trait(x, 104, x, 610, CADRE, 1.6))
    messages = [
        (150, 1, "ClientHello", "key_share (clé éphémère), supported_versions, SNI, signature_algorithms", DISCRET),
        (210, -1, "ServerHello", "key_share (clé éphémère du serveur)", DISCRET),
        (326, -1, "{EncryptedExtensions}", "paramètres restants (ALPN…)", AMBRE),
        (376, -1, "{Certificate}", "chaîne de certificats du serveur", AMBRE),
        (426, -1, "{CertificateVerify}", "signature de toute la transcription", AMBRE),
        (476, -1, "{Finished}", "HMAC de la transcription", AMBRE),
        (536, 1, "{Finished}", "", AMBRE),
    ]
    for y, sens, nom, detail, couleur in messages:
        x1, x2 = (client, serveur - 4) if sens > 0 else (serveur, client + 4)
        corps.append(trait(x1, y, x2, y, couleur, 2, fleche=True))
        corps.append(t(480, y - 8, nom, 14, TEXTE if couleur == DISCRET else couleur, graisse=700, mono=True))
        if detail:
            corps.append(t(480, y + 17, detail, 11.5, DISCRET))
    corps.append(trait(client - 70, 254, serveur + 70, 254, VIOLET, 1.2, "6 5"))
    corps.append(t(480, 276, "dérivation des clés de poignée de main : (EC)DHE puis HKDF", 12.5, VIOLET))
    corps.append(trait(client + 4, 586, serveur - 4, 586, VERT, 2.4, fleche=True, double=True))
    corps.append(t(480, 578, "[données applicatives]", 14, VERT, graisse=700, mono=True))
    corps.append(f'<path d="M60,150 L48,150 L48,476 L60,476" fill="none" stroke="{CIEL}" stroke-width="1.6"/>')
    corps.append(t(38, 313, "1 aller-retour", 13, CIEL, "middle", 600, extra=' transform="rotate(-90 38 313)"'))
    legende = [(DISCRET, "en clair"), (AMBRE, "{…} chiffré avec les clés de poignée de main"), (VERT, "[…] chiffré avec les clés applicatives")]
    x = 60
    for couleur, texte in legende:
        corps.append(rect(x, 638, 16, 16, couleur, None, 4))
        corps.append(t(x + 24, 651, texte, 13, DISCRET, "start"))
        x += 90 + len(texte) * 6.4
    return svg(960, 680, "".join(corps), "La poignée de main TLS 1.3")


# ------------------------------------------------------------------ Post-quantique

@figure("05-post-quantique", 960, 360)
def mosca():
    gauche, echelle = 60, 40  # 40 px par année
    X = lambda annee: gauche + annee * echelle
    corps = [trait(X(0), 270, X(21), 270, DISCRET, 1.4, fleche=True)]
    for annee in range(0, 21, 5):
        corps.append(trait(X(annee), 264, X(annee), 276, DISCRET, 1.4))
        corps.append(t(X(annee), 296, "aujourd'hui" if annee == 0 else f"+{annee} ans", 13, DISCRET))
    corps.append(rect(X(0), 110, 5 * echelle, 44, CIEL, None, 6))
    corps.append(t(X(2.5), 138, "y : migration (5 ans)", 14, FOND, graisse=700))
    corps.append(rect(X(5), 170, 10 * echelle, 44, AMBRE, None, 6))
    corps.append(t(X(8.5), 198, "x : confidentialité (10 ans)", 14, FOND, graisse=700))
    corps.append(rect(X(12), 170, 3 * echelle, 44, ROSE, None, 0, ' fill-opacity="0.85"'))
    corps.append(t(X(13.5), 198, "exposées", 14, FOND, graisse=700))
    corps.append(trait(X(12), 80, X(12), 262, ROSE, 2.4))
    corps.append(t(X(12) + 8, 94, "z : ordinateur quantique capable (hypothèse : 12 ans)", 14, ROSE, "start", 700))
    corps.append(t(X(5), 236, "dernières données chiffrées « à l'ancienne »", 12, DISCRET, "start"))
    corps.append(lignes(480, 330, [
        "x + y = 15 > z = 12 : les données chiffrées en fin de migration seront déchiffrables pendant 3 ans où elles restent sensibles.",
    ], 13))
    return svg(960, 360, "".join(corps), "L'inégalité de Mosca : x + y > z, on est en retard")


def barres_horizontales(rangees, series, maximum, largeur_max, gauche, y0, pas, log=False, minimum=1):
    """Rangées de barres (une par série) ; échelle linéaire ou logarithmique."""
    def longueur(v):
        if log:
            return largeur_max * (math.log10(v) - math.log10(minimum)) / (math.log10(maximum) - math.log10(minimum))
        return largeur_max * v / maximum
    corps, y = [], y0
    for etiquette, sous, valeurs in rangees:
        corps.append(t(gauche - 16, y + 17, etiquette, 14, TEXTE, "end", 600))
        if sous:
            corps.append(t(gauche - 16, y + 34, sous, 11.5, VERT if sous == "post-quantique" else DISCRET, "end"))
        for i, ((_, couleur), valeur) in enumerate(zip(series, valeurs)):
            yy = y + i * 17
            corps.append(rect(gauche, yy, max(longueur(valeur), 3), 14, couleur, None, 3))
            corps.append(t(gauche + max(longueur(valeur), 3) + 8, yy + 12, octets(valeur), 12, couleur, "start", 600))
        y += pas
    return "".join(corps)


@figure("05-post-quantique", 960, 400)
def tailles_kem():
    series = [("envoyé par le client : clé publique / clé d'encapsulation", CIEL), ("renvoyé par le serveur : clé publique / chiffré", AMBRE)]
    rangees = [("X25519", "classique", (32, 32)), ("ML-KEM-512", "post-quantique", (800, 768)),
               ("ML-KEM-768", "post-quantique", (1184, 1088)), ("ML-KEM-1024", "post-quantique", (1568, 1568))]
    corps = barres_horizontales(rangees, series, 1600, 560, 170, 80, 62)
    for i, (texte, couleur) in enumerate(series):
        corps += rect(170, 336 + i * 22, 14, 14, couleur, None, 3) + t(192, 348 + i * 22, texte, 13, DISCRET, "start")
    corps += t(930, 348, "secret partagé : 32 octets dans tous les cas", 13, VERT, "end", 600)
    return svg(960, 400, corps, "Échange de clés : X25519 face à ML-KEM (FIPS 203)")


@figure("05-post-quantique", 960, 560)
def tailles_signatures():
    series = [("clé publique", CIEL), ("signature", AMBRE)]
    rangees = [("Ed25519", "classique", (32, 64)), ("ECDSA P-256", "classique", (65, 64)), ("RSA-3072", "classique", (384, 384)),
               ("ML-DSA-44", "post-quantique", (1312, 2420)), ("ML-DSA-65", "post-quantique", (1952, 3309)),
               ("ML-DSA-87", "post-quantique", (2592, 4627)), ("SLH-DSA-128s", "post-quantique", (32, 7856)),
               ("SLH-DSA-128f", "post-quantique", (32, 17088))]
    gauche, largeur_max = 170, 620
    corps = ""
    for puissance in range(1, 5):
        x = gauche + largeur_max * (puissance - 1) / (math.log10(30000) - 1)
        corps += trait(x, 70, x, 482, CADRE, 1) + t(x, 500, octets(10 ** puissance), 12, DISCRET)
    corps += barres_horizontales(rangees, series, 30000, largeur_max, gauche, 76, 51, log=True, minimum=10)
    for i, (texte, couleur) in enumerate(series):
        corps += rect(gauche + i * 150, 522, 14, 14, couleur, None, 3) + t(gauche + 22 + i * 150, 534, texte, 13, DISCRET, "start")
    corps += t(930, 534, "échelle logarithmique", 12, DISCRET, "end", italique=True)
    return svg(960, 560, corps, "Signatures : tailles des clés publiques et des signatures")


@figure("05-post-quantique", 960, 450)
def hybride_tls():
    corps = []
    for y, message, gauche_txt, gauche_taille, total, couleur in (
            (84, "ClientHello · key_share", "clé d'encapsulation ML-KEM-768", 1184, 1216, CIEL),
            (184, "ServerHello · key_share", "chiffré ML-KEM-768", 1088, 1120, AMBRE)):
        corps.append(t(40, y + 30, message, 14, couleur, "start", 700, mono=True))
        corps.append(rect(290, y, 470, 48, "#16201c", VERT))
        corps.append(t(525, y + 21, gauche_txt, 13, VERT, graisse=600))
        corps.append(t(525, y + 39, octets(gauche_taille), 12, DISCRET))
        corps.append(rect(768, y, 120, 48, "#1a2230", CIEL))
        corps.append(t(828, y + 21, "X25519", 13, CIEL, graisse=600))
        corps.append(t(828, y + 39, octets(32), 12, DISCRET))
        corps.append(t(589, y + 66, f"total : {octets(total)}", 12, DISCRET))
    corps.append(rect(160, 300, 250, 50, "#16201c", VERT))
    corps.append(t(285, 330, "secret ML-KEM (32 o)", 14, VERT, graisse=600))
    corps.append(t(430, 332, "∥", 22, DISCRET))
    corps.append(rect(450, 300, 250, 50, "#1a2230", CIEL))
    corps.append(t(575, 330, "secret X25519 (32 o)", 14, CIEL, graisse=600))
    corps.append(trait(700, 325, 760, 325, TEXTE, fleche=True))
    corps.append(boite(760, 300, 170, 50, "HKDF", "calendrier de clés", VIOLET))
    corps.append(lignes(480, 396, [
        "Un attaquant doit casser à la fois ML-KEM (post-quantique) et X25519 (classique) pour retrouver les clés de session.",
        "Le reste de la poignée de main TLS 1.3 est inchangé ; coût : environ 1,1 Ko de plus dans chaque sens.",
    ], 13.5))
    return svg(960, 450, "".join(corps), "L'échange hybride X25519MLKEM768 dans TLS 1.3")


# ------------------------------------------------------------------ Cours d'exemple

def texte_des_cours():
    morceaux = []
    for fichier in sorted(COURS.glob("*/*.md")):
        texte = fichier.read_text(encoding="utf-8")
        texte = re.sub(r"```.*?```", " ", texte, flags=re.S)
        texte = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", texte)
        texte = re.sub(r"`[^`]*`|\$\$.*?\$\$|\$[^$]*\$|\(https?://[^)]*\)|https?://\S+", " ", texte, flags=re.S)
        morceaux.append(texte)
    return " ".join(morceaux)


@figure("10-symetrique-plus-loin", 960, 560)
def frequences():
    lettres = [c for c in unicodedata.normalize("NFD", texte_des_cours().upper()) if "A" <= c <= "Z"]
    total = len(lettres)
    comptes = [lettres.count(chr(65 + i)) / total for i in range(26)]
    decales = [comptes[(i - 3) % 26] for i in range(26)]
    corps = []
    for rangee, (titre, valeurs, pic) in enumerate((("Texte clair", comptes, "E"), ("Chiffré avec César, k = 3", decales, "H"))):
        base, hauteur_max = 250 + rangee * 200, 150
        corps.append(t(40, base - hauteur_max - 8, titre, 15, TEXTE, "start", 700))
        maximum = max(comptes)
        for i, v in enumerate(valeurs):
            x = 40 + i * 34.4
            h = hauteur_max * v / maximum
            couleur = AMBRE if chr(65 + i) == pic else (CIEL if rangee else VERT)
            corps.append(rect(x, base - h, 26, h, couleur, None, 3))
            corps.append(t(x + 13, base + 18, chr(65 + i), 13, couleur if chr(65 + i) == pic else DISCRET, graisse=600))
            if chr(65 + i) == pic:
                corps.append(t(x + 13, base - h - 8, f"{100 * v:.1f} %".replace(".", ","), 12, AMBRE, graisse=700))
    corps.append(lignes(480, 512, [
        f"Fréquences mesurées sur les textes des cours de la plateforme ({f'{total:,}'.replace(',', chr(160))} lettres, accents retirés).",
        "Le chiffre de César décale tout l'histogramme : le pic du E, devenu H, trahit la clé.",
    ], 13.5))
    return svg(960, 560, "".join(corps), "Analyse de fréquences : le chiffre de César se trahit")


def image_pixels(largeur, hauteur, rvba):
    """PNG minimal (RVBA 8 bits) écrit à la main : zlib + CRC, sans bibliothèque externe."""
    def bloc(type_bloc, donnees):
        return struct.pack(">I", len(donnees)) + type_bloc + donnees + struct.pack(">I", zlib.crc32(type_bloc + donnees))
    brut = b"".join(b"\x00" + rvba[y * largeur * 4:(y + 1) * largeur * 4] for y in range(hauteur))
    return (b"\x89PNG\r\n\x1a\n" + bloc(b"IHDR", struct.pack(">IIBBBBB", largeur, hauteur, 8, 6, 0, 0, 0))
            + bloc(b"IDAT", zlib.compress(brut, 9)) + bloc(b"IEND", b""))


def cadenas(cote=128):
    """Pixels RVBA d'un cadenas en aplats de couleur (les grandes zones unies révèlent ECB)."""
    fond, corps_c, anse, trou = (18, 60, 50, 255), (52, 211, 153, 255), (160, 172, 168, 255), (18, 24, 22, 255)
    pixels = bytearray()
    for y in range(cote):
        for x in range(cote):
            couleur = fond
            dx, dy = x - 64, y - 56
            distance = math.hypot(dx, dy)
            if 26 <= distance <= 38 and y <= 56:
                couleur = anse
            if 26 <= x <= 102 and 56 <= y <= 112:
                couleur = corps_c
            if (math.hypot(x - 64, y - 76) <= 9) or (60 <= x <= 68 and 76 <= y <= 98):
                couleur = trou
            pixels += bytes(couleur)
    return bytes(pixels)


def aes(mode, donnees):
    """Chiffrement AES-128 réel par OpenSSL (clé d'exemple de FIPS 197, compteur de SP 800-38A)."""
    cle = "2b7e151628aed2a6abf7158809cf4f3c"
    commande = ["openssl", "enc", f"-aes-128-{mode}", "-K", cle, "-nopad"]
    if mode == "ctr":
        commande += ["-iv", "f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"]
    return subprocess.run(commande, input=donnees, capture_output=True, check=True).stdout


@figure("10-symetrique-plus-loin", 960, 440)
def ecb_ctr():
    clair = cadenas()
    opaque = lambda d: bytes(b if i % 4 != 3 else 255 for i, b in enumerate(d))
    panneaux = [("Image d'origine", clair, TEXTE), ("AES-128-ECB", opaque(aes("ecb", clair)), ROSE), ("AES-128-CTR", opaque(aes("ctr", clair)), VERT)]
    corps = []
    for i, (titre, pixels, couleur) in enumerate(panneaux):
        x = 48 + i * 300
        donnees = b64encode(image_pixels(128, 128, pixels)).decode()
        corps.append(t(x + 128, 86, titre, 16, couleur, graisse=700))
        corps.append(f'<image x="{x}" y="100" width="256" height="256" image-rendering="pixelated" '
                     f'style="image-rendering:pixelated" href="data:image/png;base64,{donnees}"/>')
        corps.append(rect(x, 100, 256, 256, "none", CADRE, 4))
    corps.append(lignes(480, 392, [
        "Mêmes pixels, même clé. En ECB, deux blocs de 16 octets identiques donnent deux blocs chiffrés identiques : la forme reste visible.",
        "En CTR (ou GCM), chaque bloc est combiné à un flot de clé différent : le résultat est indiscernable du hasard.",
    ], 13))
    return svg(960, 440, "".join(corps), "Pourquoi ne jamais utiliser le mode ECB")


@figure("11-rsa-plus-loin", 960, 400)
def signature_flux():
    corps = [t(40, 88, "Signer (l'émetteur)", 15, TEXTE, "start", 700)]
    y = 104
    corps.append(boite(40, y, 140, 48, "message"))
    corps.append(trait(180, y + 24, 230, y + 24, TEXTE, fleche=True))
    corps.append(boite(230, y, 120, 48, "hachage", couleur=VERT))
    corps.append(trait(350, y + 24, 400, y + 24, TEXTE, fleche=True))
    corps.append(boite(400, y, 130, 48, "empreinte", couleur=CIEL))
    corps.append(trait(530, y + 24, 580, y + 24, TEXTE, fleche=True))
    corps.append(boite(580, y, 170, 48, "signer", "clé privée", ROSE, contour=ROSE))
    corps.append(trait(750, y + 24, 800, y + 24, TEXTE, fleche=True))
    corps.append(boite(800, y, 120, 48, "signature", couleur=AMBRE))
    corps.append(t(40, 216, "Vérifier (n'importe qui)", 15, TEXTE, "start", 700))
    y = 232
    corps.append(boite(40, y, 140, 48, "message reçu"))
    corps.append(trait(180, y + 24, 230, y + 24, TEXTE, fleche=True))
    corps.append(boite(230, y, 120, 48, "hachage", couleur=VERT))
    corps.append(trait(350, y + 24, 400, y + 24, TEXTE, fleche=True))
    corps.append(boite(400, y, 130, 48, "empreinte", couleur=CIEL))
    corps.append(trait(530, y + 24, 580, y + 24, TEXTE, fleche=True))
    corps.append(boite(580, y, 170, 48, "vérifier", "clé publique", VERT, contour=VERT))
    corps.append(trait(860, 152, 860, 200, AMBRE, pointille="5 4"))
    corps.append(f'<path d="M860,200 L860,212 L700,212 L700,228" fill="none" stroke="{AMBRE}" stroke-width="1.6" '
                 f'stroke-dasharray="5 4" marker-end="url(#f{AMBRE[1:]})"/>')
    corps.append(trait(750, y + 24, 800, y + 24, TEXTE, fleche=True))
    corps.append(boite(800, y, 120, 48, "valide ?", "oui / non", VERT))
    corps.append(lignes(480, 330, [
        "Seul le détenteur de la clé privée peut produire la signature ; tout le monde peut la vérifier avec la clé publique.",
        "Un seul bit modifié dans le message change l'empreinte : la vérification échoue.",
        "Schéma de RSA-PSS et d'ECDSA (hachage SHA-256 en général) ; Ed25519 hache lui-même le message complet avec SHA-512.",
    ], 13.5))
    return svg(960, 400, "".join(corps), "Signature numérique : signer et vérifier")


# ------------------------------------------------------------------ couvertures des cours (catalogue)
# Format des cartes du catalogue : 16:7 (960 × 420), image recadrée sans marge ni titre.

L_COUV, H_COUV = 960, 420


def couverture(corps, accent, legende, halo=(0.72, 0.45)):
    """Fond dégradé du thème, halo de la couleur du cours, motif, et légende en bas à gauche."""
    defs = (
        f'<linearGradient id="fond" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#17221e"/>'
        f'<stop offset="1" stop-color="#0b0f0e"/></linearGradient>'
        f'<radialGradient id="halo" cx="{halo[0]}" cy="{halo[1]}" r="0.55"><stop offset="0" stop-color="{accent}" '
        f'stop-opacity="0.32"/><stop offset="1" stop-color="{accent}" stop-opacity="0"/></radialGradient>'
        f'<filter id="lueur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter>'
    )
    marqueurs = "".join(
        f'<marker id="f{c[1:]}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" '
        f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>' for c in COULEURS)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{L_COUV}" height="{H_COUV}" viewBox="0 0 {L_COUV} {H_COUV}" '
            f'font-family="{POLICE}"><defs>{defs}{marqueurs}</defs>'
            f'<rect width="{L_COUV}" height="{H_COUV}" fill="url(#fond)"/><rect width="{L_COUV}" height="{H_COUV}" fill="url(#halo)"/>'
            f'{corps}{t(44, 384, legende, 27, accent, "start", 700, mono=True)}</svg>')


def lueur(element):
    """L'élément, doublé d'un halo flou derrière lui."""
    return f'<g filter="url(#lueur)" opacity="0.65">{element}</g>{element}'


@figure("01-hachage", L_COUV, H_COUV, "couverture.webp")
def couverture_hachage():
    empreinte = hashlib.sha256(b"bonjour").hexdigest()
    corps = []
    for i in range(4):
        ligne = " ".join(empreinte[i * 16 + k:i * 16 + k + 4] for k in range(0, 16, 4))
        corps.append(t(44, 112 + i * 54, ligne, 30, VERT, "start", 600, mono=True, extra=f' opacity="{1 - i * 0.22:.2f}"'))
    corps.append(t(44, 64, 'SHA-256("bonjour") =', 24, DISCRET, "start", mono=True))
    bits = [(octet >> (7 - i)) & 1 for octet in hashlib.sha256(b"bonjour").digest() for i in range(8)]
    case, x0, y0 = 18, 618, 60
    grille = []
    for k, bit in enumerate(bits):
        ligne, colonne = divmod(k, 16)
        if bit:
            grille.append(rect(x0 + colonne * case + 1.5, y0 + ligne * case + 1.5, case - 3, case - 3, VERT, None, 3))
        else:
            grille.append(rect(x0 + colonne * case + 1.5, y0 + ligne * case + 1.5, case - 3, case - 3, "#1f2b27", None, 3))
    corps.append(lueur("".join(g for g in grille if VERT in g)))
    corps.append("".join(g for g in grille if VERT not in g))
    return couverture("".join(corps), VERT, "SHA-256 · SHA-3 · HMAC · Argon2id")


@figure("02-courbes-elliptiques", L_COUV, H_COUV, "couverture.webp")
def couverture_ecc():
    X = lambda v: 330 + v * 210
    Y = lambda v: 200 - v * 62
    f = lambda x: x ** 3 - x + 1
    racine = -1.324717957244746
    abscisses = [racine + (2.75 - racine) * (i / 400) ** 2 for i in range(401)]
    haut = [(X(x), Y(math.sqrt(max(f(x), 0)))) for x in abscisses]
    bas = [(X(x), Y(-math.sqrt(max(f(x), 0)))) for x in abscisses]
    chemin = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in list(reversed(haut)) + bas)
    corps = [lueur(f'<path d="{chemin}" fill="none" stroke="{VERT}" stroke-width="5" stroke-linecap="round"/>')]
    P, Q = (-1.0, 1.0), (1.5, math.sqrt(f(1.5)))
    lam = (Q[1] - P[1]) / (Q[0] - P[0])
    x3 = lam * lam - P[0] - Q[0]
    y3 = lam * (P[0] - x3) - P[1]
    droite_pq = lambda x: P[1] + lam * (x - P[0])
    corps.append(trait(X(-1.6), Y(droite_pq(-1.6)), X(2.6), Y(droite_pq(2.6)), CIEL, 3))
    corps.append(trait(X(x3), Y(-y3) + 12, X(x3), Y(y3) - 14, AMBRE, 2.5, "8 7", fleche=True))
    for (px, py), couleur in ((P, CIEL), (Q, CIEL), ((x3, -y3), DISCRET), ((x3, y3), AMBRE)):
        corps.append(lueur(f'<circle cx="{X(px):.1f}" cy="{Y(py):.1f}" r="10" fill="{couleur}"/>'))
    for (px, py), nom, couleur, dx, dy in ((P, "P", CIEL, -20, -16), (Q, "Q", CIEL, 22, 32), ((x3, y3), "P + Q", AMBRE, 20, 30)):
        corps.append(t(X(px) + dx, Y(py) + dy, nom, 24, couleur, "end" if dx < 0 else "start", 700))
    return couverture("".join(corps), VERT, "y² = x³ + ax + b", halo=(0.5, 0.45))


@figure("03-pki", L_COUV, H_COUV, "couverture.webp")
def couverture_pki():
    corps = []
    # Bloc PEM décoratif (octets déterministes : l'image ne change pas d'une génération à l'autre)
    from base64 import b64encode as b64
    octets_pem = b"".join(hashlib.sha256(bytes([i])).digest() for i in range(12))
    pem = b64(octets_pem).decode()
    corps.append(t(44, 64, "-----BEGIN CERTIFICATE-----", 15, DISCRET, "start", mono=True, extra=' opacity="0.8"'))
    for i in range(6):
        corps.append(t(44, 92 + i * 26, pem[i * 32:(i + 1) * 32], 15, DISCRET, "start", mono=True, extra=f' opacity="{0.7 - i * 0.1:.2f}"'))
    corps.append(t(44, 92 + 6 * 26, "-----END CERTIFICATE-----", 15, DISCRET, "start", mono=True, extra=' opacity="0.25"'))
    cartes = [(470, 46, "AC racine", VERT), (560, 128, "AC intermédiaire", AMBRE), (650, 210, "www.exemple.sn", CIEL)]
    for i, (x, y, nom, couleur) in enumerate(cartes):
        if i:
            px, py = cartes[i - 1][0], cartes[i - 1][1]
            corps.append(trait(px + 120, py + 150, x + 40, y + 2, couleur, 2.4, "7 6", fleche=True))
        carte_svg = (rect(x, y, 240, 150, "#1b2420", couleur, 14, ' stroke-width="2"')
                     + t(x + 20, y + 36, nom, 21, couleur, "start", 700)
                     + trait(x + 20, y + 50, x + 220, y + 50, CADRE, 1.2)
                     + "".join(rect(x + 20, y + 66 + k * 20, (150, 120, 135)[k], 8, "#2c3833", None, 4) for k in range(3))
                     + f'<circle cx="{x + 200}" cy="{y + 108}" r="22" fill="none" stroke="{couleur}" stroke-width="3"/>'
                     + f'<circle cx="{x + 200}" cy="{y + 108}" r="13" fill="{couleur}" opacity="0.85"/>'
                     + f'<path d="M{x + 190},{y + 126} L{x + 186},{y + 146} L{x + 200},{y + 138} L{x + 214},{y + 146} L{x + 210},{y + 126}" '
                       f'fill="{couleur}" opacity="0.85"/>')
        corps.append(lueur(rect(x, y, 240, 150, "none", couleur, 14, ' stroke-width="2"')) + carte_svg)
    return couverture("".join(corps), AMBRE, "X.509 · AC · OCSP · Certificate Transparency", halo=(0.68, 0.5))


@figure("04-tls", L_COUV, H_COUV, "couverture.webp")
def couverture_tls():
    clairs = ["GET /mes-cours HTTP/2", "host: rootwise.sn", "cookie: session=…", "content-type: json"]
    corps = []
    for i, ligne in enumerate(clairs):
        y = 92 + i * 58
        corps.append(t(44, y, ligne, 19, TEXTE, "start", mono=True, extra=' opacity="0.75"'))
        corps.append(trait(330, y - 6, 404, 200, DISCRET, 1.4, "4 6"))
        chiffre = hashlib.sha256(ligne.encode()).hexdigest()[:20]
        corps.append(t(916, y, chiffre, 19, VERT, "end", 600, mono=True, extra=f' opacity="{0.95 - i * 0.12:.2f}"'))
        corps.append(trait(556, 200, 640, y - 6, VERT, 1.4, "4 6"))
    cadenas_svg = (f'<path d="M438,170 L438,128 A42,42 0 0 1 522,128 L522,170" fill="none" stroke="{VERT}" stroke-width="16" stroke-linecap="round"/>'
                   + rect(410, 166, 140, 112, VERT, None, 18)
                   + f'<circle cx="480" cy="210" r="15" fill="#0f1a16"/>' + rect(473, 214, 14, 36, "#0f1a16", None, 5))
    corps.append(lueur(cadenas_svg))
    return couverture("".join(corps), VERT, "TLS 1.3 · X25519MLKEM768 · AES-GCM", halo=(0.5, 0.48))


@figure("05-post-quantique", L_COUV, H_COUV, "couverture.webp")
def couverture_pq():
    b1, b2, origine = (74, 16), (26, 66), (560, 214)
    corps, points = [], []
    for i in range(-9, 10):
        for j in range(-5, 6):
            x = origine[0] + i * b1[0] + j * b2[0]
            y = origine[1] + i * b1[1] + j * b2[1]
            if 470 <= x <= 940 and 16 <= y <= 404:
                opacite = min(1.0, (x - 470) / 260) * 0.85 + 0.15
                points.append(f'<circle cx="{x}" cy="{y}" r="4.2" fill="{VIOLET}" opacity="{opacite:.2f}"/>')
    corps.append("".join(points))
    corps.append(lueur(trait(origine[0], origine[1], origine[0] + b1[0], origine[1] + b1[1], VERT, 4, fleche=True)
                       + trait(origine[0], origine[1], origine[0] + b2[0], origine[1] + b2[1], CIEL, 4, fleche=True)))
    corps.append(f'<circle cx="{origine[0]}" cy="{origine[1]}" r="7" fill="{TEXTE}"/>')
    proche = (origine[0] + 2 * b1[0] - b2[0], origine[1] + 2 * b1[1] - b2[1])
    cible = (proche[0] + 19, proche[1] - 23)
    corps.append(f'<circle cx="{proche[0]}" cy="{proche[1]}" r="11" fill="none" stroke="{VERT}" stroke-width="3"/>')
    corps.append(trait(proche[0], proche[1], cible[0], cible[1], AMBRE, 2.5, "5 4"))
    corps.append(lueur(f'<circle cx="{cible[0]}" cy="{cible[1]}" r="8" fill="{AMBRE}"/>'))
    corps.append(t(44, 150, "b = A·s + e", 56, TEXTE, "start", 700, mono=True))
    return couverture("".join(corps), VIOLET, "ML-KEM · ML-DSA · SLH-DSA", halo=(0.68, 0.5))


@figure("10-symetrique-plus-loin", L_COUV, H_COUV, "couverture.webp")
def couverture_symetrique():
    cx, cy = 710, 210
    corps = [f'<circle cx="{cx}" cy="{cy}" r="186" fill="none" stroke="{CADRE}" stroke-width="2"/>',
             f'<circle cx="{cx}" cy="{cy}" r="146" fill="#16201c" stroke="{CADRE}" stroke-width="2"/>',
             f'<circle cx="{cx}" cy="{cy}" r="104" fill="none" stroke="{CADRE}" stroke-width="2"/>']
    for i in range(26):
        angle = math.radians(i * 360 / 26 - 90)
        for rayon, lettre, couleur in ((166, chr(65 + i), TEXTE), (125, chr(65 + (i + 3) % 26), VERT)):
            x, y = cx + rayon * math.cos(angle), cy + rayon * math.sin(angle)
            mise_en_valeur = i == 0  # A en clair, D chiffré : la clé se lit sur la roue
            corps.append(t(x, y + 7, lettre, 21 if mise_en_valeur else 18, AMBRE if mise_en_valeur else couleur,
                           graisse=800 if mise_en_valeur else 600, mono=True))
    corps.append(t(cx, cy + 10, "k = 3", 26, AMBRE, graisse=700, mono=True))
    corps.append(t(44, 104, "ATTAQUE A L AUBE", 30, TEXTE, "start", 700, mono=True))
    corps.append(t(44, 196, "DWWDTXH D O DXEH", 30, VERT, "start", 700, mono=True))
    return couverture("".join(corps), AMBRE, "César · AES · GCM", halo=(0.74, 0.5))


@figure("11-rsa-plus-loin", L_COUV, H_COUV, "couverture.webp")
def couverture_rsa():
    corps = [t(44, 118, "c = mᵉ mod n", 50, TEXTE, "start", 700, mono=True),
             t(44, 184, "m = cᵈ mod n", 34, DISCRET, "start", 600, mono=True)]
    corps.append(lueur(rect(640, 52, 200, 70, "#1b2420", AMBRE, 14, ' stroke-width="2.5"')))
    corps.append(t(740, 97, "n = 3233", 28, AMBRE, graisse=700, mono=True))
    for x, valeur in ((575, "p = 61"), (775, "q = 53")):
        corps.append(trait(740, 124, x + 75, 206, DISCRET, 2))
        corps.append(lueur(rect(x, 206, 150, 62, "#1f1a1c", ROSE, 14, ' stroke-width="2.5"')))
        corps.append(t(x + 75, 246, valeur, 26, ROSE, graisse=700, mono=True))
    return couverture("".join(corps), ROSE, "RSA · OAEP · PSS", halo=(0.75, 0.45))


# ------------------------------------------------------------------ rendu

def navigateur():
    candidats = [os.environ.get("NAVIGATEUR"), shutil.which("msedge"), shutil.which("google-chrome"), shutil.which("chromium"),
                 shutil.which("chrome"), r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
                 r"C:\Program Files\Microsoft\Edge\Application\msedge.exe", r"C:\Program Files\Google\Chrome\Application\chrome.exe"]
    for chemin in candidats:
        if chemin and Path(chemin).exists():
            return chemin
    sys.exit("Navigateur Chromium introuvable : définissez NAVIGATEUR=/chemin/vers/chrome.")


def main(noms):
    chrome = navigateur()
    inconnus = set(noms) - set(FIGURES)
    if inconnus:
        sys.exit(f"Figures inconnues : {', '.join(sorted(inconnus))}. Disponibles : {', '.join(FIGURES)}")
    for nom, (cours, largeur, hauteur, fonction, fichier) in FIGURES.items():
        if noms and nom not in noms:
            continue
        source = ICI / "svg" / f"{nom}.svg"
        source.parent.mkdir(exist_ok=True)
        source.write_text(fonction(), encoding="utf-8")
        cible = COURS / cours / "images" / fichier  # format choisi par le navigateur selon l'extension
        cible.parent.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory() as profil:
            subprocess.run([chrome, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={profil}",
                            "--force-device-scale-factor=2", "--default-background-color=00000000",
                            f"--window-size={largeur},{hauteur}", f"--screenshot={cible}", source.as_uri()],
                           check=True, capture_output=True)
        print(f"{cible.relative_to(ICI.parent)}  ({cible.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    main(sys.argv[1:])
