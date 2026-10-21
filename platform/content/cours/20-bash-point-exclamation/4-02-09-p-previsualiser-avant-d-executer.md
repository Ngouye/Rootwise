| 🎯 Objectif | 🖥️ Contexte | 📶 Niveau |
|:--|:--|:--|
| Vérifier la commande développée sans risque | Terminal interactif | 🟢 Essentiel |

Le modificateur `:p` (*print*) affiche la commande développée **sans l'exécuter**. Elle est en même temps
ajoutée à l'historique : `!!` suffit ensuite pour la lancer, ou la flèche haut pour la modifier.

```bash title="bash"
$ !rm:p
rm -rf /var/tmp/build-cache
$ !!                            # exécuter, après vérification
rm -rf /var/tmp/build-cache
```

`:p` fonctionne avec toutes les formes : `!!:p`, `!1551:p`, `!?Desktop?:p`, `!!:gs/a/b/:p`.

## Toujours relire : l'option `histverify`

Avec `histverify`, Bash ne lance plus directement une commande issue de l'historique : il la place sur la
ligne de saisie, où vous pouvez la relire, la modifier ou l'annuler avant d'appuyer sur **Entrée**.

```bash title="bash"
$ shopt -s histverify
$ echo 'shopt -s histverify' >> ~/.bashrc     # réglage permanent
```

> [!TIP] Le bon réflexe
> Activez `histverify` sur les serveurs de production : vous gardez la rapidité de `!!` et `!$`, sans
> exécution surprise. Et prenez l'habitude de `:p` avant tout `!rm`, `!dd` ou commande destructrice
> rappelée de l'historique.
