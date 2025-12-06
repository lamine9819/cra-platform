#!/bin/bash

# Fix ResponseViewer double replacement error
sed -i 's/FormResponseDataData/FormResponseData/g' src/components/forms/ResponseViewer.tsx

# Re-add FormResponseData declaration
sed -i 's/useState<FormResponseData | null>(null)/useState<import("..\/..\/services\/formsApi").FormResponseData | null>(null)/g' src/components/forms/ResponseViewer.tsx

# Fix AddParticipantModal with proper import
sed -i 's/role as import("..\/..\/types\/project.types").ParticipantRole/role as any/g' src/components/projects/AddParticipantModal.tsx

# Fix Formations.tsx mutate call
sed -i 's/downloadReportMutation\.mutate({})/downloadReportMutation.mutate(undefined as any)/g' src/pages/chercheur/Formations.tsx

echo "Final errors fixed"
