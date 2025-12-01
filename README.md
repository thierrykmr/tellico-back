# tellico-back

[![Node](https://img.shields.io/badge/Node-%3E=%2018-brightgreen)]()
[![Type](https://img.shields.io/badge/type-Backend%20API-blue)]()
[![Docker](https://img.shields.io/badge/docker-ready-lightgrey)]()
[![Licence](https://img.shields.io/badge/licence-%C3%A0%20pr%C3%A9ciser-lightgrey)]()

L'application Tellico est un application de e-commerce plus que traditionnnelle, il fera appel à l'IA pour ameliorer l'experience utilisateur et les ventes.
Tellico-back : Backend de l'application Tellico — API TypeScript (structure modulaire) prête pour le développement local et le déploiement Docker. Ce README a été mis à jour pour inclure une documentation des endpoints REST courants, déduits de la structure du projet (modules présents : auth, user, product, productImage, cart, cart_item, invoice, complaint, supportRequest, history).

Table des matières
- [Aperçu rapide](#aper%C3%A7u-rapide)
- [Prérequis & installation](#pr%C3%A9requis--installation)
- [Configuration](#configuration)
- [Exécution](#ex%C3%A9cution)
- [Endpoints API (documentés)](#endpoints-api-document%C3%A9s)
  - [Authentification (auth)](#authentification-auth)
  - [Utilisateurs (user)](#utilisateurs-user)
  - [Produits (product)](#produits-product)
  - [Images produit (productImage)](#images-produit-productimage)
  - [Panier (cart) & lignes de panier (cart_item)](#panier-cart--lignes-de-panier-cart_item)
  - [Factures (invoice)](#factures-invoice)
  - [Réclamations / Support (complaint / supportRequest)](#r%C3%A9clamations--support-complaint--supportrequest)
  - [Historique (history)](#historique-history)
  - [Autres endpoints utiles](#autres-endpoints-utiles)
- [Tests & qualité](#tests--qualit%C3%A9)
- [Structure du projet](#structure-du-projet)
- [Fichiers importants](#fichiers-importants)
- [Licence & contact](#licence--contact)

Aperçu rapide
-------
Le projet expose une API REST organisée par modules. Les routes ci-dessous sont des chemins et méthodes prédictifs basés sur la nomenclature des modules trouvés. Vérifie les contrôleurs réels dans `src/module/*` pour confirmer les chemins exacts et les paramètres.

Prérequis & installation
------------------------
- Node.js v18+ recommandé
- npm (ou yarn)
- Docker & docker-compose (si nécessaire)
- Git

Installation locale :
```bash
git clone https://github.com/thierrykmr/tellico-back.git
cd tellico-back
npm install
cp .env.example .env   # modifier les valeurs
npm run start:dev
```

Configuration
-------------
- Un fichier `.env.example` est présent ; copie-le en `.env` et adapte les variables (DB, JWT secret, ports, etc.).
- Consulte `ENVIRONMENT.md` pour la documentation détaillée des variables.

Exécution
---------
- En développement :
  - npm run start:dev
- En production :
  - npm run build
  - npm run start:prod
- Avec Docker :
  - docker-compose up --build

Endpoints API (documentés)
--------------------------
Note : J'ai listé ci-dessous des endpoints standard attendus pour chaque module. Confirme les noms exacts et paramètres dans les fichiers contrôleurs (`src/module/.../controller*.ts`) si besoin.

Authentification (auth)
- POST /auth/register
  - Description : création d'un compte utilisateur.
  - Body (exemple) : { "email": "user@example.com", "password": "pass", "name":"..." }
  - Réponse : utilisateur créé (sans password) ou token selon implémentation.
- POST /auth/login
  - Description : connexion, retourne un JWT.
  - Body : { "email": "user@example.com", "password": "pass" }
  - Réponse : { "accessToken": "..." }
- POST /auth/refresh
  - Description : rafraîchissement de token (si supporté).
- POST /auth/logout
  - Description : invalidation du token/refresh (si implémenté).

Utilisateurs (user)
- GET /users
  - Description : liste des utilisateurs (admin).
  - Query params : pagination, filtres éventuels.
- GET /users/:id
  - Description : récupérer un utilisateur par id.
- POST /users
  - Description : créer un utilisateur (si non géré via /auth/register).
- PUT /users/:id
  - Description : mise à jour d'un utilisateur.
- DELETE /users/:id
  - Description : suppression d'un utilisateur.
- GET /users/me
  - Description : info du profil de l'utilisateur authentifié (Bearer token requis).

Produits (product)
- GET /products
  - Description : liste des produits.
  - Query params : page, limit, q, category, sort.
- GET /products/:id
  - Description : détail d'un produit.
- POST /products
  - Description : création de produit (admin).
  - Body : { name, description, price, stock, ... }
- PUT /products/:id
  - Description : mise à jour produit (admin).
- DELETE /products/:id
  - Description : suppression produit (admin).

Images produit (productImage)
- POST /products/:productId/images
  - Description : upload d'une image pour un produit.
  - Body : form-data (file).
- GET /products/:productId/images
  - Description : lister images d'un produit.
- DELETE /products/:productId/images/:imageId
  - Description : supprimer une image.

Panier (cart) & lignes de panier (cart_item)
- GET /carts/:userId
  - Description : récupérer le panier de l'utilisateur.
- POST /carts
  - Description : créer un panier (ou l'ajouter à la session).
  - Body : { userId, ... }
- POST /carts/:cartId/items
  - Description : ajouter un item au panier.
  - Body : { productId, quantity }
- PUT /carts/:cartId/items/:itemId
  - Description : modifier la quantité d'un item.
- DELETE /carts/:cartId/items/:itemId
  - Description : retirer un item.
- POST /carts/:cartId/checkout
  - Description : valider le panier -> création de facture/commande (selon implémentation).

Factures (invoice)
- GET /invoices
  - Description : liste des factures (admin / utilisateur restreint).
- GET /invoices/:id
  - Description : récupérer une facture.
- POST /invoices
  - Description : créer une facture (généralement suite au checkout).
- GET /invoices/:id/pdf
  - Description : télécharger la facture en PDF (si générée).

Réclamations / Support (complaint / supportRequest)
- GET /complaints
  - Description : lister réclamations (admin).
- POST /complaints
  - Description : soumettre une réclamation.
  - Body : { userId, orderId?, message, category }
- GET /support-requests
  - Description : lister demandes de support.
- POST /support-requests
  - Description : créer une demande de support.
  - Body : { userId, subject, message }

Historique (history)
- GET /history/:userId
  - Description : historique des actions/achats de l'utilisateur.
- POST /history
  - Description : enregistrer un événement dans l'historique (interne).

Autres endpoints utiles
- GET /health ou GET /healthz
  - Description : endpoint de santé (utilisé par orchestrateurs).
- GET /metrics
  - Description : métriques applicatives (si exposées).
- Documentation API (si présente) :
  - GET /docs ou GET /swagger (vérifier si Swagger / OpenAPI est configuré).

Exemples d'appel (avec JWT Bearer)
- Récupérer produits :
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/products"
```
- Ajouter au panier :
```bash
curl -X POST -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" \
  -d '{"productId":"abc","quantity":2}' "http://localhost:3000/carts/123/items"
```

Tests & qualité
---------------
- Les configurations ESLint/Prettier sont présentes (`eslint.config.mjs`, `.prettierrc`).
- Lancer la suite de tests (si définie) :
```bash
npm run test
```

Structure du projet
-------------------
- src/
  - module/
    - auth/
    - user/
    - product/
    - productImage/
    - cart/
    - cart_item/
    - invoice/
    - complaint/
    - supportRequest/
    - history/
- test/
- Dockerfile, docker-compose.yml, .env.example, ENVIRONMENT.md

Fichiers importants
-------------------
- `.env.example` — exemple de variables d'environnement
- `ENVIRONMENT.md` — documentation détaillée des variables d'environnement
- `Dockerfile`, `docker-compose.yml` — conteneurisation
- `entrypoint.sh`, `wait-for-db.js` — scripts d'initialisation
- `package.json` — scripts et dépendances
- `eslint.config.mjs`, `.prettierrc` — configuration qualité

Licence & contact
-----------------
- Auteur : Thierry — @thierrykmr

Remarque importante
------------------
Les chemins et méthodes ci-dessus sont des conventions courantes proposées à partir des modules présents dans le code. Pour les valeurs, paramètres exacts, validations et noms de routes réellement exposés, consulter les fichiers contrôleurs dans `src/module/*` (fichiers `*.controller.ts` ou fichiers exportant les routes).
