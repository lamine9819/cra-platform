#!/bin/bash

# Fix ActivityDocumentsSection handleDownload signature
grep -n "handleDownload" src/components/documents/contextual/ActivityDocumentsSection.tsx | head -5

# Fix DocumentLinkModal onUnlink signature  
grep -n "onUnlink" src/components/documents/DocumentLinkModal.tsx | head -5

# Fix EditMetadataModal setType
grep -n "setType" src/components/documents/modals/EditMetadataModal.tsx | head -5

# Fix useMessages sendMessage signature
grep -n "sendMessage" src/hooks/useMessages.ts | head -5

echo "Inspected last errors"
