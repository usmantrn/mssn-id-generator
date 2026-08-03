import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const processMemberPhoto = async (imageUrl, memberId) => {
  // If it's already a Cloudinary image, don't re-process
  if (imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(imageUrl, {
      public_id: `mssn_member_${memberId}`,
      folder: 'mssn_id_cards',
      overwrite: true,
      background_removal: 'cloudinary_ai',
      transformation: [
        { gravity: 'face', crop: 'thumb', width: 400, height: 500 } // Auto face crop to passport ratio
      ]
    }, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return reject(error);
      }

      // Poll until background removal is complete
      let attempts = 0;
      const pollTimer = setInterval(async () => {
        attempts++;
        try {
          const resource = await cloudinary.api.resource(result.public_id);
          const status = resource.info?.background_removal?.cloudinary_ai?.status;
          
          // 'complete' means AI finished removing it. 'failed' means it failed but we still use the cropped one.
          if (status === 'complete' || status === 'failed' || attempts > 20) {
            clearInterval(pollTimer);
            
            // Construct the final URL with a white background replacement
            const finalUrl = cloudinary.url(result.public_id, {
              background: 'white',
              secure: true
            });
            resolve(finalUrl);
          }
        } catch (err) {
          console.error('Polling error:', err);
          if (attempts > 20) {
            clearInterval(pollTimer);
            resolve(result.secure_url);
          }
        }
      }, 1500); // Poll every 1.5 seconds
    });
  });
};
