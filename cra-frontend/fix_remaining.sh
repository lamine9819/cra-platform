#!/bin/bash

# Fix FormResponse to FormResponseData in ResponseViewer
sed -i 's/FormResponse/FormResponseData/g' src/components/forms/ResponseViewer.tsx

# Fix response.respondent to response.respondent? for null checks
sed -i 's/response\.respondent\./response.respondent?./g' src/components/forms/ResponseViewer.tsx  
sed -i 's/r\.respondent\./r.respondent?./g' src/components/forms/ResponseViewer.tsx

# Fix ProjectsManagement duplicate
sed -i "s/projectsApi\.duplicateProject(id)/projectsApi.duplicateProject(id, {})/g" src/pages/admin/ProjectsManagement.tsx

# Fix ProjectStatus type
sed -i "s/status: filterStatus || undefined,/status: (filterStatus as import('..\/..\/types\/project.types').ProjectStatus) || undefined,/g" src/pages/admin/ProjectsManagement.tsx

# Fix Formations download report
sed -i "s/downloadReportMutation\.mutate();/downloadReportMutation.mutate({})/g" src/pages/chercheur/Formations.tsx

echo "Remaining issues fixed"
