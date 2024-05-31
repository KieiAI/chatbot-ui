import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

// .envファイルで設定した環境変数をfirebaseConfigに入れる
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY,
  authDomain: process.env.NEXT_PUBLIC_AUTHDOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECTID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGEBUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGINGSENDERID,
  appId: process.env.NEXT_PUBLIC_APPID,
}

let firebaseApp: FirebaseApp
let auth: Auth
let firestore: Firestore
let storage: FirebaseStorage

// サーバーサイドでレンダリングするときにエラーが起きないようにするための記述
if (typeof window !== 'undefined' && !getApps().length) {
  firebaseApp = initializeApp(firebaseConfig)
  auth = getAuth(firebaseApp)
  firestore = getFirestore(firebaseApp)
  storage = getStorage(firebaseApp)
  if (process.env.NEXT_PUBLIC_NAMESPACE === 'test') {
    console.log('Dev環境のデータを参照しています')
  }
}

export default class StorageRepository {
  async uploadFileAndGetUrl(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path)
      // await uploadBytes(storageRef, file)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async deleteFile(path: string): Promise<void> {
    const storageRef = ref(storage, path)
    await deleteObject(storageRef).catch((e) => {
      throw new Error(e.message)
    })
  }
}
