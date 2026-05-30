# Inertia.js Form Architecture Rules
- Always use the native Inertia `useForm` hook for form state and validation handling.
- Do not create independent local React `useState` hooks for tracking standard input data, `error`, `success`, or `isSubmitting` tracking variables.
- Pass error feedback down through the stateless `<FormField error={errors.field} />` component layout.
- Process backend validation strictly via standard Laravel web routes using `$request->validate()`. Never generate standalone API controllers or Axios fetch configurations for basic form submittals.