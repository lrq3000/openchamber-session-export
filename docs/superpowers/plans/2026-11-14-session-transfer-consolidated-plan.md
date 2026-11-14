# Plan consolidé — export, reprise et import de sessions

## Statut et base

Plan demandé le 14 novembre 2026 ; pas une implémentation terminée.

### Implementation progress — 2026-11-14

The user subsequently approved repository implementation of this plan. Source version 0.4.0 now implements the consolidated export/import workflows and has passed isolated Linux, native OpenCode, browser and streaming checks. See [the implementation validation record](../../2026-11-14-session-transfer-validation.md) for exact results and limits. Real Windows/Electron and Android execution remains unverified. The implementation phase performed no live installation, infrastructure change, restart, commit, push or publication. A later explicit approval authorizes separate squash integration into `main` and publication of both `main` and `archive/feat/session-transfer`, without force or cleanup.

- Dépôt canonique : `lrq3000/openchamber-session-export`.
- Base inspectée : version `0.3.0`, commit `9339f4204a07932ba6f7b52b2da86488a761c226`.
- Conserver Windows/Linux, le panneau mobile existant et les comportements macOS déjà pris en charge.
- Extension dédiée à OpenChamber, avec un plugin OpenCode embarqué dans le même paquet.
- Ne modifier ni le code d’OpenChamber ni celui d’OpenCode, ni leur base de données directement.
- La demande actuelle porte sur le plan. Installation, changement d’infrastructure, redémarrage, publication et push ne sont pas autorisés par ce document.

Références :

- [Importeur : mécanisme et preuve isolée](../../2026-11-14-session-import-investigation.md).
- [Échanges client : mécanismes et preuves isolées](../../2026-11-14-client-transfer-investigation.md).

## 1. Périmètre utilisateur retenu

### Parcours de base, indépendant du moyen de transfert

1. Exporter le ZIP sur l’instance source.
2. Récupérer le ZIP avec le téléchargement natif **Fichiers**, ou par un autre moyen choisi par l’utilisateur.
3. Déplacer le ZIP vers l’instance destination : téléversement natif Fichiers, téléversement intégré, SFTP/SCP/FTP ou autre transport extérieur à l’extension.
4. Dans l’extension destination, fournir **le chemin du ZIP sur ce serveur**, choisir le dossier de travail cible, prévisualiser puis confirmer l’import.
5. Ouvrir la nouvelle session restaurée.

« Chemin local » signifie local au serveur où tourne l’extension sélectionnée : sur une instance VPS, un chemin du VPS ; sur une instance du portable, un chemin du portable. L’interface doit le dire explicitement. Accepter un chemin ne donne pas automatiquement accès au disque du navigateur.

Le parcours de base ne dépend ni de la page compagnon, ni d’une connexion réciproque entre les machines, ni d’un serveur FTP intégré.

### Confort intégré également prévu

- **Téléverser un ZIP depuis cet appareil** : sélecteur de fichier dans le panneau, envoi par blocs.
- **Télécharger par page compagnon** : page fournie par le même service, utilisable en local et à travers le tunnel natif Desktop lorsque disponible.
- **Fichiers / Copier le chemin** reste un parcours de premier rang, pas une erreur ou un échec.
- Android/navigateur distant : ne jamais ouvrir le localhost du client en prétendant atteindre celui du VPS. Sans URL compagnon privée déjà configurée, proposer Fichiers ; aucune nouvelle route réseau n’est nécessaire pour le parcours de base.
- Pas de transfert direct entre serveurs ni de récupération automatique des connexions du portable.

## 2. Les deux modes d’export

### Complet

Conserver l’export existant : conversation principale, messages projetés et champs inconnus, raisonnement exposé, outils/résultats, descendants et journaux durables disponibles. Les fichiers externes restent une inclusion explicite.

Ajouter au format les informations nécessaires à une restauration contrôlée : versions, capacités, instructions de session et références épinglées accessibles. Un élément que les API ne permettent pas de capturer doit être signalé, jamais inventé.

**Archive complète ne signifie pas clonage binaire du stockage OpenCode.** Les journaux exportés restent des éléments de consultation/preuve ; ils ne seront pas rejoués directement dans le journal interne ou SQLite. La fidélité de l’import des enregistrements interrompus doit être vérifiée avec l’importeur officiel.

### Instantané de reprise

Produire une copie légère à partir du **contexte réellement actif** :

- dernière compaction réussie et résumé réutilisable ;
- conversation récente conservée par le moteur, y compris les messages d’avant la compaction encore présents dans sa fenêtre effective ;
- échanges utiles postérieurs, avec leurs outils et références nécessaires ;
- messages épinglés, y compris anciens, instructions de session et éléments de connaissance actifs accessibles ;
- fichiers explicitement retenus, avec recommandations pour les références récentes et épinglées.

