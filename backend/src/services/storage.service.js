import ImageKit from '@imagekit/nodejs';
import { config } from '../config/config.js';

const client = new ImageKit({
    privateKey: config.IMAGE_KIT_PRIVATE_KEY,
    publicKey: config.IMAGE_KIT_PUBLIC_KEY,
    urlEndpoint: config.IMAGE_KIT_URL_ENDPOINT,
});


export async function uploadFile({ buffer, fileName, folder = "snitch" }) {
    const result = await client.files.upload({
        file: await ImageKit.toFile(buffer),
        fileName,
        folder
    })

    return result
}