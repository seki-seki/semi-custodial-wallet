import { Amplify } from 'aws-amplify';
import { signInWithRedirect, SignInWithRedirectInput, fetchAuthSession, signOut } from 'aws-amplify/auth';
import { uploadData } from 'aws-amplify/storage';
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
  async upload(region: string, bucket: string, fileName: string, body: string) {
    const defaultConfig = Amplify.getConfig();
    const session = await this.getSession();
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
      path: `users/${session.userSub}/${fileName}`,
      data: body
    }).result
  }
}
