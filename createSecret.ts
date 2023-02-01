import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import * as fs from 'fs';
import { SecretKeys } from './secretKeys';

const client = new SecretManagerServiceClient({
  keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const initGoogleSecretManager = async () => {
  const environment = process.env.NODE_ENV ?? 'development';

  try {
    const SecretKeysArray = Object.keys(SecretKeys).map((item) => {
      const key = item as string;
      const element = SecretKeys[key];
      if (typeof element === 'string') {
        return { name: key, value: element };
      } else {
        return { name: key, value: element[environment] };
      }
    });
    await Promise.all(SecretKeysArray.map((item) => getSecret(item))).then(
      async (values) => {
        const result = values.map((item) => {
          return `${item.name}=${item.value}`;
        });
        await fs.writeFileSync(`.env.${environment}`, result.join('\n'));
      },
    );
  } catch (error) {
    console.log('initGoogleSecretManager:::', error);
  }
};
const getSecret = (item: {
  value: string;
  name: string;
}): Promise<{ name: string; value: string }> => {
  return new Promise(async (resolve) => {
    const [secret] = await client.accessSecretVersion({
      name: `projects/chatting-376112/secrets/${item.value}/versions/latest`,
    });
    resolve({
      name: item.name,
      value: secret?.payload?.data?.toString() || '',
    });
  });
};
initGoogleSecretManager();
export { initGoogleSecretManager };
