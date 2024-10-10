import { Amplify } from 'aws-amplify';
import { signInWithRedirect, SignInWithRedirectInput, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { downloadData, uploadData } from 'aws-amplify/storage';
import AWS from 'aws-sdk'
export class AmplifyWrrapper {
  constructor(config: any) {
    Amplify.configure(config);
  }
  //type AuthProvider = 'Amazon' | 'Apple' | 'Facebook' | 'Google'; is not exported
  async signIn(provider: SignInWithRedirectInput["provider"]) {
    try {
      await signInWithRedirect({provider});
      console.log('Successfully signed in with Google');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }

  async signOut() {
    await signOut();
  }

  async getSession() {
    return await fetchAuthSession();
  }

  @synchronized
  async upload(region: string, bucket: string, fileName: string, body: string) {
    const defaultConfig = Amplify.getConfig();
    Amplify.configure({
      ...defaultConfig,
      Storage: {
        S3: {
          region,
          bucket
        }
      }
    })
    const result = await uploadData({
      path: (user) => `users/${user.identityId}/${fileName}`,
      data: body,
    }).result
    return result;
  }

  @synchronized
  async get(region: string, bucket: string, fileName: string) {
    const defaultConfig = Amplify.getConfig();
    Amplify.configure({
      ...defaultConfig,
      Storage: {
        S3: {
          region,
          bucket
        }
      }
    })
    const result = await downloadData({
      path: (user) => `users/${user.identityId}/${fileName}`
    }).result
    const body = await result.body.text();
    return body;
  }
}

function synchronized(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  let isLocked = false;

  descriptor.value = async function(...args: any[]) {
    if (isLocked) {
      while (isLocked) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    isLocked = true;
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } finally {
      isLocked = false;
    }
  };

  return descriptor;
}
