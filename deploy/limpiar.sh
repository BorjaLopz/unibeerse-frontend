#!/usr/bin/env bash
# Borra del repo lo que ya no se usa tras el rediseño. Ejecutar UNA vez desde la raíz del repo, ANTES de descomprimir
# la fase 2 (así no se borra nada nuevo):  bash deploy/limpiar.sh
# Es reversible: todo sigue en el historial de git.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

git rm -r -q --ignore-unmatch \
  src \
  .eslintrc.cjs postcss.config.js tailwind.config.js vite.config.js package-lock.json \
  .netlify \
  public/BeerImages public/BeerIcons public/icons \
  public/_redirects public/index.html \
  public/cerveza_1.jpg public/cerveza_2.png public/cerveza_3.jpg \
  public/CountryCodes.json public/CrossWindowIcon.svg public/arrow.svg public/editBeerIcon.svg \
  public/mainIcon.svg public/reportIssueIcon.svg public/reportIssueIcon_1.svg public/unibeerse-icon.svg \
  public/redes.json public/styles.json public/favicon.svg

echo "Listo. Se conserva public/beer-data.json (lo usa migration/to-sql.mjs) y public/img/."
