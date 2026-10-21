| 🎯 Objectif | 🐧 Systèmes | 🚦 Risque |
|:--|:--|:--|
| Confirmer qu'aucun paquet n'est resté partiel | Debian · Ubuntu · Linux Mint | ⚪ Aucun |

Avant de reprendre la mise à jour, vérifiez que la base est de nouveau cohérente. `dpkg --audit` liste les
paquets encore partiellement installés ou configurés : **une sortie vide signifie que tout est en ordre**.

```bash title="bash"
$ sudo dpkg --audit
# Aucune sortie : la base est cohérente
$ dpkg -l | grep -E '^i[UFH]'
# Aucune ligne : tous les paquets sont à l'état « ii »
```
