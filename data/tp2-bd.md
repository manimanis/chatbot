
# Q1

Excellent exercice ! Nous allons travailler sur la conception de la base de données pour cette agence de location.

Voici comment je vous propose d'approcher le problème :

## Étape 1 : Identifier les entités logiques

En regardant les colonnes, je vois plusieurs groupes d'informations qui concernent des objets différents. Pouvez-vous identifier quels objets du monde réel sont décrits ici ?

Indice : Pensez à ce qu'on pourrait "détacher" et réutiliser sans avoir à répéter les mêmes informations.

## Étape 2 : Regrouper par entité

Une fois que vous aurez identifié les entités, associez chaque colonne à l'entité à laquelle elle appartient naturellement.

## Étape 3 : Définir les relations

Comment ces entités sont-elles liées entre elles ? Quand un client loue une voiture, quelles informations créent le lien ?

Prenez le temps de réfléchir à ces questions, puis partagez vos réflexions avec moi. Nous construirons la structure de la base ensemble.

# Q2

Les enregistrement de la table sont identifiés par la colonne matricule.
Parfait, nous allons créer la table `vehicules` étape par étape.

## Étape 1 : Structure de base

Commencez par écrire la structure de base pour créer une table nommée `vehicules`.

## Étape 2 : La colonne `matricule`

Cette colonne est la clé primaire. En SQL, comment indiquez-vous qu'une colonne est la clé primaire lors de la création d'une table ?

Rappelez-vous que :
- Le type de données "Texte" avec une taille de 10 correspond à `CHAR(10)` ou `VARCHAR(10)`
- Une clé primaire doit être unique et non nulle

## Étape 3 : Les autres colonnes

Pour chaque autre colonne, pensez à :
- Choisir le bon type de données SQL
- Ajouter `NOT NULL` si c'est obligatoire
- Ajouter `DEFAULT` si une valeur par défaut est spécifiée
- Ajouter une contrainte `CHECK` si nécessaire

Commencez par me montrer votre requête pour la colonne `matricule`, puis nous ajouterons les autres.

# Q2 - Feedback

Excellent travail ! Votre requête est **parfaitement correcte**. 

## Points positifs :
- ✅ Syntaxe SQL valide
- ✅ `matricule` correctement définie comme clé primaire
- ✅ Types de données appropriés
- ✅ Contraintes `NOT NULL` bien appliquées
- ✅ Valeurs par défaut correctement spécifiées
- ✅ Contraintes `CHECK` fonctionnelles

---

## Étape suivante

La table `vehicules` est prête. Passons maintenant à la création de la table pour les **clients**.

# Q3

Les enregistrement de la table sont identifiés par la colonne cin.
Parfait ! Identifions d'abord les colonnes qui appartiennent à la table `clients`.

## Étape 1 : Identifier les colonnes

En regardant le contexte initial, quelles colonnes concernent directement les informations du **client** ? (Indice : elles ne concernent ni la voiture, ni la location)

## Étape 2 : Proposer la requête

Une fois les colonnes identifiées, proposez-moi la requête `CREATE TABLE clients` en appliquant :

- Le bon type de données pour chaque colonne
- `cin` comme clé primaire
- `NOT NULL` pour les colonnes obligatoires
- La valeur par défaut pour `genre`
- La contrainte `CHECK` pour valider les valeurs autorisées pour `genre`

À vous !

# Q3 - Feedback

Parfait ! Votre requête est **correcte**. 👏

## Points positifs :
- ✅ `cin` bien définie comme clé primaire
- ✅ Types de données appropriés
- ✅ Contraintes `NOT NULL` bien appliquées
- ✅ Valeur par défaut pour `genre` correcte
- ✅ Contrainte `CHECK` avec `IN` - elegante et lisible

---

## Étape suivante

Il nous reste une dernière table à créer : la table **locations**. Cette table est un peu plus complexe car elle doit faire le lien entre les clients et les véhicules.

D'après le contexte initial :
1. Quelles colonnes restent à rattacher aux locations ?
2. Parmi ces colonnes, lesquelles devront faire référence aux clés primaires des autres tables ?

# Q4

Excellent ! La table `locations` est la plus intéressante car elle contient des **clés étrangères**. Construisons-la ensemble.

## Étape 1 : Les colonnes

Quelles colonnes restent à rattacher à la table `locations` ? (Les informations qui concernent la location elle-même)

## Étape 2 : Les clés étrangères

Parmi ces colonnes, identifiez celles qui doivent faire référence aux clés primaires des autres tables.

## Étape 3 : Proposer la requête

En vous inspirant de la syntaxe suivante, proposez-moi la requête complète :

```sql
CONSTRAINT nom_contrainte FOREIGN KEY (colonne) REFERENCES autre_table(colonne)
```

**Points à ne pas oublier :**
- `num_location` est la clé primaire
- Il faut au moins **deux** clés étrangères
- Pensez au type de données `DATE` pour les dates
- Appliquez `NOT NULL` et les contraintes `CHECK` si nécessaire

