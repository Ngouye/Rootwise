| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Utiliser un `!` littéral dans une commande | Terminal interactif | 🔵 Pratique |

Un `!` placé entre guillemets doubles est interprété comme une expansion d'historique. Un mot de passe,
une URL ou un message qui en contient déclenche alors une erreur :

```bash title="bash"
$ mysql -u admin -p"S3cret!Pass"
bash: !Pass: event not found
```

| Solution | Exemple et remarque |
|:--|:--|
| Guillemets simples | `mysql -u admin -p'S3cret!Pass'` : tout est littéral, la solution la plus sûre |
| Barre oblique hors guillemets | `echo Bravo\!` affiche `Bravo!` |
| Désactiver l'expansion | `set +H` (ou `set +o histexpand`), puis `set -H` pour la rétablir |

```bash title="bash"
$ echo "Bravo\!"                # piège : la barre oblique reste affichée
Bravo\!
$ echo "Bonjour !"              # ! suivi d'un guillemet : aucune expansion
Bonjour !
```

> [!CAUTION] Et pour les mots de passe
> Évitez de taper un mot de passe en clair sur la ligne de commande : il reste dans `~/.bash_history` et
> apparaît dans la liste des processus. Préférez `mysql -u admin -p` sans valeur, qui le demande de façon
> masquée, ou un fichier d'options protégé.