Lire le contexte via les API du plugin embarqué et les informations de compaction, pas avec une simple coupure chronologique. Ne pas appeler un modèle pour fabriquer un nouveau résumé.

Si aucune compaction n’existe, partir du contexte effectif disponible et expliquer que le gain peut être faible. Si un checkpoint opaque dépend d’un fournisseur/modèle, signaler cette dépendance ; n’utiliser un résumé textuel existant comme alternative que si elle est vérifiable. Refuser une reprise trompeuse lorsque des éléments indispensables manquent.

Option **Conserver les anciens échanges pour consultation** :

- conserver les anciens textes utilisateur/assistant de la conversation principale dans une section d’archive séparée ;
- ne pas conserver les anciens résultats d’outils ou l’historique des sous-agents pour cette option ;
- ne pas réinjecter ces anciens textes dans le contexte actif ;
- un ancien message explicitement épinglé doit néanmoins rester disponible dans le contexte de reprise.

Aucune exclusion ne supprime quoi que ce soit dans la session ou les fichiers source.

## 3. Fichiers, instructions et portabilité

- Conserver le principe actuel d’opt-in pour les fichiers externes ; présenter des recommandations plutôt que parcourir arbitrairement tout le projet.
- Distinguer fichier épinglé, référence du contexte récent, pièce jointe, fichier manquant et fichier refusé.
- Définir « récent » par les références de la fenêtre effective sélectionnée, pas par un balayage des dates de modification de tout le disque.
- Dédupliquer les copies, revalider les fichiers au moment de la lecture et calculer leurs empreintes.
- Préserver les liens entre messages, pièces jointes, sessions filles et instructions ; réécrire uniquement les champs de référence connus.
- Garder les anciens chemins dans le texte historique ; ne pas effectuer de remplacement aveugle dans les propos de l’utilisateur ou les sorties d’outils.
- À l’import, séparer le dossier de travail choisi des fichiers restaurés. Ces derniers vont dans un nouveau dossier dédié, sans écraser des fichiers du projet.
- Adapter les chemins Windows/Linux, détecter les collisions de casse, noms réservés et chemins non représentables.
- Capturer les valeurs accessibles des pins/instructions et leurs origines ; les restaurer dans la nouvelle session sans remplacer les réglages globaux de destination.
- Régénérer l’environnement courant à destination ; ne pas figer comme règles actives les anciens chemins d’exécution ou la date de l’instance source.
- Signaler les dépendances non transportées : dépôt/worktree, outils, modèles, skills, MCP, fichiers absents, services et credentials.

Un ZIP peut contenir des informations confidentielles déjà présentes dans la conversation. Il n’est pas chiffré. Les jetons techniques du service/plugin et les magasins de credentials ne doivent jamais être ajoutés par notre mécanisme.

## 4. Format d’archive et prévisualisation

Faire évoluer le manifeste de manière versionnée, en gardant un lecteur explicite pour le format actuel `openchamber-session-export/1`.

Le nouveau format distinguera :

- profil et options d’export ;
- données restaurables de la conversation ;
- contexte de reprise, pins et instructions ;
- historique de consultation, séparé du contexte actif ;
- descendants du mode Complet ;
- fichiers inclus et correspondances de références ;
- couverture, dépendances, avertissements, versions et sommes de contrôle.

Les noms exacts des nouvelles entrées seront fixés avec les tests de schéma, sans casser silencieusement les anciennes archives.

### Avant l’export

**Prévisualiser la taille** montrera :

- taille connue des éléments sélectionnés avant compression ;
- estimation de la taille ZIP, clairement nommée comme estimation ;
- répartition conversation / contexte / historique / sous-sessions / fichiers ;
- effets des options et avertissements.

Un **calcul exact facultatif** exécutera réellement la compression. Réutiliser le ZIP préparé pour l’export final si la sélection et les empreintes sont identiques, au lieu de compresser deux fois. Sinon invalider la mesure et demander une nouvelle préparation.

### Avant l’import

Afficher le profil, les sessions/messages et fichiers, les tailles compressée et décompressée, le dossier cible, les dépendances, la compatibilité et les éventuelles pertes imposées par l’API. Vérifier l’espace nécessaire au staging et à la restauration.

Boutons explicites : **Prévisualiser la taille**, **Exporter** / **Importer**, **Annuler**. La préparation d’un ZIP ne doit pas importer une session.

### Implementation language and required importer notice

Use idiomatic English for the implementation, UI copy, comments, and new developer documentation. The French labels above describe the intended behavior, not the final interface wording. Use labels such as **Preview size**, **Export**, **Import**, **Cancel**, and **ZIP path on this server**.