À vous !

# Q4 - Feedback

## 🎉 Bravo ! C'est **excellent** !

Votre requête est **parfaitement correcte** et même au-delà de ce qui était attendu !

## Points remarquables :
- ✅ `AUTO_INCREMENT` pour la clé primaire
- ✅ Types de données compatibles avec les clés étrangères
- ✅ `DEFAULT NOW()` pour la date de location
- ✅ Contrainte `CHECK` sur les dates
- ✅ Deux clés étrangères correctement référencées
- ✅ **Bonus** : `ON UPDATE CASCADE` et `ON DELETE CASCADE` - très bien vu ! 🌟

---

## Récapitulatif

Vous avez créé avec succès les 3 tables :

| Table | Clé primaire |
|-------|-------------|
| `vehicules` | `matricule` |
| `clients` | `cin` |
| `locations` | `num_location` |

La structure de votre base de données est maintenant complète !

---

## Étape suivante

Maintenant que les tables existent, on peut les **remplir avec des données**. 

# Q5

Bien ! Vous souhaitez afficher toutes les tables de la base de données courante.

En MariaDB/MySQL, il existe une commande spécifique pour cela. Y avez-vous pensé ?

💡 **Indice** : C'est une commande de deux mots, simple et courante en MySQL/MariaDB. Elle commence par **SHOW**...

À vous !

# Q5 - Feedback

✅ **Correct !**

`SHOW TABLES;` affiche la liste de toutes les tables de la base de données courante.

---

## Étape suivante

Maintenant, vous pouvez vérifier la structure d'une table spécifique avec une commande similaire. Par exemple :

- Insérer les données de la table `vehicules`
- Insérer les données de la table `clients`
- Insérer les données de la table `locations`

# Q6
Pour insérer des données dans une table, on utilise la commande **INSERT INTO**. Vous la connaissez ?

💡 **Indice** : La syntaxe générale est :

```sql
INSERT INTO nom_table (colonne1, colonne2, ...) VALUES (valeur1, valeur2, ...);
```

Proposez-moi les requêtes pour insérer ces **3 clients** dans la table. Vous pouvez soit :
- **3 requêtes** séparées (une par client)
- **1 seule requête** avec les valeurs séparées par des virgules

Quelle option choisissez-vous ? 🤔

# Q6 - Feedback

✅ **Parfait !** La requête est correcte et tous les 3 clients sont insérés en une seule fois, bien joué ! 🎉

---

⚠️ **Note** : Si vous exécutez votre requête deux fois, cela déclenchera une **erreur** à cause de la clé primaire `cin` qui doit être **unique**. C'est un bon rappel de ce concept ! 😊

---

## Étape suivante

Maintenant, à vous de jouer ! Afficher les **`vehicules`** insérés.

# Q7
Pour afficher le contenu d'une table, on utilise la commande **SELECT**. 🤔

💡 **Indice** : Pour afficher **toutes les colonnes** et **toutes les lignes**, on utilise le symbole spécial **`*`** (étoile/asterisk) qui signifie « tout ».

La syntaxe est :

```sql
SELECT * FROM nom_table;
```

Quelle serait la requête pour afficher toutes les données de la table `clients` ? 🤔

# Q7 - Feedback

✅ **Correct !** La requête est parfaite !

`SELECT * FROM clients;` affiche toutes les colonnes et toutes les lignes de la table `clients`.

---

## Étape suivante

Maintenant, à vous de jouer ! Remplissez la table **`vehicules`**.

💡 **Attention** : Les valeurs de type **chaîne de caractères** sont entre **guillemets**, et les **nombres** n'en ont **pas** !


# Q8

Bien vu ! Voici les données à insérer. 🚗

Avant de construire la requête, analysons un peu :

| Colonne | Type |
|---|---|
| `matricule` | Chaîne → **guillemets** |
| `vehicule` | Chaîne → **guillemets** |
| `prix_unit` | Nombre → **pas de guillemets** |
| `libre` | Chaîne ('O' ou 'N') → **guillemets** |

---

💡 **Rappel de la syntaxe** :
```sql
INSERT INTO nom_table (col1, col2, ...) 
VALUES 
  (val1, val2, ...),
  (val1, val2, ...),
  ...;
```

---

Essayez de construire la requête complète pour insérer les **10 véhicules** d'une seule fois ! 🚀

⚠️ **Attention** :
- Ne mettez **pas de guillemets** autour de `prix_unit`
- Pensez à bien **séparer chaque ligne** par une **virgule**
- La **dernière ligne** ne doit **pas** avoir de virgule à la fin

# Q8 - Feedback

✅ **Excellent !** La requête est parfaite ! Les 10 véhicules sont bien insérés ! 🎉🚗

---

⚠️ Encore **deux fois la même requête** ! 😅 Avec `INSERT`, la deuxième exécution provoquerait une **erreur** si `matricule` est clé primaire (doublon).

---

