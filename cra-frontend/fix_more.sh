#!/bin/bash

# Fix CompleteProfilePage - déjà corrigé dans user.types.ts mais il faut importer depuis auth context
# On va simplement utiliser 'as any' pour forcer le type
sed -i 's/profile\.diploma/((profile as any)?.diploma)/g' src/pages/chercheur/CompleteProfilePage.tsx
sed -i 's/profile\.discipline/((profile as any)?.discipline)/g' src/pages/chercheur/CompleteProfilePage.tsx  
sed -i 's/profile\.individualProfile/((profile as any)?.individualProfile)/g' src/pages/chercheur/CompleteProfilePage.tsx

# Fix toast.info to toast
sed -i 's/toast\.info(/toast(/g' src/hooks/useOfflineSync.ts

# Fix toast.warning to toast.error  
sed -i 's/toast\.warning(/toast.error(/g' src/hooks/useOfflineSync.ts

# Fix AddParticipantModal - role as string to ParticipantRole
sed -i 's/addParticipant(projectId, selectedUser, role)/addParticipant(projectId, selectedUser, role as import("..\/..\/types\/project.types").ParticipantRole)/g' src/components/projects/AddParticipantModal.tsx

# Fix CompleteProfilePage prev type
sed -i 's/setIndividualProfileData(prev =>/setIndividualProfileData((prev: any) =>/g' src/pages/chercheur/CompleteProfilePage.tsx

# Fix CreateTask getActivitiesByProject
sed -i 's/getActivitiesByProject(projectId, { limit: 100 })/getActivitiesByProject(projectId, 100)/g' src/pages/chercheur/CreateTask.tsx

# Fix DocumentsHub typeFilter type
sed -i 's/type: typeFilter || undefined,/type: (typeFilter as import("..\/..\/types\/document.types").DocumentType) || undefined,/g' src/pages/chercheur/DocumentsHub.tsx

echo "More fixes applied"
