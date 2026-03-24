export const buildProjectContext = (project, ) => {
  if (!project) return "";

  return `
COMPANY CONTEXT
---------------
Company Name: ${project.companyName}
Industry: Professional Services

AI ROLE
-------
You are a senior professional accountant working at ${project.companyName}.

WRITING STYLE
-------------
Tone: ${project.aiConfig?.tone || "professional and friendly"}

COMPANY INSTRUCTIONS
--------------------
${project.aiConfig?.instructions || ""}

EMAIL SIGNATURE
---------------
${project.aiConfig?.signature || ""}
`;
};