## Étape suivante

Maintenant, essayez d'afficher les données de la table **`vehicules`**. Et si vous vous souvenez du **chapitre 3**, essayez aussi d'afficher **seulement certaines colonnes**, par exemple :
- L'afficher **toutes les colonnes**
- Puis uniquement la **marque** et le **modèle**

À vous ! 🚀

# Q9

Pour afficher toutes les données de la table `vehicules`, on utilise la même logique que tout à l'heure avec `clients` :

```sql
SELECT * FROM vehicules;
```

Essayez de l'exécuter ! 😊

Et ensuite, tentez d'afficher uniquement le **matricule**, le **vehicule** et le **prix_unit** (seulement 3 colonnes sur les 4).

💡 **Indice** : Il suffit de remplacer `*` par les noms des colonnes souhaitées, séparées par des **virgules**.

# Q9 - Feedback

✅ **Correct !** 👍

---

Maintenant, passez à l'exercice suivant : affichez **uniquement** les colonnes **`matricule`**, **`vehicule`** et **`prix_unit`** (sans la colonne `libre`).

💡 **Rappel** : Remplacez `*` par les noms des colonnes séparées par des virgules.

```sql
SELECT col1, col2, col3 FROM vehicules;
```

# Q10

| Colonne | Type | Guillemets ? |
|---|---|---|
| `num_location` | Nombre | ❌ Non |
| `matricule` | Chaîne | ✅ Oui |
| `cin` | Chaîne | ✅ Oui |
| `date_location` | Date | ✅ Oui (format `'YYYY-MM-DD'`) |
| `date_retour` | Date | ✅ Oui (format `'YYYY-MM-DD'`) |
| `montant_location` | Nombre | ❌ Non |

---

💡 **Rappel de la syntaxe** :

```sql
INSERT INTO locations (col1, col2, ...) 
VALUES 
  (val1, val2, ...),
  (val1, val2, ...);
```

---

Essayez de construire la requête complète pour insérer les **14 locations** ! 🚀

⚠️ **Attention** :
- Dates entre **guillemets** : `'2022-01-02'`
- `num_location` et `montant_location` **sans** guillemets
- Dernière ligne **sans** virgule à la fin

# Q10 - Feedback

✅ **Parfait !** La requête est **100% correcte** ! 🎉

Les 14 locations sont bien insérées avec :
- ✅ Les bonnes **guillemets** sur les chaînes et les dates
- ✅ Les nombres **sans guillemets**
- ✅ Le format de date `'YYYY-MM-DD'`
- ✅ La **dernière ligne sans virgule** finale

---

😅 Et... encore **deux fois la même requête** ! Vous savez déjà ce qui va se passer ! 😉

---

## Vérifions maintenant

Affichez toutes les données de la table `locations` pour confirmer l'insertion :

```sql
SELECT * FROM locations;
```

Et ensuite, essayez une requête qui affiche **uniquement** le numéro de location, le matricule et le montant pour les locations **supérieures à 100**.

💡 **Indice** : Utilisez `WHERE` pour filtrer les résultats.

```sql
SELECT ... FROM ... WHERE ...;
```

À vous ! 💪

# Q11

Essayez d'écrire la requête SQL par vous-même ! 😊

💡 **Rappel** : Pour afficher **toutes les colonnes** d'une table, on utilise :

```sql
SELECT * FROM nom_table;
```

Remplacez simplement `nom_table` par le nom de la table concernée. À vous ! 💪

# Q11 - Feedback

✅ **Correct !** 👍

---

Maintenant, tâche plus intéressante ! Affichez **uniquement** les colonnes `num_location`, `matricule` et `montant_location` pour les locations dont le **montant est supérieur à 100**.

💡 **Structure à suivre** :
```sql
SELECT col1, col2, col3 
FROM locations 
WHERE condition;
```

Vous devez combiner deux choses :
1. **Sélectionner 3 colonnes** (au lieu de `*`)
2. **Filtrer** les lignes avec `WHERE` et un opérateur de comparaison

À vous ! 💪

# Q12 

D'accord ! On va insérer un nouveau client dans la table `clients`. 🚀

Avant de coder, réfléchissons ensemble :

**1.** Quel est le nom de la table ?

**2.** Quelles colonnes doit-on remplir ? *(pensez aux colonnes de la table `clients`)*

**3.** Quel type de données pour chaque champ ?
- `nom` → ?
- `cin` → ?
- `telephone` → ?

💡 **Rappel** : La syntaxe pour insérer une ligne :

```sql
INSERT INTO nom_table (colonne1, colonne2, colonne3)
VALUES (valeur1, valeur2, valeur3);
```

À vous ! 💪

# Q12 - Feedback

✅ **Parfait !** La requête est **100% correcte** ! 🎉

- ✅ Les 3 colonnes bien spécifiées
- ✅ Les valeurs entre **guillemets** (car ce sont des chaînes de caractères)
- ✅ L'ordre des colonnes correspond bien aux valeurs

