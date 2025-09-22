# Maquettes d'interface - IPA Tasks Application

## 1. Vue principale Desktop (1920x1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🏥 IPA Tasks - Oncologie                                     👤 Dr. IPA ⚙️ │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ➕ Nouvelle tâche                                                        │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Discuter projet recherche avec Dr Martin urgent lundi           🔍 │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Filtres ─────────────────────────────────────────────────────────────┐ │
│ │ [📋 À faire] [⏳ En cours] [✅ Terminé]     [🔴 Urgent] [⚪ Normal]    │ │
│ │                                                                         │ │
│ │ [👤 Patient] [📋 Projet] [🏥 Admin] [👥 Équipe] [Tous]                │ │
│ │                                                                         │ │
│ │ Trier par: [📅 Échéance ▼] [🔍 Recherche: _______________]             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Tâches aujourd'hui (4) ─────────────────────────────────────────────┐ │
│ │ 🔴 👤 Contrôler ECBU Mme D. (2 actions)           [✅] [↗️]  Ven 22/09  │ │
│ │    ✅ Résultats vus → 📞 Appeler patient                               │ │
│ │    Patient: Mme D. • 2022458 • Urgent                                  │ │
│ │                                                                         │ │
│ │ ⚪ 📋 Discuter projet X avec Dr Y                  [✅] [↗️]  Lun 25/09  │ │
│ │    Projet: Amélioration protocole • Normal                             │ │
│ │                                                                         │ │
│ │ 🟡 🏥 Formation DPC (récurrent)                   [✅] [↗️]  30/09/2025  │ │
│ │    Administratif • Normal • Mensuel                                    │ │
│ │                                                                         │ │
│ │ ⚪ 👥 Rencontrer Dr Martin équipe onco             [✅] [↗️]  Mar 26/09  │ │
│ │    Équipe: Discussion cas complexes • Normal                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Tâches à venir (6) ─────────────────────────────────────────────────┐ │
│ │ ⚪ 👤 Programmer scanner Mme P. 2023145            [✅] [↗️]  Mar 26/09  │ │
│ │ ⚪ 👥 Appel famille M. R. - effets secondaires     [✅] [↗️]  Mer 27/09  │ │
│ │ 🔴 📋 Révision protocole chimiothérapie           [✅] [↗️]  Jeu 28/09  │ │
│ │ ⚪ 👤 Suivi toxicité cutanée Mme B. 2024056       [✅] [↗️]  Ven 29/09  │ │
│ │ ⚪ 🏥 Formation continue - thérapies ciblées       [✅] [↗️]  02/10/2025 │ │
│ │ 🟡 🏥 Audit qualité soins (récurrent)             [✅] [↗️]  05/10/2025 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ 📊 10 actives • 2 urgentes • 18 complétées • 📡 Synchronisé il y a 1 min   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Interface mobile (375x812 - iPhone)

```
┌─────────────────────────────────┐
│ ≡ IPA Tasks           🔔 👤     │
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ➕ Nouvelle tâche           │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ Saisie rapide...      🎙│ │ │
│ │ └─────────────────────────┘ │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Filtres ─────────────────────┐ │
│ │ [📋][⏳][✅]  [🔴][⚪]       │ │
│ │ [👤][📋][🏥][👥][Tous]      │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ Aujourd'hui (4) ─────────────┐ │
│ │ 🔴 👤 ECBU Mme D. (2)  [✅][↗️]│ │
│ │    ✅ Vus → 📞 Appeler        │ │
│ │    Urgent • Ven 22            │ │
│ │                               │ │
│ │ ⚪ 📋 Projet X Dr Y     [✅][↗️]│ │
│ │    Protocole • Lun 25         │ │
│ │                               │ │
│ │ 🟡 🏥 Formation DPC    [✅][↗️]│ │
│ │    Mensuel • 30/09            │ │
│ │                               │ │
│ │ ⚪ 👥 Dr Martin onco    [✅][↗️]│ │
│ │    Cas complexes • Mar 26     │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─ À venir (6) ─────────────────┐ │
│ │ ⚪ 👤 Scanner Mme P.    [✅][↗️]│ │
│ │ ⚪ 👥 Appel famille     [✅][↗️]│ │
│ │ 🔴 📋 Révision proto   [✅][↗️]│ │
│ │                       ...plus │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📋] [📅] [⚙️] [📊] [👤]        │
└─────────────────────────────────┘
```

