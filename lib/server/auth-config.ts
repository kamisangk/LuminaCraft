import authConfigFile from '@/data/auth.json';

type AuthConfigFile = {
  jwtSecret?: string;
  ownerPassword?: string;
};

type AuthRuntimeConfig = {
  jwtSecret: string;
  ownerPassword: string;
};

function readString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function getAuthRuntimeConfig(): AuthRuntimeConfig {
  const config = authConfigFile as AuthConfigFile;
  const jwtSecret = readString(config.jwtSecret);
  const ownerPassword = readString(config.ownerPassword);

  if (!jwtSecret) {
    throw new Error('Missing jwtSecret in data/auth.json');
  }

  if (!ownerPassword) {
    throw new Error('Missing ownerPassword in data/auth.json');
  }

  return {
    jwtSecret,
    ownerPassword,
  };
}

export function getJwtSecretBytes() {
  return new TextEncoder().encode(getAuthRuntimeConfig().jwtSecret);
}