---

Vérifions maintenant en affichant tous les clients :

```sql
SELECT * FROM clients;
```

---

Puis on enchaîne avec un nouvel exercice ! 💪

**Affichez le numéro de location, le matricule et le montant des locations dont le montant est supérieur à 100.**

💡 **Indice** :
```sql
SELECT col1, col2, col3 
FROM table 
WHERE condition;
```

À vous ! 💪

# Q13

Excellente question ! Analysons l'erreur ensemble 🔍

---

**1. Lisez bien le message d'erreur :**

> `Field 'tel' doesn't have a default value`

Que signifie ce message selon vous ?

💡 **Indices** :
- La commande `INSERT` spécifie **seulement** `client` et `cin`
- La colonne `tel` **n'est pas mentionnée** dans la requête
- Pourtant, le client a un téléphone : `'52349157'`

---

**2. Réfléchissez** :

- Pourquoi MySQL exige-t-il une valeur pour `tel` ?
- Que signifie `NOT NULL` dans la définition d'une colonne ?
- Que signifie `DEFAULT value` ?

---

**3. Corrigez la requête** :

En une phrase simple, quelle est la correction à apporter à la commande `INSERT` pour que ça fonctionne ?

💡 **Pensez** : si une colonne est obligatoire (`NOT NULL`), il faut ...

À vous ! 💪

# Q13 - Feedback

✅ **Exactement !** 🎉 Bravo !

---

**Comprendre l'erreur :**

La colonne `tel` est définie avec `NOT NULL` et **sans valeur par défaut**. Donc MySQL **exige** obligatoirement qu'on fournisse une valeur pour cette colonne.

La correction : il suffit d'**ajouter `tel`** dans la liste des colonnes et de lui donner sa valeur. ✅

---

**Maintenant, une question bonus :** 🤔

