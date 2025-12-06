#!/bin/bash

# Fix CONTRAT types
sed -i "s/type: 'CONTRAT'/type: 'CONTRAT' as import('..\/..\/types\/document.types').DocumentType/g" src/components/activities/ActivityPartnerships.tsx
sed -i "s/type: 'CONTRAT'/type: 'CONTRAT' as import('..\/..\/types\/document.types').DocumentType/g" src/components/projects/ProjectFunding.tsx
sed -i "s/type: 'CONTRAT'/type: 'CONTRAT' as import('..\/..\/types\/document.types').DocumentType/g" src/components/projects/ProjectPartnerships.tsx

# Fix RAPPORT types
sed -i "s/type: 'RAPPORT'/type: 'RAPPORT' as import('..\/..\/types\/document.types').DocumentType/g" src/pages/chercheur/CreateActivity.tsx
sed -i "s/type: 'RAPPORT'/type: 'RAPPORT' as import('..\/..\/types\/document.types').DocumentType/g" src/pages/chercheur/CreateProject.tsx

echo "Types fixed"
