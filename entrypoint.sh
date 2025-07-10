#!/bin/bash
set -e

echo "🚀 Démarrage de l'application Tellico de Thierry Val..."

# Attendre que MySQL soit prêt
echo "⏳ Attente de la disponibilité de MySQL..."
node wait-for-db.js

# Démarrer l'application
echo "🎯 Lancement de l'application NestJS..."
exec "$@"