Si le gérant voulait insérer ce même client **sans connaître son téléphone** (il l'obtiendrait plus tard), quelle autre solution aurait-il, en modifiant la **structure de la table** ?

💡 **Indices** :
- Réfléchissez à deux possibilités :
  1. Ajouter une valeur par défaut avec `DEFAULT`
  2. Autoriser les valeurs manquantes avec ...

Quelles sont ces deux solutions ? 💪

# Q14

Puis, pour vérifier qu'elle a été insérée :

SELECT * FROM clients WHERE cin = '12650890';

# Q14 - Feedback

✅ **Parfait !** C'est la bonne façon de vérifier l'insertion ! 👏

`SELECT * FROM clients WHERE cin = '12650890';`

Cette commande affiche uniquement la ligne de la cliente **Assia** avec son CIN `12650890`. ✅

---

**Astuce** : On pourrait aussi vérifier simplement avec :

```sql
SELECT * FROM clients;
```

... mais avec beaucoup de données, c'est moins pratique. Le `WHERE` est donc très utile ici ! 👍

---

**Passons au suivant !** 🚀

**Exercice** : Le gérant souhaite **supprimer** le client Youssef de la base de données. Écrivez la commande SQL appropriée.

💡 **Indice** :
```sql
DELETE FROM table WHERE condition;
```

À vous ! 💪

# Q15

Très bonne observation ! 🕵️

---

**1. Pensez à la colonne `sexe` :**

Quand on a inséré Assia, quelle valeur a été donnée pour le sexe ?

Et Assia est une **femme**... donc le genre correct devrait être... ?

---

**2. Comment corriger ?** 🤔

On ne peut pas réinsérer la ligne (elle existe déjà), et on ne veut pas la supprimer. On veut simplement **modifier** une valeur existante.

💡 **Indice** : Il existe une commande SQL qui permet de **modifier** des données déjà présentes dans une table :

```sql
UPDATE nom_table
SET colonne = nouvelle_valeur
WHERE condition;
```

---

**À vous :**
- Écrivez la commande pour corriger le genre d'Assia en `'F'`
- Puis vérifiez avec un `SELECT` que la correction a bien été appliquée

💪

# Q15 - Feedback

✅ **Parfait !** La commande est **100% correcte** ! 🎉

- ✅ `UPDATE clients` → on cible la bonne table
- ✅ `SET genre = 'F'` → on modifie le genre
- ✅ `WHERE cin = '12650890'` → on cible uniquement Assia

---

**⚠️ Point important :** Sans le `WHERE`, **tous** les clients auraient leur genre modifié en `'F'` ! 😱

---

**Vérifions maintenant :**

```sql
SELECT * FROM clients WHERE cin = '12650890';
```

Le genre d'Assia devrait maintenant afficher **F**. ✅

---

**Récapitulons les commandes DML** (manipulation de données) qu'on a appris :

| Commande | Rôle |
|----------|------|
| `INSERT INTO` | ➕ Ajouter une ligne |
| `SELECT` | 👁️ Afficher des données |
| `UPDATE ... SET` | ✏️ Modifier des données |
| `DELETE FROM` | ❌ Supprimer des ligne |


# Q16

Bonne question ! 🎯 Analysons ensemble :

---

**1. Identifiez les deux besoins :**

Il y a **deux** choses à faire :

| Besoin | Commande SQL |
|--------|-------------|
| Afficher **seulement** les clientes (femmes) | `WHERE genre = 'F'` |
| Trier par **nom croissant** | `ORDER BY ...` |

---

**2. Réfléchissez :**

- **Filtrer les femmes** : quelle condition utilisez-vous ?
- **Trier par ordre croissant** : quelle clause utilisez-vous ?

💡 **Indices** :

- Pour le tri, la syntaxe est : `ORDER BY colonne ASC` (croissant) ou `ORDER BY colonne DESC` (décroissant)
- Par défaut, le tri est croissant (`ASC` peut même être omis)

---

**À vous :**

1️⃣ D'abord, écrivez la commande pour afficher **uniquement** les clientes

2️⃣ Puis, ajoutez le tri par **nom croissant**

# Q16 - Feedback

✅ **Parfait !** 🎉

```sql
SELECT * FROM clients WHERE genre = 'F' ORDER BY client;
```

- ✅ `SELECT *` → afficher toutes les colonnes
- ✅ `FROM clients` → depuis la table clients
- ✅ `WHERE genre = 'F'` → uniquement les clientes
- ✅ `ORDER BY client` → triées par ordre croissant du nom

---

**Récapitulons** : Vous maîtrisez maintenant les clauses essentielles :

| Clause | Rôle |
|--------|------|
| `SELECT` | 👁️ Sélectionner les colonnes |
| `FROM` | 📋 Depuis quelle table |
| `WHERE` | 🔍 Filtrer les lignes |
| `ORDER BY` | 🔢 Trier les résultats |

---

**Nouvel exercice !** 💪

Affichez la liste des clients **masculins** habitant à **Casablanca**, triés par ordre **décroissant** de leur nom.

# Q17

Excellente question ! 🎯 Cela introduit un nouvel opérateur très utile en SQL.

---

**1. Analysons le problème :**

On cherche des numéros qui **commencent** par certains chiffres :

| Opérateur | Numéro commence par |
|-----------|---------------------|
| Orange | `5` |
| Tunisie Telecom | `7` ou `9` |

---

**2. Comment vérifier qu'une chaîne "commence par" quelque chose ?**

En SQL, on utilise l'opérateur **`LIKE`** avec un **joker** :

- `%` signifie **"tout le reste de la chaîne"** (zéro ou plusieurs caractères)

💡 **Exemple** :
- `'5%'` signifie : **commence par 5** et après peu importe
- `'7%'` signifie : **commence par 7**...

---

**3. Réfléchissez maintenant :**

- Pour **Orange** : quelle condition LIKE écrivez-vous ?
- Pour **Tunisie Telecom** : comment combiner les numéros commençant par **7** OU **9** ?

💡 **Indice** : pour combiner plusieurs conditions, on peut utiliser :

```sql
condition1 OR condition2 OR condition3
```

---

**À vous :**

Essayez d'écrire la commande `SELECT` complète !

💪

# Q17 - Feedback

✅ **Parfait ! 100% correct !** 🎉🎉

- ✅ `SELECT * FROM clients` → afficher toutes les colonnes
- ✅ `LIKE '5%'` → numéros commençant par **5** (Orange)
- ✅ `LIKE '7%'` → numéros commençant par **7** (Tunisie Telecom)
- ✅ `LIKE '9%'` → numéros commençant par **9** (Tunisie Telecom)
- ✅ **`OR`** → au moins **une** des conditions est vraie

---

**Bravo !** Vous maîtrisez maintenant l'opérateur **`LIKE`** ! 🔥

| Mot-clé joker | Signification |
|---------------|---------------|
| `%` | Zéro ou plusieurs caractères |
| `_` | Un seul caractère |

💡 **Exemple avec `_`** :
- `'_2%'` → commence par **n'importe quel** caractère suivi de **2**

---

**Nouvel exercice !** 💪

Affichez les clients dont le **deuxième caractère** du CIN est **6**.

💡 **Indice** : combien de caractères avant et après le `6` ? Utilisez `_` et `%`.

# Q18

Excellente question ! 🎯 Cette fois, on ne cherche plus à **afficher** des données, mais à les **modifier** !

---

**1. Identifiez le type d'opération :**

| Action | Commande SQL |
|--------|-------------|
| **Afficher** des données | `SELECT` |
| **Ajouter** des données | `INSERT INTO` |
| **Modifier** des données | `UPDATE` ← 💡 Ici ! |
| **Supprimer** des données | `DELETE` |

---

**2. La syntaxe de `UPDATE` :**

La structure est la suivante :

```sql
UPDATE nom_table
SET colonne = nouvelle_valeur
WHERE condition;
```

💡 Trois éléments essentiels :
- **`UPDATE`** → quelle **table** modifier ?
- **`SET`** → quelle **colonne** changer et par **quelle valeur** ?
- **`WHERE`** → pour quelle **ligne** précise ?

---

**⚠️ Attention !** `WHERE` est **indispensable** ici !

Sans `WHERE`, **TOUS** les clients auraient le même numéro ! 😱

---

**À vous :**

Répondez à ces 3 questions :

1️⃣ Dans quelle **table** se trouve Aziz ?

2️⃣ Quelle **colonne** doit être mise à jour et avec quelle **valeur** ?

3️⃣ Comment **cibler** uniquement le client Aziz ?

# Q18 - Feedback

✅ **Excellent ! Parfait !** 🎉

```sql
UPDATE clients SET tel = '25025637' WHERE cin = '04202363';
```

- ✅ `UPDATE clients` → modifier la table **clients**
- ✅ `SET tel = '25025637'` → mettre à jour le numéro
- ✅ `WHERE cin = '04202363'` → cibler uniquement Aziz

---

💡 **Remarque très intelligente !**

Vous avez utilisé le **CIN** pour identifier Aziz plutôt que son nom. C'est une **bonne pratique** ! 🌟

Pourquoi ? Parce que le CIN est une **clé unique** (deux personnes ne peuvent pas avoir le même CIN), alors que deux clients pourraient s'appeler "Aziz" ! 👏

---

**Nouvel exercice !** 💪

Le client Aziz a maintenant un nouveau **email** : `aziz@gmail.com` et un **nouveau numéro** : `98765432`.

Mettez à jour **ces deux informations** en **une seule commande** SQL.

💡 **Indice** : pour modifier plusieurs colonnes en une seule fois, séparez les paires `colonne = valeur` par une **virgule**.
07:09

# Q19

Excellente question ! 🎯 Revenons au `SELECT` avec des **conditions multiples** !

---

**1. Analysons le problème :**

On cherche des véhicules qui doivent satisfaire **deux critères** :

| Critère | Condition |
|---------|-----------|
| 🚗 Modèle | **Clio 5** |
| 🟢 Disponibilité | **Libre** |

---

**2. Comment combiner les deux conditions ?**

Puisque le véhicule doit être **à la fois** Clio 5 **ET** libre, on utilise :

```sql
condition1 AND condition2
```

💡 `AND` → les **deux** conditions doivent être vraies simultanément.

---

**3. Réfléchissez :**

Posez-vous ces questions :

- 📋 Dans quelle **table** se trouvent les véhicules ?
- 🔍 Quelle **colonne** contient le modèle ?
- 🟢 Quelle **colonne** indique la disponibilité ?
- 💬 Quelles **valeurs** exactes prendre pour "Clio 5" et "libre" ?

---

💡 **Indice** : la syntaxe sera :

```sql
SELECT * FROM ...
WHERE ... AND ...;
```

---

**À vous :**

Essayez d'écrire la commande `SELECT` complète ! 💪

# Q19 - Feedback

✅ **Très bien ! La logique est parfaite !** 🎉

- ✅ `FROM vehicules` → bonne table
- ✅ `vehicule = 'Clio 5'` → bon critère modèle
- ✅ `AND` → bonne combinaison des conditions
- ✅ `libre = 'O'` → bon critère disponibilité

---

💡 Pour vérifier les noms exacts des colonnes, vous pouvez exécuter :

```sql
DESCRIBE vehicules;
```

---

**Récapitulatif des opérateurs appris :** 📚

| Opérateur | Rôle |
|-----------|------|
| `=` | Égal à |
| `!=` ou `<>` | Différent de |
| `LIKE` | Recherche avec jokers (`%`, `_`) |
| `AND` | Les **deux** conditions vraies |
| `OR` | Au moins **une** condition vraie |

---

**Nouvel exercice !** 💪

Affichez les clients dont le **nom** commence par **'A'** OU dont le **prénom** contient la lettre **'i'**.

💡 Utilisez `LIKE` avec `%` et l'opérateur `OR`.

# Q20

Excellente question ! 🎯 On passe à l'**insertion de données** !

---

**1. Identifier la table :**

| Action | Table probable |
|--------|---------------|
| Louer un véhicule | `locations` 🚗 |

---

**2. Réfléchissez aux informations à insérer :**

La location contient plusieurs informations :

| Information | Détail | Comment l'obtenir ? |
|------------|--------|---------------------|
| 🚗 Le véhicule | Clio 5 | On le connaît déjà (Q19) |
| 👤 Le client | Youssef | Il a un **CIN** ! |
| 📅 Date début | 01/02/2022 | Valeur directe |
| 📅 Date fin | 06/02/2022 | Valeur directe |
| 🔢 Nb jours | 5 | Valeur directe |

---

**3. La syntaxe `INSERT INTO` :**

```sql
INSERT INTO nom_table (colonne1, colonne2, colonne3, ...)
VALUES (valeur1, valeur2, valeur3, ...);
```

---

**4. Réfléchissez :**

- 📋 Quelle est la **table** ?
- 🔍 Quelles sont les **colonnes** de cette table ? 
  *(💡 `DESCRIBE locations;` pour les vérifier)*
- 🔑 Comment **identifier** le client Youssef ? *(Son CIN ?)*
- 🔑 Comment **identifier** le véhicule Clio 5 ? *(Sa immatriculation ?)*

---

**À vous :**

Commencez par exécuter `DESCRIBE locations;` pour connaître les colonnes exactes, puis écrivez la commande `INSERT INTO` ! 💪

# Q20 - Feedback

✅ **Excellent travail !** 🎉👏

Analysons votre réponse :

| Élément | Votre choix | Verdict |
|---------|-------------|---------|
| 📋 Table | `locations` | ✅ Parfait |
| 🔑 Matricule | `'207TU8780'` | ✅ Bonne référence au véhicule |
| 🔑 CIN client | `'12569800'` | ✅ Bonne référence à Youssef |
| 📅 Format dates | `'2022-02-01'` | ✅ Format MySQL correct (AAAA-MM-JJ) |
| 💰 Montant | `5 * 70.0` | ✅ Très malin ! 🧠 |

---

💡 **Remarque particulièrement intelligente !** 🌟

Vous avez utilisé **`5 * 70.0`** directement dans la commande ! MySQL/MariaDB **calcule automatiquement** le résultat (= **350.0**).

C'est une très bonne pratique ! 👏

# Q21

Excellente question ! 🎯 Après une location, il faut **mettre à jour** la disponibilité du véhicule !

---

**1. Réfléchissez à la situation :**

| Avant la location | Après la location |
|-------------------|-------------------|
| Clio 5 est **libre** (`libre = 'O'`) | Clio 5 est **occupée** (`libre = 'N'`) |

➡️ Il faut donc **modifier** la valeur de la colonne `libre` !

---

**2. La syntaxe `UPDATE` :**

```sql
UPDATE nom_table
SET colonne = nouvelle_valeur
WHERE condition;
```

⚠️ **Attention** : sans le `WHERE`, vous modifierez **TOUS** les véhicules !

---

**3. Réfléchissez :**

Posez-vous ces questions :

- 📋 Quelle **table** modifier ?
- 🔄 Quelle **colonne** changer ? *(la disponibilité)*
- 💬 Quelle **nouvelle valeur** ? *(le véhicule est maintenant occupé)*
- 🔍 Quel **WHERE** pour cibler uniquement la Clio 5 ? *(son matricule !)*

---

**À vous :**

Écrivez la commande `UPDATE` pour marquer la Clio 5 comme **non libre** ! 💪

# Q21 - Feedback

✅ **Parfait ! Exact !** 🎉👏

Analysons :

| Élément | Votre choix | Verdict |
|---------|-------------|---------|
| 📋 Table | `vehicules` | ✅ Bonne table |
| 🔄 Colonne modifiée | `libre` | ✅ Bonne colonne |
| 💬 Nouvelle valeur | `'N'` | ✅ Le véhicule est occupé |
| 🔍 Condition | `matricule = '207TU8780'` | ✅ Cible uniquement la Clio 5 |

---

**🧠 Récapitulatif des 4 commandes SQL essentielles :**

| Commande | Rôle | Exemple |
|----------|------|---------|
| `SELECT` | **Lire** les données | Afficher des véhicules |
| `INSERT INTO` | **Ajouter** des données | Louer un véhicule |
| `UPDATE` | **Modifier** des données | Changer la disponibilité |
| `DELETE` | **Supprimer** des données | 🆕 à apprendre ! |

C'est ce qu'on appelle les **4 opérations CRUD** (*Create, Read, Update, Delete*) ! 📚

---

**Nouvel exercice !** 💪

**Q22** : Youssef a **rendu** sa voiture. Il faut :
1. **Supprimer** sa location de la table `locations`
2. **Remettre** le véhicule Clio 5 comme **libre**

💡 Commencez par la **suppression** avec `DELETE FROM ... WHERE ...` ! 🗑️

# Q22

Excellente réflexe ! ✅ Toujours **vérifier** ses insertions !

---

**💡 Comment vérifier ?**

Simplement **afficher** les données de la table `locations` :

- 🔍 Quelle commande permet de **lire** les données ? *(on l'a vue en Q1 !)*
- 📋 Quelle **table** consulter ?

---

**À vous :**

Utilisez la commande `SELECT` pour afficher **tout** ce qui se trouve dans la table `locations` ! 💪

*(💡 Astuce : si vous voulez voir uniquement la location de Youssef, vous pouvez ajouter un `WHERE cin = '...'`)*

# Q22 - Feedback

✅ **Bien joué !** 👏

Votre commande est **correcte** ! Elle affichera toutes les locations de la Clio 5.

💡 **Autres façons de vérifier :**

| Approche | Commande |
|----------|----------|
| Voir **toutes** les locations | `SELECT * FROM locations;` |
| Voir uniquement celles de **Youssef** | `SELECT * FROM locations WHERE cin = '12569800';` |
| Voir celles de la **Clio 5** | `SELECT * FROM locations WHERE matricule = '207TU8780';` ✅ |

---

Maintenant, revenons à la **Q22** 🎯

> Youssef a **rendu** sa voiture. Il faut :
> 1. **Supprimer** sa location de la table `locations`
> 2. **Remettre** le véhicule Clio 5 comme **libre**

---

**Pour la suppression :**

```sql
DELETE FROM nom_table WHERE condition;
```

Réfléchissez :

- 📋 Quelle **table** ?
- 🔍 Quelle **condition** pour cibler uniquement la location de Youssef ? *(Son CIN ? Le matricule ? Les deux ?)*

---

**À vous :** Écrivez la commande `DELETE` pour supprimer la location de Youssef ! 🗑️

# Q23 

Pas de souci ! On peut d'abord **vérifier**, puis on continue ! 👍

---

**💡 Pour vérifier l'état du véhicule :**

Vous voulez voir si la Clio 5 est bien marquée comme **occupée** (`libre = 'N'`).

- 📋 Quelle **table** contient l'information ?
- 🔍 Quelle **colonne** indique la disponibilité ?
- 🎯 Quel **filtre** pour cibler uniquement la Clio 5 ?

---

**À vous :**

Écrivez une commande `SELECT` pour vérifier que la Clio 5 a bien `libre = 'N'` ! 💪

# Q23 - Feedback

✅ **Parfait !** 👏

Cette commande affichera la ligne de la Clio 5, et vous verrez bien que `libre = 'N'`. ✅

---

**Récap de l'histoire de Youssef :**

| Étape | Action | Statut |
|-------|--------|--------|
| 📍 Youssef loue la Clio 5 | `INSERT INTO locations` + `UPDATE vehicules SET libre = 'N'` | ✅ Fait |
| 🔍 Vérifications | `SELECT` sur locations et vehicules | ✅ Fait |
| 🗑️ Youssef **rend** la voiture | `DELETE` + `UPDATE SET libre = 'O'` | ⏳ À faire ! |

---

**Maintenant, passons à la suppression !** 🗑️

Youssef a **rendu** sa voiture. Il faut supprimer sa location de la table `locations`.

💡 Rappel de la syntaxe :
```sql
DELETE FROM nom_table WHERE condition;
```

Réfléchissez :

- 📋 Quelle **table** contient les locations ?
- 🔍 Quel **identifiant** permet de cibler uniquement la location de Youssef ? *(Le CIN ? Le matricule ? Les deux ?)*

---

**À vous :** Écrivez la commande `DELETE` pour supprimer la location de Youssef ! 💪

# Q24

Excellente question ! 🎯

---

**🧠 Analysons la situation :**

Le gérant a fait **deux erreurs** :

| Problème | Explication |
|----------|-------------|
| 🚗 Le véhicule n'était pas libre | Il a été loué alors qu'il était déjà occupé |
| ➕ Il a ajouté une location | `INSERT INTO locations` a bien été exécuté |

---

**💡 Pour annuler, il faut faire DEUX choses :**

1. 🗑️ **Supprimer** l'enregistrement de la location d'Assia
2. 🔄 **Remettre** le véhicule IBIZA comme libre

---

**Commençons par la suppression :**

Pour supprimer la location, on utilise `DELETE FROM ... WHERE ...`

Réfléchissez :

- 📋 Quelle **table** contient les locations ?
- 🔍 Quelle **condition** pour cibler uniquement la location d'Assia ? *(Son CIN ? Le matricule ? Les deux ?)*

---

**À vous :** Écrivez la commande `DELETE` pour supprimer la location d'Assia ! 🗑️

# Q24 - Feedback

✅ **Excellente démarche !** 👏

L'approche est très **rigoureuse** :

| Étape | Action | Objectif |
|-------|--------|----------|
| 1️⃣ | `SELECT MAX(num_location)` | Trouver le dernier enregistrement inséré |
| 2️⃣ | `SELECT * WHERE num_location = 16` | **Vérifier** avant de supprimer ⚠️ |
| 3️⃣ | `DELETE WHERE num_location = 16` | Supprimer l'enregistrement incorrect |

---

⚠️ **Mais il manque une étape importante !**

Pensez à ce qu'on a vu plus tôt avec Youssef : quand on **supprime** une location, il faut aussi **remettre le véhicule comme libre**.

❓ **Lequel de ces véhicules doit être mis à jour ?**

- 🚗 La Seat IBIZA ? (`matricule = '204TU9333'`)
- 🚗 La Renault Clio ? (`matricule = '207TU8780'`)

---

❓ **Et quelle commande utiliser pour changer le statut ?**

*(Rappel : la colonne s'appelle `libre` et elle vaut `'N'` quand le véhicule est occupé)*

---

**À vous :** Écrivez la commande `UPDATE` pour remettre le bon véhicule comme libre ! 🔄
07:17