The importer must prominently display the following notice in italics before confirmation, for both client-upload and server-path imports:

*Importing always creates a new session. OpenCode’s import API cannot update an existing session.*

Use semantic emphasis such as `<em>` and cover the wording and italic presentation in UI tests. Comment nontrivial implementation decisions, including security boundaries, effective-context reconstruction, identifier/path remapping, streaming, cancellation, and recovery. Explain why the logic is necessary and which invariants it preserves.

## 5. Architecture : un paquet, un plugin OpenCode embarqué

### Panneau OpenChamber

Gère les choix, le sélecteur client, les chemins serveur, les confirmations et l’état des jobs. Il ne reçoit pas les credentials et ne garde pas une conversation entière en mémoire.

### Service de l’extension

Gère la capture sur disque, les profils, ZIP/manifeste, prévisualisation, upload par blocs, import par chemin, validation, staging, progression et page compagnon. Réutiliser le pipeline progressif existant.

### Même plugin OpenCode embarqué

Déclaré avec `contributes.opencodePlugin`, chargé par OpenChamber après approbation **Ajouter un plugin à OpenCode**. Il offre des opérations internes étroites, notamment :

1. **Lire le contexte utile à la reprise** et les instructions accessibles.
2. **Préparer/adapter la copie de session** : valider la représentation importable, appliquer le profil, attribuer de nouveaux identifiants et adapter les références et chemins.
3. **Importer la copie préparée** : appeler `POST /api/experimental/session/import` sur sa propre instance, parents avant enfants.
4. **Finaliser la nouvelle session** par les API de métadonnées/instructions appropriées, puis vérifier le résultat.

Ces noms décrivent des fonctions à écrire dans notre plugin, pas de nouvelles méthodes déjà disponibles dans le SDK.

Le transport entre service et plugin sera privé, authentifié, lié à la bonne instance, révoqué au déchargement et limité à ces opérations. Aucun proxy HTTP arbitraire. Le mot de passe OpenCode reste dans son processus ; une capacité distincte protège le canal du plugin.

L’identification de l’instance doit tenir compte des processus OpenChamber concurrents, redémarrages et bases partagées. Un identifiant de session commun n’est pas une preuve d’identité du serveur. Ne pas deviner un port ni choisir automatiquement un autre OpenCode.

### Sens de « modification de session »

La modification prévue est celle de **la copie préparée pour restauration**, puis des métadonnées/instructions de la **nouvelle session**.

L’importeur officiel n’est pas un mécanisme d’écrasement : un identifiant existant est refusé. Ce plan ne prévoit donc ni édition destructive de la source, ni remplacement d’une session déjà existante. Une véritable édition en place constituerait une fonctionnalité distincte.

## 6. Import sûr et suivi des opérations

Deux entrées convergent vers le même pipeline :

- ZIP téléversé depuis le client, reconnu par un identifiant de staging ;
- chemin absolu d’un ZIP déjà présent sur le serveur sélectionné.

Étapes :

1. Ouvrir et vérifier le fichier local, puis en figer une copie privée ou une représentation stable pour éviter qu’un transfert externe encore en cours ne change le contenu pendant l’import.
2. Valider ZIP, schéma, sommes de contrôle et compatibilité ; refuser les archives chiffrées ou les formats non pris en charge.
3. Prévenir traversée de chemins, liens symboliques, collisions, doublons d’entrées et bombes de décompression ; imposer des limites documentées de ressources.
4. Préparer le profil et les correspondances d’identifiants/références sans toucher à l’instance.
5. Montrer la prévisualisation et obtenir la confirmation.
6. Restaurer les fichiers dans un nouveau dossier dédié, puis importer les nouvelles sessions dans l’ordre.
7. Restaurer pins/instructions, contrôler messages et fichiers, puis proposer **Ouvrir la session**.

Tester les véritables limites du corps de requête de l’importeur : un transport ZIP progressif n’implique pas que l’API native accepte une session de taille illimitée. Refuser clairement un cas non pris en charge, sans importer seulement le début d’une conversation.

Les jobs seront asynchrones avec identifiants, progression et annulation. Un journal privé permettra de distinguer étapes terminées, échecs et réponses incertaines.

L’import de plusieurs sessions n’est pas présumé transactionnel : si une erreur ou une annulation survient après des créations, afficher exactement les nouvelles sessions et fichiers déjà restaurés. Ne pas supprimer automatiquement ces sessions pour simuler un rollback. Une reprise contrôlée ne doit ni écraser ni dupliquer silencieusement des créations antérieures.

L’annulation peut nettoyer uniquement les temporaires appartenant à notre propre job ; jamais le ZIP fourni par chemin, les sources ou les fichiers préexistants.

