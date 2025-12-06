#!/bin/bash

# Fix null to undefined for duration in formations
sed -i 's/duration: training\.duration,/duration: training.duration ?? undefined,/g' src/components/formations/ShortTrainingsReceivedList.tsx
sed -i 's/duration: training\.duration,/duration: training.duration ?? undefined,/g' src/components/formations/TrainingsGivenList.tsx  
sed -i 's/maxParticipants: training\.maxParticipants,/maxParticipants: training.maxParticipants ?? undefined,/g' src/components/formations/TrainingsGivenList.tsx

# Fix FormBuilder option.value to string  
sed -i 's/updateOption(field\.id, option\.value,/updateOption(field.id, String(option.value),/g' src/components/forms/FormBuilder.tsx
sed -i 's/removeOption(field\.id, option\.value)/removeOption(field.id, String(option.value))/g' src/components/forms/FormBuilder.tsx

# Fix FormShareManager Date to string
sed -i 's/expiresAt: expiresAt ? new Date(expiresAt) : undefined,/expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,/g' src/components/forms/FormShareManager.tsx

echo "Final fixes applied"