## 3. Interface de configuration - Catégories et Actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Retour    ⚙️ Paramètres - Personnalisation                            ✕  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─── Catégories de tâches ──────────────────────────────────────────────────┐ │
│ │ 👤 Patient                    [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │    Couleur: 🔵 Bleu • Icône: 👤 • Par défaut                           │ │
│ │                                                                         │ │
│ │ 📋 Projet                     [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │    Couleur: 🟢 Vert • Icône: 📋 • Par défaut                           │ │
│ │                                                                         │ │
│ │ 🏥 Administratif              [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │    Couleur: 🟡 Jaune • Icône: 🏥 • Par défaut                          │ │
│ │                                                                         │ │
│ │ 👥 Équipe                     [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │    Couleur: 🟣 Violet • Icône: 👥 • Par défaut                         │ │
│ │                                                                         │ │
│ │ ➕ [Ajouter nouvelle catégorie]                                         │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Actions disponibles ───────────────────────────────────────────────────┐ │
│ │ APPELER                       [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ CONTROLER                     [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ PROGRAMMER                    [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ REGARDER                      [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ DISCUTER                      [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ RENCONTRER                    [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │ ORGANISER                     [✏️ Modifier] [🗑️ Supprimer]              │ │
│ │                                                                         │ │
│ │ ➕ [Ajouter nouvelle action]                                            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [💾 Enregistrer] [❌ Annuler]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Interface de création de tâches récurrentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Retour    Créer tâche récurrente                                      ✕  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─── Informations de base ──────────────────────────────────────────────────┐ │
│ │ Titre : [Formation DPC mensuelle                                     ] │ │
│ │                                                                         │ │
│ │ Catégorie : [🏥 Administratif ▼]                                        │ │
│ │                                                                         │ │
│ │ Action : [ORGANISER ▼]                                                  │ │
│ │                                                                         │ │
│ │ Contexte : [Formation continue obligatoire                           ] │ │
│ │                                                                         │ │
│ │ Priorité : ● Normal  ○ Urgent                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Configuration de la récurrence ────────────────────────────────────────┐ │
│ │ 🔄 Fréquence :                                                          │ │
│ │ ○ Quotidienne                                                           │ │
│ │ ○ Hebdomadaire → [Lundi ▼] [Mardi ▼] [Mercredi ▼]                     │ │
│ │ ● Mensuelle → [Le 1er ▼] du mois                                       │ │
│ │                                                                         │ │
│ │ 📅 Période :                                                            │ │
│ │ Début : [01/10/2025] [🕐 09:00]                                        │ │
│ │                                                                         │ │
│ │ Fin : ○ Jamais                                                          │ │
│ │      ● Après [12] occurrences                                          │ │
│ │      ○ Jusqu'au [01/10/2026]                                           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Aperçu des prochaines occurrences ────────────────────────────────────┐ │
│ │ 📅 01/10/2025 - Formation DPC mensuelle                                │ │
│ │ 📅 01/11/2025 - Formation DPC mensuelle                                │ │
│ │ 📅 01/12/2025 - Formation DPC mensuelle                                │ │
│ │ 📅 01/01/2026 - Formation DPC mensuelle                                │ │
│ │ ... et 8 autres occurrences                                            │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [💾 Créer récurrence] [❌ Annuler]             │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ← Retour    Contrôler ECBU Mme D. (2022458)                            ✕  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 📋 Historique des actions :                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ ✅ 22/09/2025 10:30 - REGARDER résultats ECBU                          │ │
│ │    💬 Germe E.coli résistant, changement antibio amoxicilline→cipro    │ │
│ │    📝 Contexte: ECBU prescrit suite infection urinaire                 │ │
│ │                                                           [✏️ Modifier] │ │
│ │                                                                         │ │
│ │ 📞 25/09/2025 À FAIRE - APPELER patiente                               │ │
│ │    💬 Suivi post-changement antibiotique                               │ │
│ │    📝 Contexte: Vérifier tolérance cipro + évolution symptômes         │ │
│ │    ⏰ Échéance: Vendredi 25/09 14:00                                   │ │
│ │                                                           [✏️ Modifier] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ➕ Ajouter une nouvelle action :                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Saisie rapide:                                                          │ │
│ │ ┌─────────────────────────────────────────────────────────────────────┐ │ │
│ │ │ Programmer ECBU contrôle dans 1 semaine                            │ │ │
│ │ └─────────────────────────────────────────────────────────────────────┘ │ │
│ │                                                                         │ │
│ │ OU remplissage manuel :                                                 │ │
│ │ Action: [PROGRAMMER ▼] Contexte: [ECBU contrôle                    ] │ │
│ │ Échéance: [📅 02/10/2025] [🕐 09:00] Priorité: ○ Normal ● Urgent    │ │
│ │ Notes: [Contrôle efficacité traitement antibiotique                ] │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─── Actions rapides ──────────────────────────────────────────────────────┐ │
│ │ [📞 Appeler maintenant] [✅ Marquer action terminée] [📅 Reporter]        │ │
│ │ [📋 Dupliquer tâche] [🗑️ Supprimer tâche complète]                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                              [💾 Enregistrer] [❌ Annuler]                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 4. Interface mobile - Évolution de tâche

```
┌─────────────────────────────────┐
│ ← ECBU Mme D. (2022458)      ✕ │
├─────────────────────────────────┤
│                                 │
│ 📋 Historique (2 actions)       │
│ ┌─────────────────────────────┐ │
│ │ ✅ 22/09 10:30              │ │
│ │ REGARDER résultats ECBU     │ │
│ │ 💬 E.coli résistant         │ │
│ │ Changement antibio          │ │
│ │                        [✏️] │ │
│ │                             │ │
│ │ 📞 25/09 À FAIRE            │ │
│ │ APPELER patiente            │ │
│ │ 💬 Suivi post-antibio       │ │
│ │ ⏰ Ven 25/09 14:00          │ │
│ │                        [✏️] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ➕ Nouvelle action              │
│ ┌─────────────────────────────┐ │
│ │ Saisie rapide:              │ │
│ │ ┌─────────────────────────┐ │ │
│ │ │ ECBU contrôle 1 semaine │ │ │
│ │ └─────────────────────────┘ │ │
│ │                             │ │
│ │ 📅 [02/10] 🔴 [Normal]      │ │
│ │ 💬 [Notes...]               │ │
│ └─────────────────────────────┘ │
│                                 │
│ [📞 Appeler] [✅ Fait] [📅 +]   │
│                                 │
│ [💾 Sauver] [❌ Annuler]        │
└─────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│ Nouvelle tâche                                           ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Saisie rapide:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Appeler Mme D. 2022458 résultat ECBU urgent vendredi   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✨ Parsing automatique détecté:                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📋 Action: Appeler                                      │ │
│ │ 👤 Patient: Mme D. (2022458)                           │ │
│ │ 📄 Contexte: résultat ECBU                             │ │
│ │ 🔴 Priorité: Urgent                                    │ │
│ │ 📅 Échéance: Vendredi 22/09/2025                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Ajustements (optionnel) ───────────────────────────────┐ │
│ │ Titre: [Appeler Mme D. - résultat ECBU               ] │ │
│ │                                                         │ │
│ │ Priorité: ○ Normal  ●️ Urgent                            │ │
│ │                                                         │ │
│ │ Échéance: [📅 22/09/2025] [🕐 Toute la journée]        │ │
│ │                                                         │ │
│ │ Notes: [Notes supplémentaires...]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                              [Annuler] [💾 Enregistrer]    │
└─────────────────────────────────────────────────────────────┘
```

## 7. Modal de création de tâche (Parsing intelligent avec catégories)

```
┌─────────────────────────────────────────────────────────────┐
│ Nouvelle tâche                                           ✕  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Saisie rapide:                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Discuter projet recherche avec Dr Martin urgent lundi  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ✨ Parsing automatique détecté:                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📂 Catégorie: 👥 Équipe                                 │ │
│ │ 📋 Action: DISCUTER                                     │ │
│ │ 👤 Personne: Dr Martin                                  │ │
│ │ 📄 Contexte: projet recherche                          │ │
│ │ 🔴 Priorité: Urgent                                    │ │
│ │ 📅 Échéance: Lundi 25/09/2025                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Ajustements (optionnel) ───────────────────────────────┐ │
│ │ Titre: [Discuter projet recherche - Dr Martin        ] │ │
│ │                                                         │ │
│ │ Catégorie: [👥 Équipe ▼]                                │ │
│ │                                                         │ │
│ │ Priorité: ○ Normal  ●️ Urgent                            │ │
│ │                                                         │ │
│ │ Échéance: [📅 25/09/2025] [🕐 Toute la journée]        │ │
│ │                                                         │ │
│ │ Notes: [Discussion nouvelles pistes thérapeutiques...] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                              [Annuler] [💾 Enregistrer]    │
└─────────────────────────────────────────────────────────────┘
```

## 6. Interface de notifications Push

```
┌─────────────────────────────────────────────────────────────┐
│ 🔔 IPA Tasks                                           14:30 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🔴 Tâche urgente en retard !                               │
│                                                             │
│ Appeler Mme D. - résultat ECBU                             │
│ Échéance: Hier (21/09)                                     │
│                                                             │
│ [📱 Appeler maintenant] [⏰ Reporter] [✅ Terminé]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 📋 Résumé quotidien - IPA Tasks                       08:00 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Bonjour ! Voici vos tâches pour aujourd'hui :              │
│                                                             │
│ 🔴 2 tâches urgentes                                        │
│ 📋 3 tâches normales                                        │
│ ⏰ 1 échéance dépassée                                      │
│                                                             │
│ [📱 Ouvrir l'app] [❌ Désactiver]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 7. Vue Statistiques et Historique

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📊 Statistiques & Historique                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─── Cette semaine ────────────────────┐ ┌─── Performance ─────────────────┐ │
│ │ ✅ Tâches complétées: 15             │ │ ⏱️ Temps moyen: 2.3h            │ │
│ │ 📋 Tâches créées: 18                 │ │ 🎯 Taux completion: 94%         │ │
│ │ 🔴 Tâches urgentes: 3                │ │ ⚠️ En retard: 1                 │ │
│ │ 📅 Échéances respectées: 96%         │ │ 📈 Productivité: +12%           │ │
│ └─────────────────────────────────────┘ └─────────────────────────────────┘ │
│                                                                             │
│ ┌─── Historique récent ──────────────────────────────────────────────────┐ │
│ │ 📅 22/09 15:30 ✅ APPELER Mme D. - résultat ECBU terminé               │ │
│ │ 📅 22/09 14:15 📋 CONTROLER bilan fer M. L. créé                       │ │
│ │ 📅 21/09 16:45 ✅ PROGRAMMER scanner Mme P. terminé                     │ │
│ │ 📅 21/09 11:30 📋 Formation toxicité cutanée créé                       │ │
│ │ 📅 20/09 09:15 ✅ APPELER famille M. R. terminé                        │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [📥 Exporter données] [🗑️ Nettoyer ancien historique]                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8. Installation PWA et mode hors ligne

```
┌─────────────────────────────────────────────────────────────┐
│ 📱 Installer IPA Tasks                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🏥 IPA Tasks peut être installée sur votre appareil        │
│                                                             │
│ ✅ Accès direct depuis l'écran d'accueil                   │
│ ✅ Fonctionne hors ligne                                   │
│ ✅ Notifications push                                       │
│ ✅ Performance optimisée                                   │
│                                                             │
│ [📱 Installer maintenant] [❌ Plus tard]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 🟡 Mode hors ligne                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Vous êtes actuellement hors ligne.                         │
│ Vos modifications seront synchronisées                     │
│ dès la reconnexion.                                        │
│                                                             │
│ 📝 2 tâches en attente de synchronisation                  │
│                                                             │
│ [🔄 Réessayer maintenant] [ℹ️ Plus d'infos]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 9. États d'erreur et feedback

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Parsing impossible                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Le texte saisi ne peut pas être analysé automatiquement:   │
│                                                             │
│ "sdfsdf sdf sdf random text"                                │
│                                                             │
│ Voulez-vous:                                                │
│ [📝 Saisir manuellement] [🔄 Réessayer] [❌ Annuler]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ ✅ Tâche créée avec succès !                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ "Appeler Mme D. - résultat ECBU" ajoutée                   │
│ Échéance: Vendredi 22/09 • Priorité: Urgent               │
│                                                             │
│ [👀 Voir la tâche] [➕ Ajouter autre] [❌ Fermer]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Ces maquettes illustrent une interface intuitive optimisée pour votre flux de travail en oncologie, avec un focus sur la rapidité d'utilisation, l'évolution des tâches dans le temps, et la clarté des informations patient anonymisées.

**Points clés des maquettes :**
- **Saisie ultra-rapide** avec feedback visuel du parsing
- **Tâches évolutives** avec historique d'actions détaillé  
- **Installation PWA native** pour un accès app-like
- **Fonctionnement hors ligne** avec synchronisation transparente
- **Codes couleur médicaux** (rouge=urgent, blanc=normal, vert=terminé)
- **Information patient sécurisée** (initiales + numéro anonymisé)
- **Interface responsive** desktop/mobile avec UX cohérente
- **Notifications contextuelles** adaptées au milieu médical

L'interface d'évolution de tâche permet de suivre le continuum de soins (exemple : ECBU → résultats → changement antibio → rappel patient) dans une seule entité logique, reflétant fidèlement votre workflow clinique réel.

Souhaitez-vous que je précise certains aspects de l'interface ou que nous passions à la phase de développement technique ?