## 7. Échanges intégrés et téléchargement natif

### Téléversement intégré

- Sélecteur de fichier côté appareil, sans accès automatique à ses configurations.
- Lecture par tranches et Base64, initialement autour de 32 Kio de données par requête pour rester sous la limite de 64 000 caractères.
- Accusés de réception, progression, contrôle de taille et d’intégrité, annulation et reprise contrôlée.
- Finalisation atomique du staging ; pas d’import automatique après un simple choix de fichier.
- Expliquer le surcoût Base64 et tester les grosses archives.

### Téléchargement natif Fichiers

- Produire un ZIP serveur et afficher son chemin, son dossier et son nom.
- Fournir **Copier le chemin** et l’accès à **Fichiers** lorsque le SDK le permet ; ne pas prétendre qu’il sait sélectionner automatiquement une ligne si cette API n’existe pas.
- Documenter le téléchargement natif, ainsi que l’utilisation d’un autre transport externe.

### Page compagnon

- Page fournie par le service, hors de la sandbox du panneau.
- Autorisation courte limitée à l’archive sélectionnée, usage contrôlé, révocation et absence de journalisation du ticket.
- Streaming, nom de fichier sûr, progression/erreurs, requêtes de plage lorsque possible.
- En local : loopback ; Desktop distant : tunnel natif du runtime sélectionné, sous réserve de capacité et de validation Electron.
- Android/web distant : seulement une URL privée explicitement configurée ; sinon Fichiers.
- Aucune nouvelle route Tailscale/reverse proxy, aucun port public et aucun composant client natif installé automatiquement.

## 8. Ordre de réalisation

### Lot 1 — Contrats natifs et garde-fous

Transformer les preuves temporaires en fixtures reproductibles du dépôt. Vérifier import de contexte compacté, pins, instructions, descendants, enregistrements interrompus et limites de taille ; fixer la matrice de versions. OpenCode 2.3.0 est la version éprouvée, pas une preuve de support universel des versions antérieures.

Définir la liaison d’instance et l’authentification avant toute fonction d’écriture. Les cas non fidèles doivent être exposés avant que l’interface promette une restauration complète.

### Lot 2 — Format, profils et taille

Ajouter schéma/lecteur compatible, assemblage déterministe des deux modes, inventaire des pins/fichiers, historique séparé et prévisualisation estimée/exacte. Conserver les tests de non-régression du mode Complet.

### Lot 3 — Plugin et import par chemin

Embarquer le plugin, sécuriser son canal, ajouter préparation/adaptation/import/finalisation et le pipeline ZIP sûr. Livrer d’abord un aller-retour fonctionnel en utilisant Fichiers ou un transfert externe.

### Lot 4 — Téléversement et page compagnon

Ajouter le sélecteur client, protocole de blocs et suivi des jobs, puis le téléchargement compagnon et sa détection de capacité. Conserver le parcours Fichiers/chemin partout.

### Lot 5 — Interface, packaging et validation

Finaliser le panneau mobile/desktop, les confirmations et erreurs. Aligner les manifests racine et `openchamber/`, embarquer le plugin et toutes ses dépendances nécessaires dans les fichiers construits, sans installation npm chez l’utilisateur. Mettre à jour README, historique et documentation de compatibilité.

## 9. Critères d’acceptation

- Aller-retour ZIP Complet et Instantané de reprise dans des instances isolées, sans appel à un modèle.
- Comparaison du contexte restauré avec le contexte effectif attendu : résumé, queue récente, pins et instructions.
- Historique ancien consultable mais absent du contexte actif, sans anciens outils/sous-agents dans cette option.
- Sources inchangées et restauration répétée sans écrasement de sessions ou fichiers.
- Import par chemin sans téléversement intégré, après un transfert externe.
- Upload et téléchargement vérifiés par empreinte ; maintien du parcours natif Fichiers.
- Rejet des ZIP corrompus/malveillants, des appels non autorisés, des tickets réutilisés/expirés et des mauvaises instances.
- Annulation, perte de connexion, redémarrage du service, reprise et échec partiel expliqués sans perte silencieuse.
- Gros fichiers/sessions testés dans les limites réelles du moteur, sans promesse de taille illimitée.
- Tests unitaires, navigateur, archive, mémoire/streaming et packaging ; CI Windows/Linux, macOS en non-régression.
- Validation réelle Desktop/Windows et Android distincte de l’émulation mobile. Toute combinaison non testée reste étiquetée comme telle.
- Aucune installation réelle, modification d’infrastructure, interruption de service ou publication sans accord séparé.
- Idiomatic English throughout the implementation and UI, explanatory comments for nontrivial code, and the required italic new-session notice visible on both import entry paths.
