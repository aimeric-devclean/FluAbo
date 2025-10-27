export const translateAuthError = (error: any): string => {
  const errorMessage = error?.message || '';
  const errorCode = error?.code || '';

  const errorTranslations: Record<string, string> = {
    'Invalid login credentials': 'Email ou mot de passe incorrect',
    'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
    'User already registered': 'Un compte existe déjà avec cet email',
    'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
    'Unable to validate email address: invalid format': 'Format d\'email invalide',
    'Email rate limit exceeded': 'Trop de tentatives. Veuillez réessayer dans quelques minutes',
    'Signup requires a valid password': 'Veuillez entrer un mot de passe valide',
    'User not found': 'Aucun compte trouvé avec cet email',
    'Invalid email or password': 'Email ou mot de passe incorrect',
    'Email link is invalid or has expired': 'Le lien de vérification a expiré',
    'Token has expired or is invalid': 'Le code de vérification a expiré ou est invalide',
    'New password should be different from the old password': 'Le nouveau mot de passe doit être différent de l\'ancien',
    'Password is too weak': 'Le mot de passe est trop faible',
    'Only an email address or phone number should be provided': 'Veuillez fournir seulement un email',
  };

  const codeTranslations: Record<string, string> = {
    'email_exists': 'Un compte existe déjà avec cet email',
    'weak_password': 'Le mot de passe est trop faible',
    'invalid_credentials': 'Email ou mot de passe incorrect',
    'email_not_confirmed': 'Email non confirmé',
    'user_not_found': 'Utilisateur introuvable',
    'rate_limit': 'Trop de tentatives. Réessayez plus tard',
    'invalid_grant': 'Email ou mot de passe incorrect',
    'network_error': 'Erreur de connexion. Vérifiez votre connexion internet',
  };

  for (const [key, translation] of Object.entries(errorTranslations)) {
    if (errorMessage.includes(key)) {
      return translation;
    }
  }

  if (errorCode && codeTranslations[errorCode]) {
    return codeTranslations[errorCode];
  }

  if (errorMessage.toLowerCase().includes('password')) {
    return 'Problème avec le mot de passe';
  }

  if (errorMessage.toLowerCase().includes('email')) {
    return 'Problème avec l\'adresse email';
  }

  if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('fetch')) {
    return 'Erreur de connexion. Vérifiez votre connexion internet';
  }

  if (errorMessage.toLowerCase().includes('database error') || errorMessage.toLowerCase().includes('database')) {
    return 'Erreur lors de la création du compte. Veuillez réessayer';
  }

  if (errorMessage.toLowerCase().includes('trigger') || errorMessage.toLowerCase().includes('function')) {
    return 'Erreur système. Veuillez réessayer ou contacter le support';
  }

  return errorMessage || 'Une erreur est survenue. Veuillez réessayer';
};
