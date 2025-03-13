# Blog API

Cette API de blog est développée en Go et utilise le framework [Fiber](https://gofiber.io/) pour gérer les requêtes HTTP. Elle offre des endpoints pour gérer des articles, commentaires, favoris, followers et likes.

## Structure du projet

- **blog-api/db**  
  Ce package s'occupe de l'initialisation et de la gestion de la connexion à la base de données.  
  Il expose par exemple la variable `db.DB` qui est utilisée pour exécuter des requêtes SQL dans les handlers.

- **blog-api/handlers**  
  Ce package regroupe toutes les fonctions qui gèrent les endpoints de l'API.  
  Chaque fonction correspond à une opération CRUD (Create, Read, Update, Delete) sur une ressource (articles, commentaires, etc.).

## Imports et leur utilisation

- **log**  
  Package standard de Go utilisé pour la journalisation.  
  Il permet d'enregistrer les erreurs et informations importantes dans la console.

- **os**  
  Utilisé pour accéder aux variables d'environnement (comme le port d'écoute) et autres informations système.

- **github.com/gofiber/fiber/v2**  
  Le framework web principal qui gère la création du serveur HTTP, la définition des routes, et la manipulation des requêtes/réponses.

- **github.com/gofiber/fiber/v2/middleware/cors**  
  Middleware permettant de configurer et activer les CORS (Cross-Origin Resource Sharing).  
  Cela autorise les requêtes provenant de différentes origines (utile pour le développement et l'accès via des clients variés).

- **github.com/joho/godotenv**  
  Ce package permet de charger les variables d'environnement à partir d'un fichier `.env`.  
  Cela facilite la configuration de l'application (par exemple, pour les informations de connexion à la base de données).

## Fonctionnement général

1. **Chargement de la configuration :**  
   Grâce à `godotenv`, le fichier `.env` est lu pour configurer l'environnement (notamment le port d'écoute et les variables de connexion à la base de données).

2. **Initialisation de la base de données :**  
   La fonction `db.Init()` du package `blog-api/db` est appelée pour établir la connexion à la base de données.

3. **Création du serveur Fiber :**  
   Une nouvelle instance de Fiber est créée.  
   Le middleware CORS est configuré pour autoriser toutes les origines et certains headers.

4. **Définition des routes API :**  
   Un groupe de routes est créé avec le préfixe `/api` et subdivisé en endpoints pour articles, commentaires, favoris, followers et likes.  
   Chaque route est associée à une fonction dans le package `handlers` qui traite la requête et interagit avec la base de données.

5. **Démarrage du serveur :**  
   Le serveur est lancé et écoute sur le port défini dans la variable d'environnement `PORT` (par défaut `4000` si non spécifié).

## Lancement de l'application

Pour lancer l'API, exécutez simplement la commande suivante depuis le répertoire racine du projet :

```bash
go run main.go
