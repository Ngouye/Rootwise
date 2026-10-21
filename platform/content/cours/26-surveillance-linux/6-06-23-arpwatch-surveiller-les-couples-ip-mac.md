| 🎯 Objectif | 📦 Paquet | 🧭 Type |
|:--|:--|:--|
| Détecter nouvelles machines et usurpation ARP | `arpwatch` | ⚙️ Service |

`arpwatch` écoute le trafic ARP d'un réseau Ethernet et tient une base des **couples adresse IP / adresse MAC**,
horodatés. Il signale chaque nouvelle machine et chaque changement — un signe classique d'**usurpation ARP** (*ARP
spoofing*), utilisée pour intercepter le trafic.

```bash title="bash"
$ sudo apt install arpwatch
$ sudo systemctl enable --now arpwatch@enp0s3      # Debian : une instance par interface
$ sudo dnf install arpwatch && sudo systemctl enable --now arpwatch   # RHEL
$ sudo journalctl -u 'arpwatch*' -f
arpwatch: new station 192.168.0.57 3c:52:82:4e:19:a7 enp0s3
arpwatch: changed ethernet address 192.168.0.1 52:54:00:9a:3c:11 (52:54:00:12:ab:cd) enp0s3
```

| Message | Signification |
|:--|:--|
| `new station` | Une adresse IP apparaît pour la première fois |
| `changed ethernet address` | Une IP connue répond avec une autre adresse MAC : à vérifier |
| `flip flop` | L'IP alterne entre deux MAC : usurpation ou conflit probable |
| `reused old ethernet address` | Retour à une ancienne MAC déjà vue pour cette IP |
| `bogon` | Adresse qui n'appartient pas au réseau local surveillé |

> [!CAUTION] Passerelle concernée ?
> Un message « changed ethernet address » ou « flip flop » sur l'adresse de la **passerelle** est une alerte
> sérieuse : un poste peut se faire passer pour le routeur. Vérifiez immédiatement la MAC légitime du routeur et
> isolez la machine suspecte.
