#!/bin/bash
set -e

echo ""
echo "========================================"
echo "  Instalando EvalUA..."
echo "========================================"
echo ""

# Pedir API key de Anthropic
echo "Necesitas una API key de Anthropic (console.anthropic.com)"
read -p "Pega tu ANTHROPIC_API_KEY aquí: " ANTHROPIC_API_KEY

if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "Error: debes ingresar una API key."
  exit 1
fi

# 1. Instalar dependencias
echo ""
echo "▶ Instalando dependencias..."
npm install

# 2. Crear .env.local
echo "▶ Creando archivo de configuración..."
cat > .env.local << EOF
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="PmYJ/Z3LT68H0MuGGNJeLgHNmeY2lfNDkboY28qroSY="
NEXTAUTH_URL="http://localhost:3000"
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
EOF

# 3. Inicializar base de datos
echo "▶ Inicializando base de datos..."
npx prisma db push

echo ""
echo "========================================"
echo "  ¡Todo listo! Iniciando la app..."
echo "  Abre http://localhost:3000"
echo "========================================"
echo ""

# 4. Arrancar servidor
npm run dev
