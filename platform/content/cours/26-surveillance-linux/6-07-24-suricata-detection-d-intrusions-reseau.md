| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Repérer attaques et comportements suspects | `suricata` (EPEL, PPA OISF) | ⚙️ Service |

**Suricata** est un moteur de détection (**IDS**) et de prévention (**IPS**) d'intrusions réseau, libre et
performant, développé par l'Open Information Security Foundation (OISF). Il analyse le trafic avec des milliers de
règles, reconnaît les protocoles applicatifs et journalise alertes et métadonnées au format JSON.

```bash title="bash"
$ sudo apt install suricata        # Ubuntu : PPA oisf/suricata-stable pour la dernière version
$ sudo dnf install epel-release && sudo dnf install suricata    # RHEL & co
$ sudo suricata-update             # télécharger les règles (ET Open par défaut)
$ sudo suricata -T -c /etc/suricata/suricata.yaml    # tester la configuration
$ sudo systemctl enable --now suricata
$ sudo tail -f /var/log/suricata/fast.log
09/08/2026-10:42:17.512340 [**] [1:2001219:20] ET SCAN Potential SSH Scan [**]
  [Classification: Attempted Information Leak] [Priority: 2] {TCP}
  203.0.113.45:51012 -> 192.168.0.10:22
```

*Ligne d'alerte coupée pour la lisibilité.*

```bash title="bash"
# Les signatures les plus fréquentes du jour (jq requis)
$ sudo jq -r 'select(.event_type=="alert") | .alert.signature' \
    /var/log/suricata/eve.json | sort | uniq -c | sort -rn | head
```

> [!WARNING] Avant la mise en service
> Dans `/etc/suricata/suricata.yaml`, renseignez `HOME_NET` (vos réseaux) et l'interface d'écoute (section
> `af-packet`). Commencez en **mode IDS** (détection seule) ; le mode IPS, qui bloque le trafic, demande une
> intégration au pare-feu et une période de rodage des règles.
