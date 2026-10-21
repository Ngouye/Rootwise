| 📦 Paquet | 🔑 Privilèges | 🏷️ Statut |
|:--|:--|:--|
| `nmap` | Utilisateur (root pour scans SYN, UDP et détection d'OS) | 🔵 Actif |

`nmap` (*Network Mapper*) est un scanner réseau puissant et extrêmement polyvalent. Il découvre les hôtes actifs
d'un réseau, identifie les ports ouverts et les services qui y répondent, détecte les versions logicielles et le
système d'exploitation. C'est un outil central pour l'inventaire, l'audit réseau et le durcissement de la sécurité.

```bash title="bash"
$ nmap 192.168.1.30
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.1.30
Host is up (0.00031s latency).
Not shown: 996 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
3306/tcp open  mysql

Nmap done: 1 IP address (1 host up) scanned in 0.18 seconds
```

| Commande | Usage |
|:--|:--|
| `nmap -sn 192.168.1.0/24` | Découvrir les hôtes actifs d'un réseau (sans scan de ports) |
| `nmap -p 22,80,443 <hôte>` | Scanner des ports précis |
| `nmap -p- <hôte>` | Scanner les 65 535 ports TCP |
| `nmap -sV <hôte>` | Identifier les services et leurs versions |
| `sudo nmap -O <hôte>` | Détecter le système d'exploitation |
| `sudo nmap -sU -p 53,123 <hôte>` | Scanner des ports UDP |
| `sudo nmap -A <hôte>` | Scan complet : OS, versions, scripts et traceroute |
| `nmap --script vuln <hôte>` | Scripts NSE de détection de vulnérabilités connues |

> [!CAUTION] Cadre légal
> Ne scannez que les systèmes dont vous avez la responsabilité ou pour lesquels vous disposez d'une
> **autorisation écrite**. Un scan non autorisé peut être assimilé à une tentative d'intrusion et engager votre
> responsabilité.
