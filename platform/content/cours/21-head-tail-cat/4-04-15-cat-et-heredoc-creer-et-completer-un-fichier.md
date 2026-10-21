| 🎯 Objectif | 🐧 Disponibilité | 📶 Niveau |
|:--|:--|:--|
| Écrire un fichier depuis le terminal | Toutes distributions (GNU coreutils) | 🔵 Pratique |

Sans fichier d'entrée, `cat` lit le clavier : après `cat > notes.txt`, tout ce que vous tapez est écrit dans
le fichier, ligne après ligne. **Ctrl+D** (fin de fichier) termine la saisie et rend la main.

## Le heredoc : créer un fichier en une seule commande

Pour des créations répétables — scripts, déploiements, documentation —, le **heredoc** est plus pratique :
tout le contenu figure dans la commande, entre deux marqueurs identiques.

```bash title="bash"
$ cat > /tmp/app.conf << 'EOF'
server_name=web01
env=production
port=8080
EOF
$ cat /tmp/app.conf
server_name=web01
env=production
port=8080
```

| Forme | Effet |
|:--|:--|
| `<< 'EOF'` | Contenu copié tel quel : `$VAR` et `$(commande)` ne sont pas interprétés |
| `<< EOF` | Les variables et substitutions de commandes sont remplacées par leur valeur |
| `<<- EOF` | Les tabulations de début de ligne sont ignorées (indentation dans un script) |
| `<< FIN` | N'importe quel mot convient, s'il est identique à l'ouverture et à la fermeture |

## Ajouter à la fin d'un fichier

```bash title="bash"
$ cat >> ~/deploy.log << 'EOF'
Déploiement terminé le 24/08/2026 à 14:32 UTC
EOF
# Fichier appartenant à root : passer par sudo tee -a
$ sudo tee -a /var/log/deploy.log > /dev/null << 'EOF'
Déploiement terminé le 24/08/2026 à 14:32 UTC
EOF
```

> [!WARNING] `sudo` et redirection
> `sudo cat >> /var/log/deploy.log` échoue avec « Permission denied » : la redirection est réalisée par
> **votre propre shell**, sans privilèges. `sudo tee -a` écrit, lui, le fichier avec les droits root.
