# Création du projet Nuxt 3
npx nuxi init social-recipe

# Se déplacer dans le dossier du projet
cd social-recipe

# Installation des dépendances principales
npm install @nuxtjs/supabase @pinia/nuxt @pinia-plugin-persistedstate/nuxt @nuxtui/nuxt lucide-vue-next @vueuse/core

# Installation des dépendances de développement
npm install -D @nuxtjs/tailwindcss @nuxtjs/color-mode typescript @types/node vitest @vue/test-utils cypress

# Configuration de Capacitor
npm install @capacitor/core @capacitor/cli
npx cap init social-recipe com.social-recipe.app --web-dir=dist
npm install @capacitor/ios @capacitor/android

# Création de la structure des dossiers
mkdir -p components/{layout,recipe,community,shared}
mkdir -p composables
mkdir -p stores
mkdir -p types
mkdir -p utils
mkdir -p assets/{css,images}
mkdir -p public

# Création des fichiers de configuration
cat > nuxt.config.ts << EOL
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtui/nuxt'
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: ''
  },
  supabase: {
    redirect: false
  },
  typescript: {
    strict: true
  }
})
EOL

# Configuration de Tailwind
cat > tailwind.config.ts << EOL
import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
        accent: '#FFE66D',
        'neutral-900': '#2C2C2C',
        'neutral-700': '#4A4A4A',
        'neutral-500': '#717171',
        'neutral-300': '#E0E0E0',
        'neutral-100': '#F5F5F5'
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
        accent: ['Playfair Display', 'serif']
      }
    }
  },
  plugins: [],
} satisfies Config
EOL

# Configuration VSCode
cat > .vscode/settings.json << EOL
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "volar.takeOverMode.enabled": true
}
EOL

# Création du fichier principal de style
cat > assets/css/main.css << EOL
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #FF6B6B;
  --secondary: #4ECDC4;
  --accent: #FFE66D;
}

body {
  @apply font-primary text-neutral-900;
}

h1, h2, h3, h4, h5, h6 {
  @apply font-accent;
}
EOL

# Initialisation de Git
git init
cat > .gitignore << EOL
node_modules
.nuxt
dist
.env
.env.*
!.env.example
.DS_Store
EOL

# Création du README
cat > README.md << EOL
# Social Recipe

Application sociale de partage de recettes construite avec Nuxt 3, Supabase et Capacitor.

## Configuration requise

- Node.js 16+
- npm ou yarn
- IDE recommandé : Visual Studio Code

## Installation

\`\`\`bash
npm install
\`\`\`

## Développement

\`\`\`bash
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Tests

\`\`\`bash
npm run test
npm run test:e2e
\`\`\`
EOL

# Installation des extensions VSCode recommandées
cat > .vscode/extensions.json << EOL
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "bradlc.vscode-tailwindcss",
    "supabase.supabase-vscode",
    "rangav.vscode-thunder-client",
    "lokalise.i18n-ally"
  ]
}
EOL

# Commit initial
git add .
git commit -m "Initial commit: Project setup"